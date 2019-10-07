const { discover, login } = require('./rest')
const jwt_decode = require('jwt-decode')

function get_token(json){
  let txt = jwt_decode(json.access_token)
  let raw = JSON.stringify(txt,null, 4)
  require('fs').writeFileSync('./logs/test_result.json', raw)

  return txt
}

async function execute(URL, name, realm){

  if(URL === undefined)
    console.warn("URL is empty")

  if(name === undefined)
    console.warn("Name is empty: using patrick")

  if(realm === undefined)
    console.warn("Realm is empty: using demorealm")

  let AUTH_HOST = 'https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie'
  let USER = name || 'patrick'
  let REALM = realm || 'demorealm'


  const patrick = {
      username : '4638814N',
      password: '!t3chpw135!!'
  }

  const white = {
      username : 'JAMES.WHITE',
      password: '!t3chpw135!!'
  }

  const justin = {
      username : 'justin',
      password: 'password'
  }

  let users = {
    white,
    patrick,
    justin
  }

  let user = users[USER]
  console.log(`User: ${USER}`)

  let oauth2_info = await discover(AUTH_HOST, REALM)

  let auth = await login(oauth2_info.token_endpoint, user)

  let token = get_token(auth)

  console.log(`decrypted token: ${JSON.stringify(token, null, 4)}`)
}

module.exports = execute
