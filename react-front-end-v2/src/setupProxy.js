const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = {
  target: 'http://localhost:8081',
  changeOrigin: true,
  pathRewrite: {
    '^/app' : '/'
  }
};

const proxy2 = {
  target: 'https://api.rainforestapi.com/',
  changeOrigin: true,
  pathRewrite: {
    '^/api' : '/'
  }
};

module.exports = (App) => {

  App.use(
    '/app',
    createProxyMiddleware(proxy)
  );

  App.use(
    '/api',
    createProxyMiddleware(proxy2)
  );
};