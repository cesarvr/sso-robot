const _ = require('lodash')
const getPair = (cmdArgs) =>  {
  if(cmdArgs === '' || cmdArgs === undefined)
    return {cmd: undefined, args: undefined}

  let cmd  = cmdArgs.split(" ")[0].replace('-','')
  let args = cmdArgs.split(" ")[1]

  return {cmd, args}
}

function get_params(arg_list, ret){
  let list = ret || { cmd:'', args: [] }
  let candidate = arg_list.pop()

  if( candidate.includes('sso.js') )
    return list

  if(candidate[0] === '-'){
    list.cmd = candidate.replace('-', '')
  }else{
    list.args.push(candidate)
  }

  return get_params(arg_list, list)
}


class Run {
  constructor(CMD) {
    this.CMD = CMD
  }

  run(){

    let param = get_params(_.clone(process.argv))
    let command = this.CMD[param.cmd]

    if(command === undefined){
      console.log("usage: \n")
      console.log("node sso.js <args...>")

      process.exit(0)
    }else {
      let params = param.args.reverse()
      if(process.env['DEBUG'])
        console.log('params: ', params)
        command.apply(null, params)
    }

  }

}

module.exports = Run
