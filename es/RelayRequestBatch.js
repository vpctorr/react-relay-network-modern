function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import RRNLError from './RRNLError';
export default class RelayRequestBatch {
  constructor(requests) {
    this.requests = requests;
    this.fetchOpts = {
      method: 'POST',
      headers: {},
      body: this.prepareBody()
    };
  }
  setFetchOption(name, value) {
    this.fetchOpts[name] = value;
  }
  setFetchOptions(opts) {
    this.fetchOpts = _objectSpread(_objectSpread({}, this.fetchOpts), opts);
  }
  getBody() {
    if (!this.fetchOpts.body) {
      this.fetchOpts.body = this.prepareBody();
    }
    return this.fetchOpts.body || '';
  }
  prepareBody() {
    return `[${this.requests.map(r => r.getBody()).join(',')}]`;
  }
  getIds() {
    return this.requests.map(r => r.getID());
  }
  getID() {
    return `BATCH_REQUEST:${this.getIds().join(':')}`;
  }
  isMutation() {
    return false;
  }
  isFormData() {
    return false;
  }
  clone() {
    // $FlowFixMe
    const newRequest = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    newRequest.fetchOpts = _objectSpread({}, this.fetchOpts);
    newRequest.fetchOpts.headers = _objectSpread({}, this.fetchOpts.headers);
    return newRequest;
  }
  getVariables() {
    throw new RRNLError('Batch request does not have variables.');
  }
  getQueryString() {
    return this.prepareBody();
  }
}