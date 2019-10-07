const fetch = require('node-fetch')
const qs    = require('querystring')
const jwt_decode = require('jwt-decode')

async function discover(auth_host, realm) {
  const DISCOVERY = `${auth_host}/auth/realms/${realm}/.well-known/openid-configuration`
  let res, discovery;
  try{
    discovery = await fetch(DISCOVERY, {method: 'GET'})
    res = await discovery.json()
  }catch(e){
    console.log(`We Crash ${e}`)
  }

  return res
}


async function login(endpoint, {username, password, client_id, client_secret}){

  let body = {
    grant_type: 'password',
    username: username,
    password: password,
    scope: ['phone', 'profile'],
    client_id: client_id || 'webapp1',
    client_secret: client_secret || '80bf9c91-ed63-41ff-9abc-3d27a26048a8',
    response_type: 'token'
  }

  console.log('body: ', body)

  let bdata = qs.stringify(body)

  let call_endpoint = await fetch(endpoint, {
      method: 'POST',
      body: bdata,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

  let res = await call_endpoint.json()

  return res
}





module.exports = {discover, login}
