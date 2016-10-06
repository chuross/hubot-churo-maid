import childProcess from 'child-process-es6-promise'
import axios from 'axios'
import fs from 'fs-promise'

/**
* Description:
*   GithubをフックしてビルドしたAPKをPRにリンクを貼る
*/
const githubToken = process.env.HUBOT_MAID_GITHUB_TOKEN;
const githubHeader = { headers: { Authorization: `token ${githubToken}` } }
const deploygateOwner = process.env.HUBOT_MAID_DEPLOYGATE_OWNER;
const deploygateToken = process.env.HUBOT_MAID_DEPLOYGATE_TOKEN;
const deploygateUrl = `https://deploygate.com/api/users/${deploygateOwner}/apps`;
const outputsVolumePath = process.env.HUBOT_MAID_OUTPUTS_VOLUME_PATH;
const outputsPath = process.env.HUBOT_MAID_OUTPUTS_PATH || 'app/build/outputs/apk';
const components = process.env.HUBOT_MAID_COMPONENTS;
const apkFileName = process.env.HUBOT_MAID_APK_FILE_NAME;
const buildFlavor = process.env.HUBOT_MAID_BUILD_FLAVOR || 'Debug';

export default function(robot) {

  /**
  * Githubからのprをフックして関連リンクを作る
  */
  robot.router.post('/github/deploygate/hook', (req, res) => {
    if (req.get('X-GitHub-Event') == 'ping') {
      res.status(200).end();
      return;
    }

    const pullRequest = req.body.pull_request;
    const repository = req.body.repository;

    if (!pullRequest || !repository) {
      res.status(400).send('invalid event.').end();
      return;
    }

    childProcess.exec(`docker run
          -v ${outputsVolumePath}:/outputs
          -e GIT_URL=${repository.clone_url.replace(/:\/\//, `://${githubToken}@`)}
          -e GIT_BRANCH=refs/pull/${pullRequest.id}/merge:
          -e GRADLE_OUTPUTS_PATH=${outputsPath}
          -e GRADLE_ASSEMBLE_COMMAND=assemble${buildFlavor.charAt(0).toUpperCase() + buildFlavor.slice(1)}
          -e ANDROID_COMPONENTS=${components}
          chuross/android-java7:git
        `)
      .then(result => fs.readFile(file(`${outputsPath}/${apkFileName}`, { encoding: 'utf8' })))
      .then(result => axios.post(deploygateUrl, {
        token: deploygateToken,
        file: result,
        message: `PullRequest:${repository.name}#${pullRequest.id}`
      }, {
        'content-type': 'multipart/form-data'
      }))
      .then(deploygateResponse => axios.post(pullRequest.statuses_url, {
          state: 'success',
          target_url: response.results.file
        }, githubHeader)
        .then(statusesResponse => deploygateResponse))
      .then(result => {
        robot.emit('slack.attachment', {
          content: {
            color: 'good',
            title: `APK build #${pullRequest.id} ${pullRequest.title}`,
            title_link: pullRequest.issue_url,
            author_name: pullRequest.user.login,
            author_icon: pullRequest.user.avatar_url,
            footer: 'maid-bot by chuross'
          }
        });
        res.end();
      }).catch(err => {
        console.log(`web hook error! ${err}`);
        res.end()
      });
  });
}
