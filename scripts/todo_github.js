import axios from 'axios'
import { OptionParser } from './optionParser'
import { Utils } from './Utils'


/**
* Description:
*   GithubによるTodo管理
* Commands:
*   todo list [-a 全部表示, -n 名前] - タスク一覧を表示
*   todo create :title [-l 優先度低, -n 名前] - 指定タイトルでタスクを作る
*   todo done :issue_id [-n 名前] - 指定IDのタスクを終了する
*/
const githubUrl = process.env.HUBOT_MAID_GITHUB_URL;
const githubToken = process.env.HUBOT_MAID_GITHUB_TOKEN;
const githubHeader = { headers: { Authorization: `token ${githubToken}` } }

export default function(robot) {

  robot.respond(/todo list|今日の仕事/i, msg => {
    const params = OptionParser.parse([
      ['-a', '--all'],
      ['-n', '--name STRING']
    ], msg.message.text.split(' '));

    const userName = params.name || msg.message.user.name;
    const query = params.all ? {} : { labels: 'high' }

    const url = `${githubUrl}/repos/${userName}/todo/issues`;
    axios.get(url, {
      params: query
    }).then(response => {
      msg.send('残りの仕事です');
      response.data.forEach(issue => {
        msg.send(`#${issue.number} *<${issue.url}|${issue.title}>*`);
      });
    }).catch(Utils.error(msg));
  });

  robot.respond(/todo create (.*)/i, msg => {
    const text = msg.message.text;

    const params = OptionParser.parse([
      ['-n', '--name STRING'],
      ['-l', '--low'],
    ], text.split(' '));

    const title = text.split(' ')[3];
    const userName = params.name || msg.message.user.name;
    const priority = params.low ? 'low' : 'high';

    const url = `${githubUrl}/repos/${userName}/todo/issues`;
    axios.post(url, {
      title: title,
      labels: [priority]
    }, githubHeader).then(response => {
      const issue = response.data;
      msg.send('仕事を追加しました！');
      msg.send(`#${issue.number} *<${issue.url}|${issue.title}>*`);
    }).catch(Utils.error(msg));
  });

  robot.respond(/todo done (.*)/i, msg => {
    const text = msg.message.text;

    const params = OptionParser.parse([
      ['-n', '--name STRING']
    ], msg.message.text.split(' '));

    const userName = params.name || msg.message.user.name;
    const issueId = text.split(' ')[3];

    const url = `${githubUrl}/repos/${userName}/todo/issues/${issueId}`;
    axios.patch(url, {
      state: 'closed'
    }, githubHeader).then(response => {
      msg.send('タスクを閉じます。おつかれさまでした！');
    }).catch(Utils.error(msg));
  });
}
