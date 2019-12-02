const _ = require('lodash')
const { read_params, read_command } = require('./tools')
const Token = require('./ocp/token')


const getPair = (cmdArgs) =>  {
  if(cmdArgs === '' || cmdArgs === undefined)
    return {cmd: undefined, args: undefined}

  let cmd  = cmdArgs.split(" ")[0].replace('-','')
  let args = cmdArgs.split(" ")[1]

  return {cmd, args}
}

function readCommandLineParameters() {
   let args   = read_command( process.argv )
   let params =  read_params( process.argv )
   let ret = {}
   

   ret = {
    action:args[0],
    resource: args[1], 
    params
   }
   
   return ret 
}

function takeCareOfTheToken(params){
  if(!_.isUndefined(params.token))
    params.token = Token(params.token)

  return params
}

function validate(rules, params){
  let paramNames = Object.keys(params)

  let missingRules = rules.filter(rule => paramNames.indexOf(rule) === -1)


  if(!_.isEmpty(missingRules))
  {
    console.log(`\n\nMissing the ${[missingRules].join(', ')} parameters: \n`)
    missingRules.forEach(missing => console.log(`try --${missing}=<value>`))
    process.exit(-1)
  }


  return true
}

class Run {
  constructor(CMD) {
    this.CMD = CMD
  }

  run(){
    let args = readCommandLineParameters()
    let command = this.CMD[args.action]
    
    if(!_.isObject(command)){
      console.log("usage: \n")
      console.log("node sso.js <action> <resource> <params>")
      console.log(`\nactions: \n\n${ Object.keys(this.CMD).join(' \n') }`)


      process.exit(0)
    }
  
    if(process.env['DEBUG']) {
      console.log('args ==>', args)
      console.log('command ==>', command)
    }

    validate(command.required, args.params)
    args.params = takeCareOfTheToken(args.params)

    
    command.executor.apply(null, [args])
  }

}

module.exports = Run
