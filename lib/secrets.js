const { KeycloakFactory } = require('./keycloak')
const _ = require('lodash')

module.exports = async function(url, realm){


	let client = await KeycloakFactory({resource:'client', url, realm})
	let clients  = await client.get()

	if(_.isEmpty(clients) ){
		console.log("Empty clients ??")
		process.exit(-1)
	}

	let webapp1 = JSON.parse(clients).filter(cli => cli.clientId === 'webapp1')[0]

	
	let clientSecrets = await KeycloakFactory({resource:'client-secret', url, realm, id: webapp1.id})
	let secret = await clientSecrets.get()

	try{
		return JSON.parse( secret ).value
	}catch(error){
		console.log("Fatal Error: No secret found.")
		process.exit(-1)
	}

	return null 
}
