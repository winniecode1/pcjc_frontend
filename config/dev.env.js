'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_MODULE5_API_BASE_URL: '"http://10.109.253.71:5235"'
})
