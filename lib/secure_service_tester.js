const OAuth2 = require('./oauth2')
const fetch = require('node-fetch')

module.exports = async function (url, name, svc) {
	let token = await OAuth2.loginAsDevUser(url, name)

	console.log("toke: ", token)
	if(token === undefined) {
		console.log("token is empty")
		process.exit(-1)
	}

	fetch(svc, {
	  method: 'GET',
	  headers: {
	    'Authorization': 'Bearer' + token.access_token
	  }
	})
	.then(res => res.json())
	.then(data => console.log("data=>", data) )
	.catch(err => console.log("some error: ", err))
}