const fs = require('fs')
const path = require('path')   //处理路径 尽量使用绝对路径
const Handlebars = require('handlebars')
const {promisify} = require('util')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const config = require('../config/defaultConfig')
const mine = require('./mime')
const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')

const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())

module.exports = async function (req, res, filePath) {
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      const contentType = mine(filePath)
      res.setHeader('Content-Type', contentType)

      if (isFresh(stats, req, res)) {
        res.statusCode = 304
        res.end()
        return
      }


      let rs
      const {code, start, end} = range(stats.size, req, res)
      if (code === 200) {
        res.statusCode = 200
        rs = fs.createReadStream(filePath)
      } else {
        res.statusCode = 206 // 部分内容
        rs = fs.createReadStream(filePath, {start, end})
      }
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res)
      }
      rs.pipe(res)  // 用流的方式进行读写
    } else if (stats.isDirectory()) {

      const files = await readdir(filePath)
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        const dir = path.relative(config.root, filePath)
        const data = {
          title: path.basename(filePath),
          dir: dir ? `/${dir}`: '',  // req.url 也可以
          files: files.map(item => {
            return {
              file: item,
              icon: mine(item)
            }
          })
        }
        res.end(template(data))
    }
  } catch (err) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${filePath} is not a dir or file\n ${err.toString()}`)
  }
}