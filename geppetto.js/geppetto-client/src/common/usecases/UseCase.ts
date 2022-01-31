import { RuleResult } from './validator/RuleResult'

export type UseCase = {
  type: string,
  run: Function,
  checkConditions?(state:any, options?:any): RuleResult,
  checkValidators?(options?:any): RuleResult,
  meta?: any
}