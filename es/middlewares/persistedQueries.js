/* eslint-disable no-console */
async function makePersistedQueryRequestWithFallback(o, original = false, hasRunFallback = false) {
  const makeFallback = async prevError => {
    if (hasRunFallback) {
      throw prevError;
    }
    return makePersistedQueryRequestWithFallback(o, true, true);
  };
  const makeRequest = async () => {
    try {
      // We make a new duplicate request and see if the backend is able to
      // process it
      // If the backend rejects it we fallback to the original request (which has the text query)
      const persistedQueriesReq = JSON.parse(JSON.stringify(o.req));
      const {
        cacheID,
        id,
        text: queryText
      } = persistedQueriesReq.operation;
      const queryId = id || cacheID;
      if (!queryId && (!o.options?.hash || !queryText)) {
        throw new Error('Either query id or hashing function & query must be defined!');
      }

      // Add doc_id to the request and remove the query text
      const body = JSON.parse(persistedQueriesReq.fetchOpts.body);
      delete body.query;
      body.doc_id = queryId;
      persistedQueriesReq.fetchOpts.body = JSON.stringify(body);
      delete persistedQueriesReq.operation.text;
      return await o.next(original ? o.req : persistedQueriesReq);
    } catch (e) {
      return makeFallback(e);
    }
  };
  return makeRequest();
}
export default function persistedQueriesMiddleware(options) {
  return next => req => makePersistedQueryRequestWithFallback({
    req,
    next,
    options
  });
}