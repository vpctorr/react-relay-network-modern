function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/* eslint-disable no-console */
import RelayRequest from '../RelayRequest';
import RelayRequestBatch from '../RelayRequestBatch';
export default function loggerMiddleware(opts) {
  const logger = opts && opts.logger || console.log.bind(console, '[RELAY-NETWORK]');
  return next => req => {
    const start = new Date().getTime();
    logger(`Run ${req.getID()}`, req);
    return next(req).then(res => {
      const end = new Date().getTime();
      let queryId;
      let queryData;
      if (req instanceof RelayRequest) {
        queryId = req.getID();
        queryData = {
          query: req.getQueryString(),
          variables: req.getVariables()
        };
      } else if (req instanceof RelayRequestBatch) {
        queryId = req.getID();
        queryData = {
          requestList: req.requests,
          responseList: res.json
        };
      } else {
        queryId = 'CustomRequest';
        queryData = {};
      }
      logger(`Done ${queryId} in ${end - start}ms`, _objectSpread(_objectSpread({}, queryData), {}, {
        req,
        res
      }));
      if (res.status !== 200) {
        logger(`Status ${res.status}: ${res.statusText || ''} for ${queryId}`);
      }
      return res;
    }, error => {
      if (error && error.name && error.name === 'AbortError') {
        logger(`Cancelled ${req.getID()}`);
      }
      throw error;
    });
  };
}