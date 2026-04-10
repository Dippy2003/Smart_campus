const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Forwards API and resource routes to Spring Boot so DELETE and other methods
 * reach the backend (avoids 405 from the dev server on /api/*).
 */
module.exports = function setupProxy(app) {
  const target = "http://localhost:8080";
  const opts = { target, changeOrigin: true };
  app.use("/api", createProxyMiddleware(opts));
  app.use("/resources", createProxyMiddleware(opts));
  app.use("/resource", createProxyMiddleware(opts));
};
