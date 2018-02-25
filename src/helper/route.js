const fs = require('fs')
const {promisify} = require('util')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)


module.exports = async function (req, res, filePath) {
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      // fs.readFile(filePath, (err, data) => {
      //   res.end(data)
      // })
      fs.createReadStream(filePath).pipe(res)  // 用流的方式进行读写
    } else if (stats.isDirectory()) {

      const files = await readdir(filePath)
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end(files.join(','))
    }
  } catch (err) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${filePath} is not a dir or file\n ${err.toString()}`)
  }
}