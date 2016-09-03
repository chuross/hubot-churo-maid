import optparse from 'optparse'

export class OptionParser {

  static parse(rules, args) {
    const parser = new optparse.OptionParser(rules);

    let params = {};

    rules.forEach(rule => {
      const optionName = rule[1].substr(2); // remove `--`
      parser.on(optionName, () => {
        Object.assign(params, { [optionName]: true });
      });
    });

    parser.parse(args);

    return params;
  }
}
