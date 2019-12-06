
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


function buildThisProject({name, project, token, target}){
	console.log(`updateSA : name => ${name} project => ${project} token => ${token}, target => ${target}`)
	
	const api  = okdAPI.okd(cluster, token).namespace(project) 
	const file = workspace.compress('./tt.tar')
	
	Promise.all([ api.bc.find(name), 
				  api.dc.find(name) 
				])
		.then(progress => progress.map(exitIfNotFound) )
		.then(result =>  api.bc.binary(file, name) )
		.then(buildIsOver => {
			console.log('Building image... ')
			api.dc.pod.trackNewPod(name, event => {
				console.log(`waiting for the pod ${event.object.metadata.name} to start... state: ${event.object.status.phase}`)

				if(event.object.status.phase === 'Running') {
					console.log('successfully deployed! \n')
					console.log(`Now you can try to deploy RHSSO in the ${project} namespace by doing: \n oc exec -n ${project} ${event.object.metadata.name} -- node sso deploy create --name=my-sso --project=${project} \n`)
					
					workspace.clean()
					process.exit(0)
				}
			})
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

function createRobotCredentials({name, project, token, target}){
	console.log(`updateSA : name => ${name} project => ${project} token => ${token}, target => ${target}`)
	const api = okdAPI.okd(cluster, token).namespace(project)

	let ServieAccount = api.from_json(SERVICE_ACCOUNT(name))

	let ClusterRoles = api.from_template({
											name:CLUSTER_ROLE_NAME, 
											namespace: project 
										}, 
										'./templates/ocp/robot-role.yml')
				
	let ClusterRolesBinding = api
						.from_template({ 
							name: CLUSTER_BINDING_ROLE_NAME, 
			service_account_name: name, 
				       namespace: target, 
				    cluster_role: CLUSTER_ROLE_NAME }, './templates/ocp/role-binding.yml')

	return Promise.all([ClusterRoles.post(), ServieAccount.post()])
	   	   .then(completed => completed.map(isValidResponseFromOCP) )
		   .then(completed => ClusterRolesBinding.post())
		   .catch(err => console.log('error => ', err))
}

function updateDeployment({name, image, project, token}) {

	if(_.isUndefined(image) ) {
		console.log('I need an ImageStream to continue (ie: node sso.js deploy update --image=my-custom-sso) --project=...')
		process.exit(-1)
	}

	const api = okdAPI.okd(cluster, token).namespace(project)
	const is = api.is.find(image)
	const dc = api.dc.find(name)

	Promise.all([is, dc])
		.then(completed => completed.map(isValidResponseFromOCP) )
		.then( res => modifyDeploymentImage(res) )
		.then( modifiedDeployment => api.dc.put(name, modifiedDeployment)) 
		.then(res  	 => console.log('updated!'))
		.catch(error => console.log('error: ', error))
}

module.exports = {updateDeployment, createRobotCredentials, installOnOpenShfit, buildThisProject}
