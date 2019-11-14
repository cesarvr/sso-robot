
let okdAPI = require('okd-api')
let parser = require('./parser')
let _ = require('lodash')

const cluster = "https://console.rhos.agriculture.gov.ie:443"



class Template {
	constructor(){
		this.sso = require('./templates/sso.json')

		console.log("templates: ",this.sso.objects)
		console.log("size: ",this.sso.objects.length)
	}

	update(key, value){
		let field = this.sso.parameters.find(params => params.name === key)
		field.value = value
	}

	parse(){
		let placeholders = this.sso.parameters.filter(element => element.hasOwnProperty('value') )
		return this.sso.objects.map(object => parser({okd: object, placeholders }) )
	}
}


//https://github.com/cesarvr/okd-client#creating
const CreateObjects = (okds) => Promise.all( okds.map( resource => resource.post() ) )

function create(name, PROJECT, token) {
	const template = new Template()  
	template.update('APPLICATION_NAME', name)
	
	let _token = process.env['ROBOT_TOKEN'] || token

	console.log('using token: ', _token)

	const OKD = okdAPI.okd(cluster, _token).namespace(PROJECT)
	
	let okdResources = template.parse().map(templates => OKD.from_json(templates))

	CreateObjects(okdResources).then( updatedResources => console.log(updatedResources) ).catch(errorOnAPIServer => console.log('error: ', errorOnAPIServer))
}

module.exports = create
