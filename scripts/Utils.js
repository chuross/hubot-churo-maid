export class Utils {

  static error(msg) {
    return error => {
      msg.send(`
        status: ${error.response.status},
        message: ${error.response.data.message}
      `);
    }
  }

  static argString(robot, task, text) {
    const filter = [robot.name, `@${robot.name}`, ...task.split(' ')]
    return text.split(' ').filter(item => {
      return !filter.includes(item);
    });
  }
}
