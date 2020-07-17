const path = require('path')
const name = 'ServiceFramework.Admin'

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/', // TODO: Remember to change this to fit your need
  lintOnSave: process.env.NODE_ENV === 'development',
  devServer: {
    port: 8081,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    progress: false
    //,
    //proxy: {
    //  // change xxx-api/login => /mock-api/v1/login
    //  // detail: https://cli.vuejs.org/config/#devserver-proxy
    //  [process.env.VUE_APP_BASE_API]: {
     
    //    //target: `http://localhost:${mockServerPort}/mock-api/v1`,
    //    target: 'https://localhost:5001/api',
    //    changeOrigin: true, // needed for virtual hosted sites
    //    //secure:false,
    //    ws: true, // proxy websockets
    //    pathRewrite: {
         
    //      ['^' + process.env.VUE_APP_BASE_API]: ''
    //    }
    //  }
    //}
  },
  pwa: {
    name: name
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/_variables.scss'),
        path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  chainWebpack(config) {
    // Provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    config.set('name', name)
  }
}
