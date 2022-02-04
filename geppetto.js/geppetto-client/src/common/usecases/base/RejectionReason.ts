class RejectionReasonSchema {
  Primary: string;
  Secondary?: any[]; //An array of strings
  userMessage?: string;
  UserMessage?: string;
  Data?: any;
}

export class RejectionReason extends RejectionReasonSchema {
  constructor(args:RejectionReasonSchema = { Primary: 'Unknown', Secondary: [] }) {
    super();

    //TODO: Eliminate
    if(args.userMessage){
      console.log('RejectionReason userMessage is depreciated.  Use UserMessage (casing).  See trace for usage.');
      args.UserMessage = args.userMessage;
      console.trace();
    }

    Object.assign(this, args);
  }

  appendSecondaryCause(cause) {
    this.Secondary.push(cause);
  }

  was(cause) {
    return (this.Primary === cause)
  }

  hasUserMessage () {
    return !!(this.UserMessage);
  }

  asObject() {
    return {
      Primary: this.Primary,
      Secondary: this.Secondary
    };
  }

  //Convenience method to check if a rejected promise reason (string, error, RejectionReason) was a reason
  //i.e. RejectionReason.was(reason, RejectKey.CANCELLED);
  static was (possibleRejectionReason:any, reason:any){
    if(possibleRejectionReason && possibleRejectionReason instanceof RejectionReason)
      return (possibleRejectionReason.was.bind(possibleRejectionReason, reason));

    return possibleRejectionReason === reason;
  }

  //Shortcut for creating CANCELLED rejection reason
  static CANCELLED (args:any = { Primary: RejectKey.CANCELLED, Secondary: [] }):RejectionReason{
    return new RejectionReason(args);
  }

  //Shortcut for taking a rejected "reason" (string, error, RejectionReason)
  //and returning a promise rejection with a RejectionReason instance
  static withSecondaryCause (possibleRejectionReason:RejectionReason, secondaryCause:string){
    var rejectionReason = RejectionReason.appendCause(possibleRejectionReason, secondaryCause);
    return Promise.reject(rejectionReason);
  }

  //Shortcut for taking a rejected "reason" (string, error, RejectionReason) and appending a secondary cause
  //Returns RejectionReason
  static appendCause ( possibleRejectionReason, cause:string):RejectionReason {
    let rejectionReason;

    if(!possibleRejectionReason) {
      rejectionReason = new RejectionReason({Primary: cause});
    }
    else if(possibleRejectionReason instanceof RejectionReason){
      rejectionReason = possibleRejectionReason;
      rejectionReason.appendSecondaryCause(cause);
    }
    else{
      rejectionReason = new RejectionReason({
        Primary: possibleRejectionReason,
        Secondary: [cause]
      });
    }

    return rejectionReason;
  }

}

//Primary reasons, IDE friendly
export enum RejectKey {
  INVALID_API_RESPONSE = 'INVALID_API_RESPONSE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CANCELLED = 'CANCELLED'
}
