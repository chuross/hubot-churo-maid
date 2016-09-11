/*
* Description:
*   基本機能いろいろ
*
* Commands:
*   おはよう - 朝の挨拶
*/
export default function(robot) {

  robot.respond(/おはよう$|ping$/, msg => {
    msg.send('おはようございます！今日も1日頑張っていきましょう！');
  });
}
