import { Condition } from './Condition';

class RuleResultSchema {
  public isAllowed: boolean;
  public failMessage?: string;
}

export class RuleResult extends RuleResultSchema {

  constructor(args?:RuleResultSchema){
    super();
    Object.assign(this, { isAllowed: true }, args);
  }

  // Convenience method to instantiate like RuleResult({isAllowed:true});
  public static allowed():RuleResult {
    return new RuleResult();
  }

  // Convenience method to instantiate like RuleResult({isAllowed: false, failMessage: failMessage});
  public static notAllowed(arg:Condition|string):RuleResult {
    const failMessage = arg instanceof Condition ? arg.failMessage : arg;

    return new RuleResult({
      failMessage,
      isAllowed: false
    });
  }

}