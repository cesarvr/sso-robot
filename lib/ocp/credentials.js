
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


class Credentials {

  constructor({service_account, project, token}){
     this.api = okdAPI.okd(cluster, token).namespace(project)
     this.target = {service_account, project}
  }

  load({ Role, Binding }) {
    let {service_account, project} = this.target
    let Roles = this.api.from_template({
                        name:CLUSTER_ROLE_NAME,
                        project
                      },
                      Role)

    let RolesBinding = this.api.from_template(
              {
                name: CLUSTER_BINDING_ROLE_NAME,
                service_account_name: service_account,
  				      project,
  				      role: CLUSTER_ROLE_NAME
              },
              Binding)

    return {Roles, RolesBinding}
  }

  setupServiceAccount(name){
    return this.api.from_json(SERVICE_ACCOUNT(name)).post()
  }

  setup(RoleType) {
    let { name, project } = this.target
    let { Roles, RolesBinding } = this.load(RoleType)

  	return Roles.post()
                .then(RolesBinding.isValidResponseFromOCP)
        	   	  .then(completed => RolesBinding.post())
        		    .then(RolesBinding.isValidResponseFromOCP)
                .then(done => console.log('Response =>', done))
        		    .catch(err => console.log('error => ', err))
  }
}

module.exports = Credentials
