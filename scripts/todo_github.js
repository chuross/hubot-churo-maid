import { OptionParser } from './optionParser'
import axios from 'axios'


/**
* Description:
*   GithubによるTodo管理
* Commands:
*   todo [-today] - タスク一覧を表示
*   todo create :title [-l=優先度低, -h=優先度高] - 指定タイトルでタスクを作る
*   todo done :issue_id - 指定IDのタスクを終了する
*/
const githubUrl = process.env.HUBOT_MAID_GITHUB_URL;

export default function(robot) {

  robot.respond(/todo|todo (.*)/i, msg => {
    const params = OptionParser.parse([
      ['-a', '--all'],
      ['-n', '--name STRING']
    ], msg.message.text.split(' '));

    const targetUser = params.name || msg.message.user.name;

    const url = `${githubUrl}/repos/${targetUser}/todo/issues`;
    axios.get(url)
      .then(response => {
        msg.send('仕事はこちらです！');
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  });
}
