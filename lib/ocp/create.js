
let okdAPI = require('okd-api')
let _ = require('lodash')

const cluster = "https://console.rhos.agriculture.gov.ie"
//const cluster = "https://console.pro-eu-west-1.openshift.com"

//https://github.com/cesarvr/okd-client#creating
const CreateObjects = (okds) => Promise.all( okds.map( resource => resource.post() ) )



class OKDCreator{

	constructor(template){
		this.template = template
		this.token = process.env['ROBOT_TOKEN']
	}

	create(name, PROJECT, token){

		this.template.update('APPLICATION_NAME', name)
		this.token = this.token || token
		
		const OKD = okdAPI.okd(cluster, this.token).namespace(PROJECT)
		
		let okdResources = this.template.parse().map(templates => OKD.from_json(templates))

		CreateObjects(okdResources).then( updatedResources => console.log(updatedResources) ).catch(errorOnAPIServer => console.log('error: ', errorOnAPIServer))
	}


}

module.exports = OKDCreator
