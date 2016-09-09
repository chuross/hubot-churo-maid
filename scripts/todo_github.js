import axios from 'axios'
import args from 'minimist'
import { Utils } from './Utils'

/**
* Description:
*   GithubによるTodo管理
* Commands:
*   todo [-a 全部表示, -n 名前] - タスク一覧を表示
*   todo add :title [-l 優先度低, -n 名前] - 指定タイトルでタスクを作る
*   todo done :issue_id [-n 名前] - 指定IDのタスクを終了する
*/
const githubUrl = process.env.HUBOT_MAID_GITHUB_URL || 'https://api.github.com';
const githubToken = process.env.HUBOT_MAID_GITHUB_TOKEN;
const githubHeader = { headers: { Authorization: `token ${githubToken}` } }

export default function(robot) {

  robot.respond(/todo$|todo -(.*)/i, msg => {
    const params = args(Utils.argString(robot, 'todo', msg.message.text), {
      alias: {
        n: 'name',
        a: 'all'
      }
    });

    const userName = params.name || msg.message.user.name;
    const query = params.all ? {} : { labels: 'high' }

    const url = `${githubUrl}/repos/${userName}/todo/issues`;
    axios.get(url, Object.assign({
      params: query
    }, githubHeader)).then(response => {
      msg.send('今残っている仕事です！');
      response.data.forEach(issue => {
        msg.send(`・${getPriorityString(issue)} #${issue.number} *<${issue.html_url}|${issue.title}>*`);
      });
    }).catch(Utils.error(msg));
  });

  robot.respond(/todo add (.+)$/i, msg => {
    const params = args(Utils.argString(robot, 'todo add', msg.message.text), {
      alias: {
        n: 'name',
        l: 'low'
      }
    });

    const title = params['_'][0];
    const userName = params.name || msg.message.user.name;
    const priority = params.low ? 'low' : 'high';

    const url = `${githubUrl}/repos/${userName}/todo/issues`;
    axios.post(url, {
      title: title,
      labels: [priority]
    }, githubHeader).then(response => {
      const issue = response.data;
      msg.send('追加しました！お仕事頑張ってください！');
      msg.send(`${getPriorityString(issue)} #${issue.number} *<${issue.html_url}|${issue.title}>*`);
    }).catch(Utils.error(msg));
  });

  robot.respond(/todo done (.+)/i, msg => {
    const params = args(Utils.argString(robot, 'todo done', msg.message.text), {
      alias: {
        n: 'name'
      }
    });

    const userName = params.name || msg.message.user.name;
    const issueId = params['_'][0];

    const url = `${githubUrl}/repos/${userName}/todo/issues/${issueId}`;
    axios.patch(url, {
      state: 'closed'
    }, githubHeader).then(response => {
      msg.send('タスクを閉じます。おつかれさまでした！');
    }).catch(Utils.error(msg));
  });
}

function getPriorityString(issue) {
  return issue.labels.filter(label => label.name === 'high').length > 0 ? '[*優先度高*]' : '[優先度低]';
}
