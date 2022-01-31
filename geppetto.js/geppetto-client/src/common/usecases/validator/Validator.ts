import { RuleResult } from './RuleResult';

class ValidatorSchema {
  public check: Function;
}

export class Validator extends ValidatorSchema {

  constructor(args:ValidatorSchema){
    super();
    Object.assign(this, args);
  }

  public static evaluate(options:any, validators:Validator[]):RuleResult {
    const len = validators.length;
    let i = 0;
    let failMessage;

    for (; i < len; i++) {
      failMessage = validators[i].check(options);

      if (failMessage) {
        return RuleResult.notAllowed(failMessage);
      }
    }

    return RuleResult.allowed();
  }

}