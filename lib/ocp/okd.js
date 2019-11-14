
let okdAPI = require('okd-api')
let parser = require('./parser')
let _ = require('lodash')

const cluster = "https://console.rhos.agriculture.gov.ie:443"

function find(PROJECT, token) {
	const svcs = okdAPI.okd(cluster, token).namespace(PROJECT).svc.all()

	svcs.then(svc_list => console.log('list: ', svc_list) ).catch(error => console.log('error: '. error))

}

module.exports = find
