function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Network } from 'relay-runtime';
import { streamMultipartBody } from './meros';
import RelayRequest from './RelayRequest';
import fetchWithMiddleware from './fetchWithMiddleware';
import { createRequestError } from './createRequestError';
import RRNLError from './RRNLError';
export default class RelayNetworkLayer {
  constructor(middlewares, opts) {
    this._middlewares = [];
    this._rawMiddlewares = [];
    this._middlewaresSync = [];
    this.noThrow = false;
    const mws = Array.isArray(middlewares) ? middlewares : [middlewares];
    mws.forEach(mw => {
      if (mw) {
        if (mw.execute) {
          this._middlewaresSync.push(mw.execute);
        } else if (mw.isRawMiddleware) {
          this._rawMiddlewares.push(mw);
        } else {
          this._middlewares.push(mw);
        }
      }
    });
    if (opts) {
      this.subscribeFn = opts.subscribeFn;
      this.noThrow = opts.noThrow === true;

      // TODO deprecate
      if (opts.beforeFetch) {
        this._middlewaresSync.push(opts.beforeFetch);
      }
    }
    this.fetchFn = (operation, variables, cacheConfig, uploadables) => {
      for (let i = 0; i < this._middlewaresSync.length; i++) {
        const res = this._middlewaresSync[i](operation, variables, cacheConfig, uploadables);
        if (res) return res;
      }
      const shouldHandleError = (req, value) => {
        if (!this.noThrow && (!value || value.errors || !value.data)) {
          throw createRequestError(req, value);
        }
      };
      return {
        subscribe: sink => {
          const req = new RelayRequest(operation, variables, cacheConfig, uploadables);
          const res = fetchWithMiddleware(req, this._middlewares, this._rawMiddlewares);
          res.then(async value => {
            const parts = streamMultipartBody(value._res);
            if (parts) {
              // eslint-disable-next-line no-restricted-syntax
              for await (const {
                body,
                json
              } of parts) {
                if (!json) throw new RRNLError('failed parsing part:\n- this could either mean the multipart body had an incorrect Content-Type\n- or lack thereof');

                // eslint-disable-next-line no-restricted-syntax
                for (const payload of body.incremental ?? [body]) {
                  payload.data ??= payload.items?.[0];
                  if (!payload.data && !payload.hasNext) {
                    return sink.complete();
                  }
                  payload.extensions = _objectSpread(_objectSpread({}, payload.extensions ?? {}), {}, {
                    is_final: !body.hasNext
                  });
                  shouldHandleError(req, payload);
                  sink.next(payload);
                }
              }
            } else {
              shouldHandleError(req, value);
              sink.next(value);
            }
            sink.complete();
          }).catch(error => {
            if (error && error.name && error.name === 'AbortError') {
              sink.complete();
            } else sink.error(error);
          });
          return () => {
            req.cancel();
          };
        }
      };
    };
    const network = Network.create(this.fetchFn, this.subscribeFn);
    this.execute = network.execute;
    this.executeWithEvents = network.executeWithEvents;
  }
}