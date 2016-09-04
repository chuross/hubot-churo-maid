export class Utils {

  static error(msg) {
    return error => {
      msg.send(`
        status: ${error.response.status},
        message: ${error.response.data.message}
      `);
    }
  }
}
