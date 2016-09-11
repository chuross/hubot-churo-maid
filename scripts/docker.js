import process from 'child-process-es6-promise'
import args from 'minimist'
import { Utils } from './Utils'

/**
* Description:
*   ホスト側のDockerを使ってコンテナを扱う
* Commands:
*   docker ps - 起動中のコンテナを表示する
*     --all 全て表示する
*   docker run :image - イメージを立ち上げる
*     --tmp 1日だけ立ち上げる
*     --detach 起動時にホストを表示しない
*   docker halt :containerID - 指定したコンテナを落とす(停止・削除)
*   docker build :gitUrl
*     --tmp 1日だけ立ち上げる
*     --detach 起動時にホストを表示しない
*   docker clean - 起動していないコンテナを全て削除
*/
export default function(robot) {

  robot.respond(/docker ps/, msg => {
    const params = args(Utils.argString(robot, 'docker ps', msg.message.text), {
      alias: {
        a: 'all'
      }
    })

    msg.send(`${params.all ? '全ての' : ''}起動中のDockerコンテナを取得しますね`);
    process.exec(`docker ps ${paramas.all ? '-a' : ''}`)
      .then(result => {
        msg.send(result.stdout);
      })
      .catch(error => {
        msg.send(error);
      });
  });
}
