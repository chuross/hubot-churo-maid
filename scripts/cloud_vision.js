import axios from 'axios'
import args from 'minimist'
import base64 from 'base64-arraybuffer'
import { Utils } from './Utils'

/**
* Description:
*   CloudVisionを使った
* Commands:
*   judge [IMAGE_URL]: CloudVisionを使ってエロ判定する
*/
const visionUrl = 'https://vision.googleapis.com/v1/images:annotate';
const visionKey = process.env.HUBOT_MAID_CLOUDVISION_KEY;

export default function(robot) {

  robot.respond(/judge (.+)/, msg => {
    msg.send('拝見します！');

    const params = args(Utils.argString(robot, 'judge', msg.message.text));
    const url = params['_'][0];

    axios.get(url, { responseType: 'arraybuffer'})
    .then(response => base64.encode(response.data))
    .then(bytes => axios.post(`${visionUrl}?key=${visionKey}`, null, {
      headers: { 'Content-Type': 'application/json' },
      data: {
       requests: [{
           image: { content: bytes },
           features: [{
               type: 'SAFE_SEARCH_DETECTION',
               maxResults: 3
             }]
         }]
       },
      transformRequest: [ data => JSON.stringify(data) ]
    }))
    .then(result => result.data.responses[0].safeSearchAnnotation)
    .then(result => {
      const adult = result['adult'];
      const violence = result['violence'];
      msg.send(`これはエッチ...${getAnnotateImageMessage(adult)}`);
      msg.send(`これは暴力的...${getAnnotateImageMessage(violence)}`);
    })
    .catch(err => {
      msg.send('拝見できませんでした...');
      Utils.error(msg)(err);
    });
  });
}

function getAnnotateImageMessage(annotateImageResponse) {
  return {
    'VERY_UNLIKELY': 'ではないと思います！',
    'UNLIKELY': 'まだ許容範囲だと思います！',
    'POSSIBLE': '少し悩んじゃいますね...',
    'LIKELY': 'だと思います！',
    'VERY_LIKELY': 'だと思います！絶対ダメ！'
  }[annotateImageResponse];
}
