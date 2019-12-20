
const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')
const Utilities = require('../tools')
const { spawn } = require('child_process')

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

function checkIfWeAreLoggedIn(ocProcess, cb){
  ocProcess.stdout.on('data', function(data) {
    if(data.toString().includes('Logged into'))
     cb(true)
  })
}

function handleErrors(ocProcess){
  ocProcess.stderr.on('data', function(data) {
    console.log('Error while using oc-client: ', data.toString())
  })
}

function loadRoles(ocProcess, template){
  console.log('payload => ', template)
  return new Promise((resolve, reject) => {
    ocProcess.stdin.write(template)
    ocProcess.stdin.end()
    if( !_.isEmpty( process.env['DEBUG']) )
      ocProcess.on('data', (data) => console.log(data) )

    ocProcess.stderr.on('data', (data) => process.stdout.write(data) )
    ocProcess.on('exit', () => resolve(true) )

  })


}


class Credentials {

  constructor({service_account, project, token}){
    this.api = okdAPI.okd(cluster, token).namespace(project)
    this.target = {service_account, project}
    this.openshift = {service_account, project, token}
  }

  setupUsingOC(RoleType){
    let areWeLoggedIn = false

    let newRole = [ 'create',
                    'role',
                    CLUSTER_ROLE_NAME,
                    '--verb=create,delete,get,list,update,watch,patch',
                    '--resource=pod,routes,svc,imagestreams,dc,bc'
                  ]
                  
    let appendRoles = [  'adm',
                         'policy',
                         `system:serviceaccount:${this.target.project}:${this.target.service_account}`,
                         `--role-namespace=${this.target.project}`,
                         `-n`,
                         this.target.project]


    const ocLogin = spawn('oc', ['login', cluster, `--token=${this.openshift.token}`])
    const ocCreateRole = () => spawn('oc', appendRoles)
    let { Roles, RolesBinding } = this.load(RoleType)
//oc adm policy add-role-to-user system:serviceaccount:ctest:deployer-bot deployer-bot --role-namespace=ctest  -n ctest
    console.log('trying to setup roles using the oc-client')

    checkIfWeAreLoggedIn(ocLogin,  logged => areWeLoggedIn = logged)
    handleErrors(ocLogin)

    ocLogin.on('exit', (code) => {
      console.log('process exit!!, are we logged in: ', areWeLoggedIn)
      if(areWeLoggedIn)
        {
          loadRoles(ocCreateRole(), Roles._tmpl.str())
          .then(done => console.log('Done..!!'))//loadRoles(ocCreateRole(), RolesBinding._tmpl.str()) )
          .catch(error => console.log('Crash :( '))
        }
    })
  }

  load({ Role, Binding }) {
    let {service_account, project} = this.target
    let Roles = this.api.from_template({
                        name:CLUSTER_ROLE_NAME,
                        project
                      },  Role)

    let RolesBinding = this.api.from_template(
              {
                name: CLUSTER_BINDING_ROLE_NAME,
                service_account_name: service_account,
  				      project,
  				      role: CLUSTER_ROLE_NAME
              },
              Binding)

    return { Roles, RolesBinding }
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
