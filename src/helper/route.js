const fs = require('fs')
const path = require('path')   //处理路径 尽量使用绝对路径
const Handlebars = require('handlebars')
const {promisify} = require('util')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const config = require('../config/defaultConfig')
const mine = require('./mime')

const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())

module.exports = async function (req, res, filePath) {
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      const contentType = mine(filePath)
      res.statusCode = 200
      res.setHeader('Content-Type', contentType)
      // fs.readFile(filePath, (err, data) => {
      //   res.end(data)
      // })
      fs.createReadStream(filePath).pipe(res)  // 用流的方式进行读写
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