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
const deploygateFetchUrl = process.env.HUBOT_MAID_DEPLOYGATE_FETCH_URL;
const outputsPath = process.env.HUBOT_MAID_OUTPUT_PATH;
const components = process.env.HUBOT_MAID_COMPONENTS;
const buildFlavor = process.env.HUBOT_MAID_BUILD_FLAVOR || 'assembleDebug';

export default function(robot) {

  /**
  * Githubからのprをフックして関連リンクを作る
  */
  robot.router.post('/github/deploygate/hook', (req, res) => {
    const targetChannel = req.params.slackChannel || null;

    if (!targetChannel)  {
      res.status(401).send('targetChannel is null.');
      res.end();
      return;
    }

    const pullRequest = req.body.pull_request;

    childProcess.exec(`docker run
          -v ${outputsPath}:/outputs
          -e GIT_URL=${deploygateFetchUrl}
          -e GIT_BRANCH=refs/pull/${pullRequest.id}/merge:
          -e GRADLE_ASSEMBLE_COMMAND=${buildFlavor}
          -e ANDROID_COMPONENTS=${components}
          chuross/android-java7:git
        `)
      .then(result => fs.readFile(file(outputsPath, { encoding: 'utf8' })))
      .then(result => axios.post(deploygateUrl, {
        token: deploygateToken,
        file: result,
        message: `PullRequest:${pullRequest.repo.name}#${pullRequest.id}`
      }, {
      }))
      .then(deploygateResponse => axios.post(pullRequest.statuses_url, {
          state: 'success',
          target_url: response.results.file
        }, githubHeader))
        .then(statusesResponse => deploygateResponse);
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
      }).catch(err => res.end());
  });
}
