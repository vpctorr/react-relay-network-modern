function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/* eslint-disable import/prefer-default-export, no-param-reassign */
class MockReq {
  constructor(reqid, reqData = {}) {
    this.reqid = reqid || Math.random().toString();
    this.reqData = reqData;
  }
  getID() {
    return this.reqid;
  }
  getQueryString() {
    return this.reqData.query || '';
  }
  getDebugName() {
    return `debugname${this.reqid}`;
  }
  getVariables() {
    return this.reqData.variables || {};
  }
  getFiles() {
    return this.reqData.files;
  }
  reject(err) {
    this.error = err;
  }
  resolve(resp) {
    this.payload = resp;
  }
  execute(rnl) {
    const text = this.getQueryString() || '';
    const operationKind = text.startsWith('mutation') ? 'mutation' : 'query';
    const operation = {
      id: this.getID(),
      text,
      operationKind
    };
    const variables = this.getVariables() || {};
    const cacheConfig = this.reqData.cacheConfig || {};
    const uploadables = this.getFiles();
    const res = rnl.fetchFn(operation, variables, cacheConfig, uploadables);
    const promise = new Promise((resolve, reject) => {
      res.subscribe({
        complete: () => {},
        error: error => reject(error),
        next: value => resolve(value)
      });
    });

    // avoid unhandled rejection in tests
    promise.catch(() => {});

    // but allow to read rejected response
    return promise;
  }
}
export function mockReq(reqid, data) {
  return new MockReq(reqid ? reqid.toString() : undefined, data);
}
export function mockMutationReq(reqid, data) {
  return new MockReq(reqid ? reqid.toString() : undefined, _objectSpread({
    query: 'mutation {}'
  }, data));
}
export function mockFormDataReq(reqid, data) {
  return new MockReq(reqid ? reqid.toString() : undefined, _objectSpread({
    files: {
      file1: 'data'
    }
  }, data));
}
export function mockReqWithSize(reqid, size) {
  return mockReq(reqid, {
    query: `{${'x'.repeat(size)}}`
  });
}
export function mockReqWithFiles(reqid) {
  return mockReq(reqid, {
    files: {
      file1: 'data',
      file2: 'data'
    }
  });
}