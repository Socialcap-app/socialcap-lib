/**
 * A Community factory.
 * 
 * Use:
 * ~~~
 *  import { mainZkapp } from '../zkapps.js';
 * 
 *  const community = Community({
 *    uid: UID(uid).toString(),
 *    fullName: "This is my name !",
 *    descriptions: "We are a BIIIIIG community, join us",
 *    state: State(COMMUNITY_STATES).set("INITIAL"),
 *    // maybe other optional fields ...
 *  });  
 * 
 *  // update MINA state suin smart contracts
 *  try {
 *    const tx = await mainZkapp.updateCommunitiesState(community);
 *    // ...  
 *  }
 *  catch (err) {
 *    // ...
 *  }
 * ~~~~   
 * 
 * Because we want this struct to be Provable we must restrict its 
 * field types to any of the SnarkyJS types (Field, etc...)
 */
import { Field, Struct, Bool, CircuitString, PublicKey, Poseidon } from 'snarkyjs';
import { UID } from '../helpers/uid.js';
import { UTCDateTime } from '../helpers/datetime.js';
import { State, CommunityState } from '../helpers/states.js';
import { BigString } from '../helpers/bigstring.js';

export { Community };

const Community = (params: any) => new _Community_().fromJSON(params);


class _Community_ extends Struct({ uid: Field }) {
  accountId: PublicKey = PublicKey.empty();
  fullName: CircuitString = CircuitString.fromString("?");
  description: CircuitString = CircuitString.fromString("");
  state: CircuitString = CircuitString.fromString("INITIAL");
  createdUTC: Field = Field(0);
  updatedUTC: Field = Field(0);
  approvedUTC: Field = Field(0);
  admins: Field[] = []; // an array or Person UIDs
  validators: Field[] = []; // an array or Person UIDs
  auditors: Field[] = []; // an array or Person UIDs
  plans:  Field[] = []; // an array or ClaimPlan UIDs

  // Why not ...
  // members ? may be too large an array to include here
  // claims ? dont sure we will need them here
  // credentials ? dont sure we will need them here 

  constructor(json?: any) {
    super(json);
    this.fromJSON(json);
  }

  fromJSON(json: {
    uid: string,
    fullName?: string,
    description?: string,
    accountId?: string,
    state?: string,
    createdUTC?: string,
    approvedUTC?: string,
    updatedUTC?: string,
    validators?: string[],
    auditors?: string[],
    admins?: string[],
    plans?: string[],
  }): this {
    this.uid = Field(json.uid);
    this.accountId = asPublicKey(json.accountId, this.accountId);
    this.fullName = asCircuitString(json.fullName, this.fullName);
    this.description = asCircuitString(json.description, this.description);
    this.state = asCircuitString(json.state, this.state);
    this.approvedUTC = asField(json.approvedUTC, this.approvedUTC);
    this.createdUTC = asField(json.createdUTC, this.createdUTC);
    this.createdUTC = asField(json.updatedUTC, this.createdUTC);
    this.admins = asArray(json.admins, this.admins);
    this.validators = asArray(json.validators, this.validators);
    this.auditors = asArray(json.auditors, this.auditors);
    this.plans = asArray(json.plans, this.plans);
    return this;
  } 

  toJSON() {
    return {
      uid: this.uid.toString(),
      accountId: (this.accountId || PublicKey.empty()).toBase58(),
      fullName: this.fullName.toString(),
      description: this.description.toString(),
      state: this.state.toString(),
      approvedUTC: UTCDateTime.fromField(this.approvedUTC).toString(),
      createdUTC: UTCDateTime.fromField(this.createdUTC).toString(),
      updatedUTC: UTCDateTime.fromField(this.updatedUTC).toString(),
      admins: this.admins.map(t => (t as Field).toString()),
      validators: this.validators.map(t => (t as Field).toString()),
      auditors: this.auditors.map(t => (t as Field).toString()),
      plans: this.plans.map(t => (t as Field).toString()),
    };
  }

  hash(): Field {
    let fields: Field[] = [];
    fields = fields
      .concat(this.uid.toFields())
      .concat(this.accountId.toFields())
      .concat(this.fullName.toFields())
      .concat(this.description.toFields())
      .concat(this.state.toFields())
      .concat([this.approvedUTC, this.createdUTC, this.updatedUTC])
      .concat(this.admins as [])
      .concat(this.validators as [])
      .concat(this.auditors as [])
      .concat(this.plans as []);
    return Poseidon.hash(fields);
  }
}

function asCircuitString(s?: string, defaulted?: CircuitString): CircuitString {
  if (s === undefined) 
    return defaulted as CircuitString;
  s = (s || "").substring(0, CircuitString.maxLength-1);
  return CircuitString.fromString(s)
}

function asPublicKey(s?: string, defaulted?: PublicKey): PublicKey {
  if (s === undefined) 
    return (defaulted as PublicKey || PublicKey.empty());
  return PublicKey.fromBase58(s)
}

function asField(s?: string, defaulted?: Field): Field {
  if (s === undefined) 
    return (defaulted as Field);
  return Field(s)
}

function asArray(s?: string[], defaulted?: Field[]): Field[] {
  if (s === undefined) 
    return (defaulted as Field[]);
  return s.map(t => Field(t) as Field) as Field[];    
}
