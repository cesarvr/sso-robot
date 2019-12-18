
const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')
const Utilities = require('../tools')

const CLUSTER_ROLE_NAME = 'sso-deployer'
const CLUSTER_BINDING_ROLE_NAME = 'sso-deployer-binding'
const SERVICE_ACCOUNT = (name) => _.clone({
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: { name }
})

/*
  createRobotCredentials
  ======================
  Robot credentials is a combination of:

  ServieAccount: Basically represents the identity of this agent in the cluster.
  ClusterRoles: So it can perform operations like deploying RHSSO/Keycloak.
  ClusterRolesBinding: It's basically the glue between ServiceAccount + ClusterRoles
*/


const LocalRoleTemplates = {
  	Role: './templates/ocp/role.yml',
    Binding: './templates/ocp/binding.yml'
}

function loadTemplate({Role, Binding}, name, project) {
  let Roles = api.from_template({
                      name:CLUSTER_ROLE_NAME,
                      project
                    },
                    Role)

  let RolesBinding = api.from_template(
            {
              name: CLUSTER_BINDING_ROLE_NAME,
              service_account_name: name,
				      project,
				      role: CLUSTER_ROLE_NAME
            },
            Binding)

  return {Roles, RolesBinding}
}


class Credentials {

  constructor({name, project, token}){
     this.api = okdAPI.okd(cluster, token).namespace(project)
     this.target = {name, project}
  }

  get Local(){
    return LocalRoleTemplates
  }

  get Cluster(){
    return LocalRoleTemplates
  }

  load({Role, Binding}, name, project) {
    let {name, project} = this.target
    let Roles = this.api.from_template({
                        name:CLUSTER_ROLE_NAME,
                        project
                      },
                      Role)

    let RolesBinding = this.api.from_template(
              {
                name: CLUSTER_BINDING_ROLE_NAME,
                service_account_name: name,
  				      project,
  				      role: CLUSTER_ROLE_NAME
              },
              Binding)

    return {Roles, RolesBinding}
  }

  setupServiceAccount(name){
    return this.api.from_json(SERVICE_ACCOUNT(name))
  }

  setup(RoleType) {
    let {name, project} = this.target
  	let SA = this.setupServiceAccount(name)
    let { Roles, RolesBinding } = this.load(RoleType, name, project)

  	return Promise.all([Roles.post(), SA.post()])
  	   	 .then(completed => completed.map(Utilities.isValidResponseFromOCP) )
  		   .then(completed => RolesBinding.post())
  		   .then(RolesBinding.isValidResponseFromOCP)
  		   .catch(err => console.log('error => ', err))
  }
}

module.exports = new Credentials()
