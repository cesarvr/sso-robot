const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')
const { isValidResponseFromOCP, exitIfNotFound } = require('../tools')
const CreateObjects = (okds) => Promise.all( okds.map( resource => resource.post() ) )

const watchUntilDeploymentEnds = (OKD, deploymentConfig) => {
	let dcName = deploymentConfig.metadata.name
	console.log("watching DeploymentConfig: ", dcName )

	OKD.dc.watch(dcName, (events) => {
		let deploymentConditions = events.object.status.conditions
		
		if( _.isEmpty( deploymentConditions ) )
			return

		console.log(`watching: ${dcName} => ${ Date.now() } `)
		let availableCondition = deploymentConditions.find( condition => condition.type === 'Available' )

		if(availableCondition.status === 'True')
		{
			console.log('SSO is ready to get traffic')
			process.exit(0)
		}
	})
}


class OKDCreator{

	constructor(template){
		this.template = template
	}

	create({ name, project, token }){

		this.template.update('APPLICATION_NAME', name)
		
		const OKD = okdAPI.okd(cluster, token).namespace(project)
		
		let okdResources = this.template.parse().map(templates => OKD.from_json(templates))

		CreateObjects(okdResources)
			.then(completed => completed.map(exitIfNotFound) )
			.then( resources => resources.find( res => res.kind === 'DeploymentConfig' ))
			.then(  deploymentConfig => watchUntilDeploymentEnds(OKD, deploymentConfig) )
			.catch( errorOnAPIServer => console.log('error: ', errorOnAPIServer))
	}
}

module.exports = OKDCreator
