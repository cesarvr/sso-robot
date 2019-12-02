let { read_command, read_params } = require('./lib/tools')


console.log('cmd:', read_command(process.argv) )
console.log('params:', read_params(process.argv) )
