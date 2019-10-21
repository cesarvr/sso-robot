const jwt_decode = require('jwt-decode')
const { discover, login, admin_access } = require('./rest')
const fetch = require('node-fetch')
const qs    = require('querystring')

function get_token(json){
  let txt = jwt_decode(json.access_token)
  let raw = JSON.stringify(txt,null, 4)
  require('fs').writeFileSync('./test_result.json', raw)

  return json.access_token
}

function get_answer(res){
  if(res.status === 200)
    return res.text()

  if(res.status === 409)
    return console.warn(`Already there: ${res.status} => ${res.statusText} `)

  console.warn(`Error: ${res.status} => ${res.statusText} `)
}

const make_header = (access_token, method) => {
    if(access_token === undefined){
      console.log('access_token null')
      process.exit(-1)
    }

    return {
      method: method || 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }
}

function get_realms(host, access_token){
  const R = `https://${host}/auth/admin/realms`

  return fetch(R, make_header(access_token))
              .then(rs => get_answer(rs))
              .then(res => JSON.parse(res).map(res => res.realm))
              .catch(err => console.log("error fetching realms: ", err))
}


async function add_roles({host, access_token, role, realm}) {
  const ADMIN_ROLES = `https://${host}/auth/admin/realms/${realm}/roles`
  console.log(`endpoint: ${ADMIN_ROLES}`)

  let body_data = role

  let opts  = make_header(access_token, 'POST')
  opts.body = JSON.stringify(body_data)

  return fetch(ADMIN_ROLES, opts)
    .then(res => get_answer(res))
    .catch(error=> console.log("Error: Promise@add_roles: ", error) )
}

async function roles({host, access_token, realm}) {
  const ADMIN_ROLES = `https://${host}/auth/admin/realms/${realm}/roles`
  console.log(`endpoint: ${ADMIN_ROLES}`)

  try{
    let res = await fetch(ADMIN_ROLES, make_header(access_token))
    let txt = await res.json()

    console.log('Roles->', JSON.stringify(txt, null, 4))

  }catch(e){
    console.log('GET Roles Error: ', e)
  }
}

function test(){
  const fs = require('fs')
  let auth = fs.readFileSync('./lib/data/roles-import.json').toString()
  auth = JSON.parse(auth)

  return auth[0].authorisations.roles
}

async function run(url, access_token, realm) {
  let roles_db = test()


  roles_db.forEach(async function({name, description}) {
    console.log('adding_role: ', name, description)
    let done = await add_roles({
       host:url,
       access_token,
       role:{ name, description},
       realm
    })
  })

  let get_roles = await roles({host: url, access_token, realm})
}

module.exports = {
  run: async function(url, username, password, realm){
    let token = await admin_access({url, username, password, realm})
    token = get_token(token)
    console.log('token =>', token)
    const _url = new URL(url).hostname
    let realms = await get_realms(_url, token)
    console.log("realms: ", realms)
    run(_url, token, realm)
  }
}
