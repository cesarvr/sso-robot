const _ = require('lodash')

function load_from_accountservice(){
  try{
    let token = require('fs')
                .readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
                .toString()

    return token
  }catch(e){
    console.log('Error reading token inside the pod: ', e)
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