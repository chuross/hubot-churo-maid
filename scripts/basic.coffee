#
# Commands:
#   おはよう - 朝の挨拶。今日の予定やタスク一覧を出してくれる。
module.exports = (robot) ->

  robot.respond /おはよう/, (msg) ->
    msg.send 'おはようございます！'
