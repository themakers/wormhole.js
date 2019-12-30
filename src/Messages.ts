import {WORMHOLE_TYPE_CALL, WORMHOLE_TYPE_RESULT, WORMHOLE_VERSION} from "./constraints";

export class CallMessage {
  public payload: string;
  public id: string;
  public ref: string;

  constructor({id, ref, payload}: any = {}) {
    this.id = id;
    this.ref = ref;
    this.payload = payload;
  }

  public encode() {
    return [
      WORMHOLE_VERSION,
      WORMHOLE_TYPE_CALL,
      this.id,
      this.ref,
      this.payload,
    ];
  }

  public decode(message) {
    this.id = message[2];
    this.ref = message[3];
    this.payload = message[4];
    return this;
  }

  get type() {
    return WORMHOLE_TYPE_CALL;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ResultMessage {
  public payload: string;
  public id: string;
  public ref: string;

  constructor({id, ref, payload}: any = {}) {
    this.id = id;
    this.ref = ref;
    this.payload = payload;
  }

  public encode() {
    return [
      WORMHOLE_VERSION,
      WORMHOLE_TYPE_RESULT,
      this.id,
      this.payload,
    ];
  }

  public decode(message) {
    this.id = message[2];
    this.payload = message[3];
    return this;
  }

  get type() {
    return WORMHOLE_TYPE_RESULT;
  }
}
