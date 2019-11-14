
let okdAPI = require('okd-api')
let parser = require('./parser')
let _ = require('lodash')

const cluster = "https://console.rhos.agriculture.gov.ie:443"
const token = 'iHGLqpWl-_oTWWhl2wOhTkIqpQDdUNi0GWMqkYNVHAY'


class Template {
	constructor(){
		this.sso = require('./templates/sso.json')
	}

	update(key, value){
		let field = this.sso.parameters.find(params => params.name === key)
		field.value = value
		console.log('updated??? ', this.sso)
	}

	parse(){
		let placeholders = this.sso.parameters.filter(element => element.hasOwnProperty('value') )
		return this.sso.objects.map(object => parser({okd: object, placeholders }) )
	}
}


//https://github.com/cesarvr/okd-client#creating
const CreateObjects = (okds) => Promise.all( okds.map( resource => resource.post() ) )

function create(name, PROJECT) {
	const template = new Template()  
	template.update('APPLICATION_NAME', name)
	
	const OKD = okdAPI.okd(cluster, token).namespace(PROJECT)
	
	let okdResources = template.parse().map(templates => OKD.from_json(templates))

	CreateObjects(okdResources).then( updatedResources => console.log(updatedResources) ).catch(errorOnAPIServer => console.log('error: ', errorOnAPIServer))
}

module.exports = create
