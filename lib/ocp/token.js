const _ = require('lodash')

function load_from_accountservice(){
  try{
    let token = require('fs')
                .readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
                .toString()

    //TODO Delete this
    console.log('serviceaccount =>', token)
    return token
  }catch(e){
    console.log('Error reading token inside the pod: ', e)
  }

  return null
}

module.exports = function token(token){
  if( !_.isUndefined( token ) ) {
    console.log(`Using provided token: ${token}`)
    return token
  }else{
    console.log(`Didn't found anything, looking in: /var/run/secrets/kubernetes.io/serviceaccount`)
    return load_from_accountservice()
  }
}