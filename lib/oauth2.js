const { discover, login } = require('./rest')
const jwt_decode = require('jwt-decode')
const url = require("url")

function get_token(json){
  console.log('token ?', json)
  let txt = jwt_decode(json.access_token)
  let raw = JSON.stringify(txt,null, 4)
  require('fs').writeFileSync('./logs/test_result.json', raw)
  console.log(`parsed base64 token: ${raw}`)
  return txt
}

function readDNS(_url){
  let dns = require('dns')
  let hostname = new url.URL(_url).hostname
  console.log("hostname: ", hostname)
 
  dns.lookup(hostname, function onLookup(err, addresses, family) {
    console.log('readDNS:', addresses)
  })

}

async function getOpenIDConfiguration(host, realm){
  let oauth2_info = await discover(host, realm)
  
  if (oauth2_info === undefined ) { 
    console.log(`The Discovery info comeback null, this could mean that we cannot access this URL: ${AUTH_HOST}`)
    process.exit(-1)
  }

  readDNS(oauth2_info.token_endpoint)

  return oauth2_info
}

async function loginWithCredentials(URL, username, password, realm){

  if(URL === undefined) {
    console.warn("URL is empty")
    process.exit(-1);
  }

  if(username === undefined)
    console.warn("Name is empty: using patrick")

  if(realm === undefined)
    console.warn("Realm is empty: using demorealm")

  let authorization_server_info = await getOpenIDConfiguration(URL, realm)

  let user = {username, password}
  console.log(`User: ${JSON.stringify(user)}`)


  let auth = await login(authorization_server_info.token_endpoint, user)
  let token = get_token(auth)

 
}

async function loginAsDevUser(URL, name) {
  const patrick = {
      username : '4638814N',
      password: '@d3vpw4812!!',
      realm: 'demorealm'
  }

  const white = {
      username : 'JAMES.WHITE',
      password: '@d3vpw4812!!',
      realm: 'demorealm'
  }

    const agr0043 = {
      username : 'agr0043',
      password: '@u@tpw369!!',
      realm: 'demorealm-uat'
  }

  const justin = {
      username : 'justin',
      password: 'password',
      realm: 'demorealm'
  }

  let users = { white, patrick, justin, agr0043 }
  let user = users[name]
  
  if(user === undefined) throw `User ${name} doesn't exist...`
  let authorization_server_info = await getOpenIDConfiguration(URL, user.realm)

  console.log(`User: ${JSON.stringify(user)}, token_url: ${authorization_server_info.token_endpoint}`)

  let auth = await login(authorization_server_info.token_endpoint, user)
  let token = get_token(auth)
  return auth
}

module.exports = { loginWithCredentials, loginAsDevUser }
