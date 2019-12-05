const _ = require('lodash')
const fs = require('fs')

class Token {
  constructor({ token }){
    if( !_.isUndefined( token ) ) {
      this.token = token
    }
  }


  areWeRunningInPod(){
    return fs.existsSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
  }

  loadServiceAccount(){
    try{
      return require('fs')
                  .readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
                  .toString()
    }catch(e){
      console.log('Error reading token, if you are not running this process inside a [pod], make sure to pass the token as argument (ie: --token=J47jEq_dfdrI....)')
      process.exit(-1)
    }
  }

  getToken() { return this.token } 
}

module.exports = Token