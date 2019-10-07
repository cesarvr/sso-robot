const jwt_decode = require('jwt-decode')
const { discover, login } = require('./rest')

function get_token(json){
  let txt = jwt_decode(json.access_token)
  let raw = JSON.stringify(txt,null, 4)
  require('fs').writeFileSync('./test_result.json', raw)

  return txt
}

async function execute(){
  let AUTH_HOST = process.argv[2] || 'https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie'
  let USER = process.argv[3] || 'patrick'

  let oauth2_info = await discover(AUTH_HOST, 'demorealm')

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


  console.log('-->', oauth2_info)

  let auth = await login(oauth2_info.token_endpoint, users[USER])

  let token = get_token(auth)

  console.log(`decrypted token: ${JSON.stringify(token, null, 4)}`)

}

execute()

// discover().then(discovery => {
//

//   const credential_for_two = {
//       username : '466661AP',
//       password: '!t3chpw135!!'
//   }
//
//   const credential_for_testing = { username: 'user1', password: 'mypasswordistrong' }
//
//   console.log(`discovery: ${JSON.stringify(discovery,0,4)}`)
//
//   get_token(discovery.token_endpoint, credential_for_real)
// })
