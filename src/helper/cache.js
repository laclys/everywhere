const {cache} = require('../config/defaultConfig')

function refreshRes(stats, res) {
  const {maxAge, expires, cacheControl, lastModified, etag} = cache

  // 设置Expires
  if (expires) {
    res.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString())
  }

  // 设置Cache-Control
  if (cacheControl) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
  }

  // 设置Last-Modified
  if (lastModified) {
    res.setHeader('Last-Modified', stats.mtime.toUTCString())  // stats.mtime获取文件最后修改的时间
  }

  if (etag) {
    res.setHeader('ETag', `${stats.size}-${stats.mtime}`)
  }
}

module.exports = function isFresh(stats, req, res) {
  refreshRes(stats, res)

  const lastModified = req.headers['if-modified-since']
  const etag = req.headers['if-none-match']

  if (!lastModified && !etag) {
    return false
  }

  if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
    return false
  }

  if (etag && etag !== res.getHeader('ETag')) {
    return false
  }

  return true
}