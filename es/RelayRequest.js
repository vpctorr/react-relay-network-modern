function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import RRNLError from './RRNLError';
function getFormDataInterface() {
  return typeof window !== 'undefined' && window.FormData || global && global.FormData;
}
export default class RelayRequest {
  constructor(operation, variables, cacheConfig, uploadables) {
    this.operation = operation;
    this.variables = variables;
    this.cacheConfig = cacheConfig;
    this.uploadables = uploadables;
    this.id = this.operation.id || this.operation.name || this._generateID();
    const fetchOpts = {
      method: 'POST',
      headers: {},
      body: this.prepareBody()
    };
    this.controller = typeof window !== 'undefined' && window.AbortController ? new window.AbortController() : null;
    if (this.controller) fetchOpts.signal = this.controller.signal;
    this.fetchOpts = fetchOpts;
  }
  getBody() {
    return this.fetchOpts.body;
  }
  prepareBody() {
    const {
      uploadables
    } = this;
    if (uploadables) {
      const _FormData_ = getFormDataInterface();
      if (!_FormData_) {
        throw new RRNLError('Uploading files without `FormData` interface does not supported.');
      }
      const formData = new _FormData_();
      formData.append('id', this.getID());
      formData.append('query', this.getQueryString());
      formData.append('variables', JSON.stringify(this.getVariables()));
      Object.keys(uploadables).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
          formData.append(key, uploadables[key]);
        }
      });
      return formData;
    }
    return JSON.stringify({
      id: this.getID(),
      query: this.getQueryString(),
      variables: this.getVariables()
    });
  }
  getID() {
    return this.id;
  }
  _generateID() {
    if (!this.constructor.lastGenId) {
      this.constructor.lastGenId = 0;
    }
    this.constructor.lastGenId += 1;
    return this.constructor.lastGenId.toString();
  }
  getQueryString() {
    return this.operation.text || '';
  }
  getVariables() {
    return this.variables;
  }
  isMutation() {
    return this.operation.operationKind === 'mutation';
  }
  isFormData() {
    const _FormData_ = getFormDataInterface();
    return !!_FormData_ && this.fetchOpts.body instanceof _FormData_;
  }
  cancel() {
    if (this.controller) {
      this.controller.abort();
      return true;
    }
    return false;
  }
  clone() {
    // $FlowFixMe
    const newRequest = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    newRequest.fetchOpts = _objectSpread({}, this.fetchOpts);
    newRequest.fetchOpts.headers = _objectSpread({}, this.fetchOpts.headers);
    return newRequest;
  }
}