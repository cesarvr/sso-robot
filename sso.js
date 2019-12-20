const _         = require('lodash')
const CMD       = require('./lib/cmd')
const Clean     = require('./lib/clean')
const OAuth2    = require('./lib/oauth2')
const Utilities = require('./lib/tools')

const KeycloakFactory = require('./lib/keycloak')

const ssecure_service = require('./lib/secure_service_tester')
const install = require('./lib/ocp/install')
const Credentials = require('./lib/ocp/credentials')
const build = require('./lib/ocp/build')
const watch = require('./lib/ocp/watch')
const Token = require('./lib/ocp/token')
const CreateOKDProject = require('./lib/ocp/create')
const OKDResourceTemplate = require('./lib/ocp/template')
const ImageBuilder = require('./lib/ocp/image-builder')
const { updateDeployment, createRobotCredentials} = require('./lib/ocp/update')
const OKDTest  = require('./lib/ocp/find')
const OKDRoute = require('./lib/ocp/routes')

let user     = process.env['RHSSO_ADMIN_USER'] || 'admin'
let password = process.env['RHSSO_ADMIN_PASSWORD'] || 'admin'


/*
  Usage: node sso.js -param args

  CMD parse those params and create a function....
  {
    params: (args)=>
  }
*/

new CMD({
  clean: () => new Clean().doIt(),

  clear: () => new Clean().doIt(),

  openid: {
    required: ['realm', 'url', 'username', 'password', 'client'],
    executor: async function(options) {
     let token = await OAuth2.loginWithCredentials(options.params)
     console.log(token)
    }
  },

  user: (url, name) => {
    OAuth2.loginAsDevUser(url, name)
  },

  /*shorcut for impersonate*/
  ip: (url, name) => {
    OAuth2.loginAsDevUser(url, name)
  },

  get: {
    required: ['realm', 'url'],
    executor: async function(options) {
      let opts = _.merge({resource: options.resource }, options.params)
      let keycloakREST = await KeycloakFactory( opts )
      let federated    = await keycloakREST.get()
      console.log(federated)
    }
  },

  find: {
    required: ['realm', 'url', 'query'],
    executor: async function(options) {
      let opts = _.merge({resource: options.resource}, options.params)
      let keycloakREST = await KeycloakFactory( opts )

      let query = Utilities.get_query_helper(options)
      let findings = await keycloakREST.find( query )
      console.log(findings)
    }
  },

  filter: {
    required: ['realm', 'url', 'query'],
    executor: async function(options) {
      let opts = _.merge({resource: options.resource}, options.params)
      let keycloakREST = await KeycloakFactory( opts )

      let query = Utilities.get_query_helper(options)
      console.log('query=> ', query)
      let findings = await keycloakREST.filter( query )
      console.log(findings)
    }
  },

  post: {
    required: ['realm', 'url', 'from-file'],
    executor: async function(options) {
      let opts = _.merge({resource: options.resource}, options.params)
      let keycloakREST = await KeycloakFactory( opts )
      let fileName = options.params['from-file']

      let payload = JSON.parse( require('fs').readFileSync(fileName).toString() )
      let federated = await keycloakREST.post(Utilities.remove_ids(payload))
      console.log(federated)
    }
  },

  role: {
    required: ['token', 'project', 'service_account'],
    executor: options => {
      let credentials = new Credentials(options.params)

      const CLUSTER_ROLE_TEMPLATES = {
          Role: './templates/ocp/role/cluster-role.yml',
          Binding: './templates/ocp/role/cluster-binding.yml'
      }

      const ROLE_TEMPLATES = {
          Role: './templates/ocp/role/role.yml',
          Binding: './templates/ocp/role/binding.yml'
      }

      const actions = {
        cluster: () => credentials.setup(CLUSTER_ROLE_TEMPLATES).then(done => console.log('ClusterRoles has been updated')),
        new: () => credentials.setup(ROLE_TEMPLATES).then(done => console.log('Roles has been updated')),      
      }
    
      Utilities.chooseYourPath(actions, options)
    }
  },

  install: {
    required: ['token', 'project', 'name'],
    executor: options => {

      let credentials = new Credentials(options.params)
     
      const actions = {
        robot: () => credentials.setupServiceAccount(options.params.name)
                                .then( done => install.onOpenShift(options.params)
                                .then( build.robot(options.params) ) ),

        roles: () => createRobotCredentials(options.params),

        build: () => { 
          console.log('creating a new container...')
          build.robot(options.params) 
        }
      }
      
      Utilities.chooseYourPath(actions, options)  
    }
    
  },

  test: {
    required: ['token', 'project'],
    executor: options => { OKDTest(options.params) }
  },

  route: {
    required: ['name', 'token', 'project'],
    executor: (options) => {
      OKDRoute(options.params)
    }
  },

  deploy: {
    required: ['name', 'token', 'project'],
    executor: (options) => {

      const actions = {
        update: () => updateDeployment(options.params),
        create: () => {
          let simpleSSO  = new OKDResourceTemplate('./lib/ocp/templates/sso.json')
          let okdCreator = new CreateOKDProject(simpleSSO)

          okdCreator.create(options.params)
        },
        watch: ()=> watch.dc(options.params)
      }

      Utilities.chooseYourPath(actions, options)
    }
  },

  image: {
    required: ['name', 'token', 'project'],
    executor: (options) => {

      const actions = {
        update: () => updateDeployment(options.params),
        create: () => ImageBuilder(options.params)
      }

      Utilities.chooseYourPath(actions, options)
    }
  },

  useThisImage: (name, image, project, token) => {
    updateDeployment(name, image, project, Token(token))
  },

  "install-persistence": (name, project, token) => {
    console.log('installing with-pg that -> ', name, project, token)
    let postgressSSO = new OKDResourceTemplate('./lib/ocp/templates/sso-postgress.json')
    let okdCreator   = new CreateOKDProject(postgressSSO)

    okdCreator.create(name, project,  Token(token))
  }

}).run()
