import {UseCase} from './UseCase';

//You can do enums without strings but hard to debug... you just see number values.
export enum UseCaseResultType {
  START = "START",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  PROGRESS = "PROGRESS",
  CANCELLED = "CANCELLED"
}

interface UseCaseResultOptions {
  type: string
  useCase?: UseCase,
  data?: any,
  resultType: UseCaseResultType,
  rejectionReason?: any
}

export type UseCaseResult = {
  type: string
  useCase?: UseCase,
  data?: any,
  rejectionReason?: any,
  resultType: UseCaseResultType,
  success(): boolean,
  failure(): boolean,
  start(): boolean,
  progress(): boolean,
  cancelled(): boolean
}

export function UseCaseResult(options: UseCaseResultOptions):UseCaseResult{

  return {

    type: options.type,
    useCase: options.useCase,
    data: options.data,
    rejectionReason: options.rejectionReason,
    resultType: options.resultType,

    success(){
      return options.resultType === UseCaseResultType.SUCCESS;
    },

    failure(){
      return options.resultType === UseCaseResultType.FAILURE;
    },

    start(){
      return options.resultType === UseCaseResultType.START;
    },

    progress(){
      return options.resultType === UseCaseResultType.PROGRESS;
    },

    cancelled(){
      return options.resultType === UseCaseResultType.CANCELLED;
    }

  };

}