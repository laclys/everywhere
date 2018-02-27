const yargs = require('yargs')
const Server = require('./app')

const argv = yargs
  .usage('node-everywhere [option]')
  .option('p', {
    alias: 'port',
    describe: 'PORT',
    default: 9876
  })
  .option('h', {
    alias: 'hostname',
    describe: 'HOST',
    default: '127.0.0.1'
  })
  .option('d', {
    alias: 'root',
    describe: 'ROOT PATH',
    default: process.cwd()
  })
  .version()
  .alias('v', 'version')
  .help()
  .argv

  const server = new Server(argv)
  server.start()