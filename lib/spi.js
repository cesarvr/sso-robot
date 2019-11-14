const { discover, login, admin_access } = require('./rest')
const fetch = require('node-fetch')
const settings = require('./settings')


function get_answer(res){
  if(res.status === 200 || res.status === 201) {
    return res.text()
  }

 if(res.status === 409){
    return new Promise((resolve, reject) => resolve( {msg: 'Already there'} ))
  }

  console.warn(`Error: ${res.status} => ${res.statusText} `)
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

	return JSON.parse(res)
}


function make_client(url, token){
	return { 

		get: function() {
			return fetch(url, make_header(token))
	          .then(  rs  => get_answer(rs))
	          .then(  res => get_json(res))
	          .catch( err => console.log("Network error: ", err))
    }, 
    	
    post: function(payload) {
      console.log('pushing => ', payload,  make_header(token, "POST", payload))
			return fetch(url, make_header(token, "POST", payload))
              .then(rs => get_answer(rs))
              .catch(err => console.log("error fetching realms: ", err))
    }

	}
}

async function GSPI(url, username, password, realm) {

	let URLs = {
		client:     (host, realm) => `https://${host}/auth/admin/realms/${realm}/clients`,
		providers:  (host, realm) => `https://${host}/auth/admin/realms/${realm}/authentication/authenticator-providers`,
		federation: (host, realm) => `https://${host}/auth/admin/realms/${realm}/user-federation/instances`,
    realms: (host, realm) => `https://${host}/auth/admin/realms`
	}

	let access = await admin_access({url, username, password})
	const host = new URL(url).hostname

	let ret = {}

	Object.keys(URLs).forEach(key => {
		ret[key] = make_client( URLs[key](host, realm || undefined), access.access_token ) 
	})

	return ret
}


module.exports = GSPI