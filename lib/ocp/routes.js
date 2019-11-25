
let okdAPI = require('okd-api')
let _ = require('lodash')

const cluster = "https://console.rhos.agriculture.gov.ie:443"


function find(name, PROJECT, token) {
	const route = okdAPI.okd(cluster, token)
				.namespace(PROJECT).route.by_name(name)

	route.then(svc_list => console.log('list: ', svc_list) )
		 .catch(error   => console.log('error: '. error) )


}

module.exports = find
