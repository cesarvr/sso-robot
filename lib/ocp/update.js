
let okdAPI = require('okd-api')
let _ = require('lodash')

const cluster = require('./ocp-server-url')

const modifyDeploymentImage = (res, tag) => {

	let is = res.find(r => { return r.kind === 'ImageStream' })
	let dc = res.find(r => r.kind === 'DeploymentConfig')
	
	 console.log('dc =>', dc)
	 console.log('is =>', is)
	
	let trigger = dc.spec.triggers.find(trigger => trigger.type === 'ImageChange')
	trigger.imageChangeParams.from.namespace = is.metadata.namespace
	trigger.imageChangeParams.from.name = is.metadata.name + ":latest" 
	
	return dc 
}

function update(name, image, PROJECT, token) {
	console.log('project: ', PROJECT)
	console.log('dc: ', name)

	const api = okdAPI.okd(cluster, token).namespace(PROJECT)
	const is = api.is.find(image)
	const dc = api.dc.find(name)

	Promise
		.all([is, dc])
		.then( res => modifyDeploymentImage(res) )
		.then( modifiedDeployment => api.dc.put(name, modifiedDeployment)) 
	.then(res  	 => console.log('updated!'))
	.catch(error => console.log('error: ', error))
}

module.exports = update
