export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Something went wrong.' : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
