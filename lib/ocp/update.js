
const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')
const Workspace = require('./workspace')
const {isValidResponseFromOCP, exitIfNotFound, showResponseFromOCP, watchUntilDeploymentEnds} = require('../tools')
const CLUSTER_ROLE_NAME = 'sso-deployer'
const CLUSTER_BINDING_ROLE_NAME = 'sso-deployer-binding'
const workspace = new Workspace()

function buildNewImage({name, image, project, token}) {
	if(_.isUndefined(image) ) {
		console.log('I need an ImageStream to continue (ie: node sso.js deploy update --image=my-custom-sso) --project=...')
		process.exit(-1)
	}

	const file = workspace.compressFolder('./container.tar', './templates/sso-container')


	const api = okdAPI.okd(cluster, token)
					  .namespace(project)

	const is = api.is.find(image)
	const bc = api.bc.find(image)
	const dc = api.dc.find(name)

	Promise.all([is, dc, bc])
		   .then( completed => completed.map(isValidResponseFromOCP) )
		   .then( res => {
		   		bc.binary(file, image)
		   		  .then(ok => console.log('Construction of the image has started...'))
            	  .catch((err) => {	console.log(`Building Image Error: ${err}`) })
		   })

}

function updateDeployment({name, image, project, token}) {

	if(_.isUndefined(image) ) {
		console.log('I need an ImageStream to continue (ie: node sso.js deploy update --image=my-custom-sso) --project=...')
		process.exit(-1)
	}

	const api = okdAPI.okd(cluster, token)
					  .namespace(project)

	const is = api.is.find(image)
	const dc = api.dc.find(name)

	Promise.all([is, dc])
		.then( completed => completed.map(isValidResponseFromOCP) )
		.then( res => modifyDeploymentImage(res) )
		.then( modifiedDeployment => api.dc.put(name, modifiedDeployment))
		.then( res  	 => console.log('updated!'))
		.catch( error => console.log('error: ', error))
}

module.exports = {
	buildNewImage,
	updateDeployment
}
