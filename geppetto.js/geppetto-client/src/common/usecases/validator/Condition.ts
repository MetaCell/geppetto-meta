import { RuleResult } from './RuleResult';

class ConditionSchema {
  public check: Function;
  public failMessage: string;
}

export class Condition extends ConditionSchema {

  constructor(args:ConditionSchema){
    super();
    Object.assign(this, args);
  }

  public static evaluate(state:object, conditions:Condition[]) {
    const len = conditions.length;
    let i = 0;

    for (; i < len; i++) {
      if (!conditions[i].check(state)) {
        return RuleResult.notAllowed(conditions[i]);
      }
    }

    return RuleResult.allowed();
  }

}