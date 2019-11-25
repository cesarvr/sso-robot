const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = "https://console.rhos.agriculture.gov.ie"
const CreateObjects = (okds) => Promise.all( okds.map( resource => resource.post() ) )

const watchUntilDeploymentEnds = (OKD, deploymentConfig) => {
	let dcName = deploymentConfig.metadata.name

	console.log("watching DeploymentConfig: ", dcName )

	OKD.dc.watch(dcName, (events) => {
		let deploymentConditions = events.object.status.conditions
		
		if( _.isEmpty( deploymentConditions ) )
			return

		console.log(`watching: ${dcName} => ${Date.now()} `)
		let availableCondition = deploymentConditions.find( condition => condition.type === 'Available' )

		if(availableCondition.status === 'True')
		{
			console.log('SSO is ready to get traffic')
			process.exit(0)
		}
	})
}

const closeIfDeploymentUpdate = (resources) => {
	let dc = resources.find( resource => resource.kind === 'DeploymentConfig' )

	if(_.isEmpty(dc)) {
		console.log('SSO updated, exiting...')
		process.exit(0)
	}

	return dc
}

class OKDCreator{

	constructor(template){
		this.template = template
	}

	create(name, PROJECT, token){

		this.template.update('APPLICATION_NAME', name)
		
		const OKD = okdAPI.okd(cluster, token).namespace(PROJECT)
		
		let okdResources = this.template.parse().map(templates => OKD.from_json(templates))

		CreateObjects(okdResources)
			.then(closeIfDeploymentUpdate)
			.then( deploymentConfig => watchUntilDeploymentEnds(OKD, deploymentConfig) )
			.catch(errorOnAPIServer => console.log('error: ', errorOnAPIServer))
	}
}

module.exports = OKDCreator
