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

  console.log(res)
  return res.json()
}


// OAuth2 RFC: https://tools.ietf.org/html/rfc6749#section-1.8
// https://stackoverflow.com/questions/28658735/what-are-keycloaks-oauth2-openid-connect-endpoints

async function discover(auth_host, realm) {
  auth_host = remove_trailing_slash(auth_host)
  const OAuth2Discovery = `${auth_host}/auth/realms/${realm}/.well-known/openid-configuration`


  console.log(`Discovery URL: ${OAuth2Discovery}`)

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
