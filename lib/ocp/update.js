
const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')
const Workspace = require('./workspace')
const {isValidResponseFromOCP, exitIfNotFound, showResponseFromOCP, watchUntilDeploymentEnds} = require('../tools')
const CLUSTER_ROLE_NAME = 'sso-deployer'
const CLUSTER_BINDING_ROLE_NAME = 'sso-deployer-binding'
const workspace = new Workspace()

const SERVICE_ACCOUNT = (name) => _.clone({
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: { name }
})

const modifyDeploymentImage = (res, tag) => {

	let is = res.find(r => { return r.kind === 'ImageStream' })
	let dc = res.find(r => r.kind === 'DeploymentConfig')

	let trigger = dc.spec.triggers.find(trigger => trigger.type === 'ImageChange')

	trigger.imageChangeParams.from.namespace = is.metadata.namespace
	trigger.imageChangeParams.from.name = is.metadata.name + ":latest"

	return dc
}

function didDeploymentFinish(events ){
	return !_.isEmpty( events.find(({message}) => message.includes('successfully rolled out') ) )
}

function getDeploymentEvents(raw_events){

	let events = raw_events.object.status.conditions.map(state => _.clone({
			action: state.type,
			version: raw_events.object.status.latestVersion,
			status: state.status,
			message: state.message,
	}) )

	return events

}

function watchDeployment({name, project, token}){
	const api  = okdAPI.okd(cluster, token).namespace(project)
	let evtss = []
	let isDeploymentInProgress = false
	let deploymentTarget = -1

	console.log(`watching ${name}...`)
	api.dc.watch(name, (raw_events) => {

		let events = getDeploymentEvents(raw_events)
		evtss.push(raw_events)
		//console.log('type ->',raw_events.type,'\nconditions -> ', events)

		if(raw_events.type === 'ADDED' && didDeploymentFinish(events)) {
				return
		}

		//console.log('current event -> ', raw_events.type)

		if(didDeploymentFinish(events)) {
			console.log('Image has been deployed...')
			//require('fs').writeFileSync('./deleteme.json', JSON.stringify(evtss, null, 4))
			process.exit(0)
		}

	})
}

function buildThisProject({name, project, token, target}){
	const api  = okdAPI.okd(cluster, token).namespace(project)
	const file = workspace.compressRoot('./tt.tar')

	Promise.all([ api.bc.find(name),
				  api.dc.find(name)
				])
		.then(progress => progress.map(exitIfNotFound) )
		.then(result =>  api.bc.binary(file, name) )
		.then(buildIsOver => workspace.clean() )
		.then(buildIsOver => {
			watchDeployment({name, project, token})
		})
		.catch(err => {
			console.log('err =>', err)
			workspace.clean()
		})
}

function installOnOpenShfit({name, project, token, target}){
	console.log(`updateSA : name => ${name} project => ${project} token => ${token}, target => ${target}`)
	const api = okdAPI.okd(cluster, token).namespace(project)

	let bc = api.from_template({ name }, './templates/ocp/builder.yml')
	let is = api.from_template({ name }, './templates/ocp/is.yml')
	let dc = api.from_template({ name,
								 service_account_name:name,
								 project
								}, './templates/ocp/dc.yml')

 	Promise.all([bc.post(), dc.post(), is.post()])
 		   .then(completed => completed.map(isValidResponseFromOCP) )
 		   .then(completed => completed.map(showResponseFromOCP))
 		   .catch(err => console.log('err => ' , err ) )
}


/*
	createRobotCredentials
	======================
	Robot credentials is a combination of:

	ServieAccount: Basically represents the identity of this agent in the cluster.
	ClusterRoles: So it can perform operations like deploying RHSSO/Keycloak.
	ClusterRolesBinding: It's basically the glue between ServiceAccount + ClusterRoles
*/

function createRobotCredentials({name, project, token}) {
	console.log(`updateSA : name => ${name} project => ${project} token => ${token}`)
	const api = okdAPI.okd(cluster, token).namespace(project)

	let ServieAccount = api.from_json(SERVICE_ACCOUNT(name))

	let ClusterRoles = api.from_template({
											name:CLUSTER_ROLE_NAME,
											project
										},
										'./templates/ocp/role.yml')

	console.log('ClusterRoles templates => ', JSON.stringify( ClusterRoles._tmpl.val(), null, 4 ) )
	let ClusterRolesBinding = api
						.from_template({
							name: CLUSTER_BINDING_ROLE_NAME,
			service_account_name: name,
				       project,
				    role: CLUSTER_ROLE_NAME },
				'./templates/ocp/binding.yml')

	console.log('ClusterRolesBinding templates => ', JSON.stringify( ClusterRolesBinding._tmpl.val(), null, 4 ) )

	return Promise.all([ClusterRoles.post(), ServieAccount.post()])
	   	   .then(completed => completed.map(isValidResponseFromOCP) )
		   .then(completed => ClusterRolesBinding.post())
		   .then(isValidResponseFromOCP)
		   .catch(err => console.log('error => ', err))
}

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
	updateDeployment,
	createRobotCredentials,
	installOnOpenShfit,
	buildThisProject,
	watchDeployment
}
