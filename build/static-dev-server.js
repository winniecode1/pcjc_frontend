'use strict'

const path = require('path')
const express = require('express')

const staticRoot = path.resolve(__dirname, '../static')

/**
 * dev 下用 express 直接托管 static，避免 CopyWebpackPlugin 在 emit 阶段
 * 拷贝数百个 mp4/大图导致 Node OOM。
 */
function mountStaticAssets (app) {
  app.use(
    '/static',
    express.static(staticRoot, {
      maxAge: 0,
      etag: false,
      lastModified: false,
      fallthrough: true
    })
  )
}

module.exports = {
  staticRoot,
  mountStaticAssets
}
