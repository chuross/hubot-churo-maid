import axios from 'axios'
import { OptionParser } from './optionParser'
import { Utils } from './Utils'


/**
* Description:
*   GithubによるTodo管理
* Commands:
*   todo [-today] - タスク一覧を表示
*   todo create :title [-l=優先度低, -h=優先度高] - 指定タイトルでタスクを作る
*   todo done :issue_id - 指定IDのタスクを終了する
*/
const githubUrl = process.env.HUBOT_MAID_GITHUB_URL;
const githubToken = process.env.HUBOT_MAID_GITHUB_TOKEN;

export default function(robot) {

  robot.respond(/todo|今日の仕事は？/i, msg => {
    const params = OptionParser.parse([
      ['-a', '--all'],
      ['-n', '--name STRING']
    ], msg.message.text.split(' '));

    const userName = params.name || msg.message.user.name;

    const url = `${githubUrl}/repos/${userName}/todo/issues`;
    axios.get(url).then(response => {
        msg.send('今日の仕事はこちらになります');
        response.data.forEach(issue => {
          msg.send(`#${issue.number} *<${issue.url}|${issue.title}>*`);
        });
      }).catch(Utils.error(msg));
  });

  robot.respond(/todo create (.*)/i, msg => {
    const text = msg.message.text;

    const params = OptionParser.parse([
      ['-n', '--name STRING'],
      ['-p', '--priority STRING'],
      ['-d', '--doing']
    ], text.split(' '));

    const title = text.split(' ')[3];
    const userName = params.name || msg.message.user.name;
    const priority = params.priority || 'high';
    const labels = params.doing ? [priority, 'doing'] : [priority];

    const url = `${githubUrl}/repos/${userName}/todo/issues`;
    axios.post(url, {
      title: title,
      labels: labels
    }, {
      headers: {
        Authorization: `token ${githubToken}`
      }
    }).then(response => {
      msg.send('仕事を追加しました！');
    }).catch(Utils.error(msg));
  });
}
