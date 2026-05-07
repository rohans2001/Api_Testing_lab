/**
 * Handle API Versioning
 */
const apiVersionMiddleware = (version) => {
  return (req, res, next) => {
    // In a real scenario, this might check headers or the URL pattern
    req.apiVersion = version;
    next();
  };
};

module.exports = { apiVersionMiddleware };
