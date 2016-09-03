import optparse from 'optparse'

export class OptionParser {

  static parse(rules, args) {
    const parser = new optparse.OptionParser(rules);

    let params = {};

    rules.forEach(rule => {
      parser.on('*', (name, value) => {
        Object.assign(params, { [name]: value || true });
      });
    });

    parser.parse(args);

    return params;
  }
}
