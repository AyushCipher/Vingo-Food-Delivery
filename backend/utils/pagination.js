const MAX_LIMIT = 200;

// Parses optional ?limit=&skip= query params. No caller passes these today
// (there's no paging UI yet), so when they're absent this returns
// { limit: null, skip: 0 } — meaning "no limit", identical to today's
// unbounded behavior. Only a caller that explicitly opts in gets capped
// results; this is what lets the DB-grounded chat agent's tools (Phase 3)
// request small pages without changing any existing endpoint's behavior.
export const parsePagination = (query, { maxLimit = MAX_LIMIT } = {}) => {
  const requestedLimit = parseInt(query.limit, 10);
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, maxLimit)
    : null;
  const skip = Math.max(parseInt(query.skip, 10) || 0, 0);
  return { limit, skip };
};

// Applies { limit, skip } from parsePagination to a Mongoose query, only
// calling .limit() when one was actually requested.
export const applyPagination = (mongooseQuery, { limit, skip }) => {
  let q = mongooseQuery.skip(skip);
  if (limit) q = q.limit(limit);
  return q;
};
