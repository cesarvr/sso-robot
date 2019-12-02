const _ = require('lodash')

function load_from_accountservice(){
  try{
    let token = require('fs')
                .readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
                .toString()

    return token
  }catch(e){
    console.log('Error reading token, if you are not running this process inside a [pod], make sure to pass the token as argument (ie: --token=J47jEq_dfdrI....)')
    process.exit(-1)
  }

  return null
}

module.exports = function token(token){
  if( !_.isUndefined( token ) ) {
    return token
  }else{
    return load_from_accountservice()
  }
}