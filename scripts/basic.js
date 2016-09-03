/*
* Commands:
*   おはよう - 朝の挨拶
*/
export default function(robot) {

  robot.respond(/おはよう/, msg => {
    msg.send('おはようございます！');
  })
}
