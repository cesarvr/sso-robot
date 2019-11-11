let sso = require('./templates/sso.json')
let okdAPI = require('okd-api')
let parser = require('./lib/parser')

const cluster = "https://console.rhos.agriculture.gov.ie:443"
const token = 'n_WyD5Hj5eUPyY89YnB45unelhkj5H4hyDfYxYyZljU'


function load_template() {

	let placeholders = sso.parameters.filter(element => element.hasOwnProperty('value') )
	return sso.objects.map(object => parser({okd: object, placeholders }) )
}


function create() {
let tmplts = load_template()

console.log('on =>', JSON.stringify( tmplts[1], null, 4))

let svc = okdAPI.okd(cluster, token).namespace('sso-dev').from_json(tmplts[1])

svc.create().then(res => console.log('good:', res)).catch(err => console.log('error: ', err))
//	let svc =  api.namespace('sso-dev').from_json(tmplts[1])
console.log('occ =>', svc)
}

module.export = create
