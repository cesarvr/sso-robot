const fetch = require('node-fetch')
const qs    = require('querystring')


function remove_trailing_slash(url){
  if(url[url.length-1] === '\/'){
    return url.slice(0, url.length-1)
  }

  return url
}

function handle_request(res){

  if(res.status !== 200){
    console.log(` \n\n Fatal error: status ${res.status}  msg: ${res.statusText} \n`)
    process.exit()
  }
  
  //console.log('headers:', JSON.stringify(res.headers.raw(), null, 4) )
  //console.log('\n Result: ', JSON.stringify(res, null, 4))
  return res.json()
}

// OAuth2 RFC: https://tools.ietf.org/html/rfc6749#section-1.8
// https://stackoverflow.com/questions/28658735/what-are-keycloaks-oauth2-openid-connect-endpoints

async function discover(auth_host, realm) {
  auth_host = remove_trailing_slash(auth_host)
  const OAuth2Discovery = `${auth_host}/auth/realms/${realm}/.well-known/openid-configuration`


 // console.log(`Discovery URL: ${OAuth2Discovery}`)

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
    client_secret: client_secret || '80bf9c91-ed63-41ff-9abc-3d27a26048a8',
    response_type: 'token'
  }

  //console.log('body: ', JSON.stringify(body,null,4))

  let bdata = qs.stringify(body)
  let opts  = {
      method: 'POST',
      body: bdata,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }

  return fetch(endpoint, opts)
          .then(res => handle_request(res))
}

async function admin_access({url, username, password}) {
  let oauth2_info = await discover(url, 'master')

  if(username == '' || password == '') {
    console.warn('Warning: using default password admin/admin')
    username = 'admin'
    password = 'admin'
  }


  const credential_for_real = {
      username,
      password,
      client_id: 'admin-cli',
      client_secret: ''
  }

  let auth = await login(oauth2_info.token_endpoint, credential_for_real)
  return auth
}



module.exports = {discover, login, admin_access}
