import childProcess from 'child-process-es6-promise'
import args from 'minimist'
import { Utils } from './Utils'

/**
* Description:
*   ホスト側のDockerを使ってコンテナを扱う
* Commands:
*   docker ps - 起動中のコンテナを表示する
*     --all 全て表示する
*   docker run :image|:giturl - イメージを立ち上げる
*     --tmp 1日だけ立ち上げる
*     --detach 起動時にホストを表示しない
*     --git
*   docker halt :containerID - 指定したコンテナを落とす(停止・削除)
*   docker clean - 起動していないコンテナを全て削除
*/
const containerId = process.env.HOSTNAME;
const hostUrl = process.env.HUBOT_MAID_HOST_URL;

export default function(robot) {

  robot.respond(/docker ps/, msg => {
    const params = args(Utils.argString(robot, 'docker ps', msg.message.text), {
      alias: {
        a: 'all'
      }
    });

    msg.send(`${params.all ? '全ての' : ''}起動中のDockerコンテナを取得しますね`);
    childProcess.exec(`docker ps ${params.all ? '-a' : ''} | grep -v "${containerId}"`)
      .then(result => {
        msg.send(result.stdout);
      })
      .catch(error => {
        msg.send(error);
      });
  });

  robot.respond(/docker run (.+)/, msg => {
    const params = args(Utils.argString(robot, 'docker run', msg.message.text), {
      alias: {
        d: 'detach'
      }
    });

    const imageName = params['_'][0];
    msg.send(`${imageName}を起動します`);

    let command = 'docker run -P -d';

    const containerNameBase = `${msg.message.user.name}_${imageName.replace(/\//, '_')}`;
    const containerName = params.tmp ? `tmp_${containerNameBase}` : containerNameBase;
    command = command.concat(` --name ${containerName}`);

    childProcess.exec(`${command} ${imageName}`)
      .then(() => childProcess.exec(`docker port ${containerName}`))
      .then(result => {
        msg.send('コンテナを起動しました！');
        if (!params.detach) {
          const port = result.stdout.match(/:[0-9]+/);
          const url = `${hostUrl}${port}`;
          msg.send(`接続先のURLはこちらです ${url}`);
        }
      })
      .catch(error => {
        msg.send(error);
      });
  })
}
