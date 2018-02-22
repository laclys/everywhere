const http = require('http')
const chalk = require('chalk')
const conf = require('./config/defaultConfig')

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello Luke!')
})

server.listen(conf.port, conf.hostname, () => {
  const addr = `http://${conf.hostname}:${conf.port}`
  console.log(`Server started at ${chalk.green(addr)}`)
})