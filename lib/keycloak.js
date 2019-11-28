const { discover, login, admin_access } = require('./rest')
const fetch = require('node-fetch')
const settings = require('./settings')
const _ = require('lodash')



function get_answer(url, res) {
  if(res.status === 200 || res.status === 201) {
    return res.text()
  }

 if(res.status === 409){
    return new Promise((resolve, reject) => resolve( {msg: 'Already there'} ))
  }

  console.warn(`Error: ${res.status} => ${res.statusText} `)
  process.exit(-1)
}

const dbg = (txt) => { 
  console.log('txt => ', txt); 
  return txt 
}

const make_header = (access_token, method, body) => {

    if(access_token === undefined){
      console.log('access_token null')
      process.exit(-1)
    }

    return {
      method: method || 'GET',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }
}

function get_json(res) {
	if(res === undefined) return null 

	return JSON.stringify(JSON.parse(res), null, 4)
}

const fireRequest = (url, req) => req.catch( err => console.log("Network error: ", err))
                                .then(  rs  => get_answer(url, rs) )

const search = (opts, resources) => {
  if(!_.isArray(resources))
    return {result: 'Expecting an array to return from the server, but got this instead: ' + resources }

  return _.find(resources, opts)
}

const filter = (opts, resources) => {
  if(!_.isArray(resources))
    return {result: 'Expecting an array to return from the server, but got this instead: ' + resources }

  return _.filter(resources, opts)
}

function buildRequest(url, token){
	return { 
		get: function() {
			return fireRequest(url, fetch(url, make_header(token)))
                  .then(  res => get_json(res))
            
    }, 

    find: function(opts) {
      return fireRequest(url, fetch(url, make_header(token)))
                  .then( res => JSON.parse(res))
                  .then( res => search( opts, res) )
                  .then( res => JSON.stringify(res, null, 4))
    }, 
    	

    filter: function(opts) {
      return fireRequest(url, fetch(url, make_header(token)))
                  .then( res => JSON.parse(res))
                  .then( res => filter( opts, res) )
                  .then( res => JSON.stringify(res, null, 4))
    }, 

    post: function(payload) {
 			return fireRequest(url, fetch(url, make_header(token, "POST", payload)) )
    }

	}
}

async function KeycloakAPI({url, realm, id}) {
	
  let URLs = {
		client:     (host, realm) =>  `https://${host}/auth/admin/realms/${realm}/clients`,
		identity:   (host, realm) =>  `https://${host}/auth/admin/realms/${realm}/identity-provider/instances`,
		federation: (host, realm) =>  `https://${host}/auth/admin/realms/${realm}/user-federation/providers`,
    realms:     (host, realm) =>  `https://${host}/auth/admin/realms`,
    serverinfo: (host, realm) =>  `https://${host}/auth/admin/serverinfo`,
    storage:    (host, realm) =>  `https://${host}/auth/admin/realms/${realm}/components?parent=demorealm&type=org.keycloak.storage.UserStorageProvider`,
    spi:        (host, realm) =>  `https://${host}/auth/admin/realms/${realm}/components`, 
    'client-secret': (host, realm, id) => `https://${host}/auth/admin/realms/${realm}/clients/${id}/client-secret`, 
	}

  if(process.env['DEBUG'])
    console.log(`KeycloakAPI: `, {url, realm, id})
  
  let access = await admin_access({url})
	const host = new URL(url).hostname

	let ret = {}

	Object.keys(URLs).forEach(key => {
    let URL = URLs[key](host, realm || undefined, id || undefined)
		ret[key] = buildRequest( URL, access.access_token ) 
	})

	return ret
}

async function KeycloakFactory(options){

  if(_.isEmpty(options.url)) {
    console.log(`Need an URL!!`)
    process.exit(-1)
  }

  if(_.isEmpty(options.resource)){
    console.log(`Need an resource example: node sso.js -get url realms`)
    process.exit(-1)
  }

  let keycloakREST = await KeycloakAPI(options)
  let keycloakAPI = keycloakREST[options.resource]

  if(_.isEmpty(keycloakAPI)){
    console.log(`Resource (${keycloakAPI}) doesn't exist or not implemented`)
    process.exit(-1)
  }

  return keycloakAPI
}

module.exports = { KeycloakFactory }