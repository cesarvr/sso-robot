const fetch = require('node-fetch')
const qs    = require('querystring')

let admin_user     = process.env['RHSSO_ADMIN_USER'] || 'admin'
let admin_password = process.env['RHSSO_ADMIN_PASSWORD'] || 'admin'


function remove_trailing_slash(url){
  if(url[url.length-1] === '\/'){
    return url.slice(0, url.length-1)
  }

  return url
}

function handle_request(res){

  if(res.status !== 200){
    console.log(` \n\n Fatal error: status ${res.status}  msg: ${res.statusText} \n`)
    process.exit(-1)
  }

  return res.json()
}

// OAuth2 RFC: https://tools.ietf.org/html/rfc6749#section-1.8
// https://stackoverflow.com/questions/28658735/what-are-keycloaks-oauth2-openid-connect-endpoints

async function discover(auth_host, realm) {
  auth_host = remove_trailing_slash(auth_host)
  const OAuth2Discovery = `${auth_host}/auth/realms/${realm}/.well-known/openid-configuration`

  return fetch(OAuth2Discovery, {method: 'GET'})
                          .then(async function(res) { return await handle_request(res) })
                          .catch(err=> console.log("Unhandled error:", err))
}


async function login(endpoint, {username, password, client_id, client_secret}){

  let body = {
    grant_type: 'password',
    username: username,
    password: password,
    scope: ['phone', 'profile'],
    client_id: client_id || 'webapp1',
    client_secret,
    response_type: 'token'
  }

  let bdata = qs.stringify(body)
  let opts  = {
      method: 'POST',
      body: bdata,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }

  // console.log(`body:     ${JSON.stringify(body,null,4)}`)
  // console.log(`options:  ${JSON.stringify(opts,null,4)}`)
  // console.log(`endpoint: ${endpoint}`)
  

  return fetch(endpoint, opts)
          .then(res => handle_request(res))
}


async function admin_access({url}) {
  let oauth2_info = await discover(url, 'master')

  if(admin_user == '' || admin_password == '') {
    console.warn('Warning: using default password admin/admin')
    username = 'admin'
    password = 'admin'
  }


  const credential_for_real = {
      username: admin_user,
      password: admin_password,
      client_id: 'admin-cli',
      client_secret: ''
  }

  let auth = await login(oauth2_info.token_endpoint, credential_for_real)
  return auth
}



module.exports = {discover, login, admin_access}
