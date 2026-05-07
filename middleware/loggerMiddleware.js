const morgan = require('morgan');

/**
 * Custom logger
 */
const loggerMiddleware = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    `| Request ID: ${req.id}`
  ].join(' ');
});

module.exports = { loggerMiddleware };
