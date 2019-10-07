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

  if(candidate.includes('sso.js'))
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

    let param = get_params(process.argv)

    console.log('raw=>', process.argv)
    console.log('psa=>', param)

    let command = this.CMD[param.cmd]

    if(command === undefined){
      console.log("usage: \n")
      console.log("node sso.js <args...>")

      process.exit(0)
    }else {
      command.apply(null, param.args.reverse())
    }

  }

}

module.exports = Run
