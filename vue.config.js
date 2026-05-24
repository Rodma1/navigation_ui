const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    open: false,
    https: false,
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BASE_URL,
        ws: false,
        changeOrigin: true,
        router: function(req) {
          delete req.headers.origin
        },
        pathRewrite: {
          "^/api": ""
        },
        // 禁用代理压缩和缓冲，确保 SSE 流式响应实时透传
        onProxyRes: function(proxyRes) {
          // SSE 接口禁用缓冲
          if (proxyRes.headers['content-type'] &&
              proxyRes.headers['content-type'].includes('text/event-stream')) {
            proxyRes.headers['Cache-Control'] = 'no-cache';
            proxyRes.headers['X-Accel-Buffering'] = 'no';
          }
        }
      }
    }
  }
})