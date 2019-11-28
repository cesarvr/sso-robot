
let okdAPI = require('okd-api')
let _ = require('lodash')

const cluster = require('./ocp-server-url')


function find(name, PROJECT, token) {
	const route = okdAPI.okd(cluster, token)
				.namespace(PROJECT).route.by_name(name)

	route.then(route_finding =>  JSON.stringify(route_finding, null, 4)  )
		 .then(route => console.log(route))
		 .catch(error   => console.log('error: '. error) )
}

module.exports = find
