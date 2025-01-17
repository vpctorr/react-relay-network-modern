function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
export default function (graphqlHTTPMiddleware) {
  return (req, res) => {
    const subResponses = [];
    return Promise.all(req.body.map(data => new Promise(resolve => {
      const subRequest = _objectSpread(_objectSpread({
        __proto__: req.__proto__
      }, req), {}, {
        body: data
      });
      const subResponse = _objectSpread(_objectSpread({}, res), {}, {
        status(st) {
          this.statusCode = st;
          return this;
        },
        set() {
          return this;
        },
        send(payload) {
          resolve({
            status: this.statusCode,
            id: data.id,
            payload
          });
        },
        // support express-graphql@0.5.2
        setHeader() {
          return this;
        },
        header() {},
        write(payload) {
          this.payload = payload;
        },
        end(payload) {
          // support express-graphql@0.5.4
          if (payload) {
            this.payload = payload;
          }
          resolve({
            status: this.statusCode,
            id: data.id,
            payload: this.payload
          });
        }
      });
      subResponses.push(subResponse);
      graphqlHTTPMiddleware(subRequest, subResponse);
    }))).then(responses => {
      let response = '';
      responses.forEach(({
        status,
        id,
        payload
      }, idx) => {
        if (status) {
          res.status(status);
        }
        const comma = responses.length - 1 > idx ? ',' : '';
        response += `{ "id":"${id}", "payload":${payload} }${comma}`;
      });
      res.set('Content-Type', 'application/json');
      res.send(`[${response}]`);
    }).catch(err => {
      res.status(500).send({
        error: err.message
      });
    });
  };
}