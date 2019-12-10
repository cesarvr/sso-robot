const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')
const { read_params, remove_ids, parseEqualitySyntax, get_query_helper } = require('./lib/tools')
const ssecure_service = require('./lib/secure_service_tester')
const {KeycloakFactory} = require('./lib/keycloak')
const _ = require('lodash')

const Token = require('./lib/ocp/token')
const CreateOKDProject = require('./lib/ocp/create')
const OKDResourceTemplate = require('./lib/ocp/template')
const ImageBuilder = require('./lib/ocp/image-builder')
const { updateDeployment, createRobotCredentials, installOnOpenShfit, buildThisProject} = require('./lib/ocp/update')
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

      let query = get_query_helper(options)
      let findings = await keycloakREST.find( query )
      console.log(findings)
    }
  },

  filter: {
    required: ['realm', 'url', 'query'],
    executor: async function(options) {
      let opts = _.merge({resource: options.resource}, options.params)
      let keycloakREST = await KeycloakFactory( opts )

      let query = get_query_helper(options)
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
      let federated = await keycloakREST.post(remove_ids(payload))
      console.log(federated)  
    }
  },
   
  install: {
    required: ['token', 'project', 'name'],
    executor: options => {
      
      const actions = {
        robot: () => installOnOpenShfit(options.params),
        roles: () => createRobotCredentials(options.params),
        build: () => buildThisProject(options.params)
      }

      let exec = actions[options.resource]

      if(!_.isUndefined(exec))
        exec()
      else 
      {
        console.log(`Command not found try: node sso.js -image [${Object.keys(actions).join(', ')}]`)
      }
    }
  },

  test: {
    required: ['token', 'project'],
    executor: options => {  console.log('opts => ', options);  OKDTest(options.params) }
  },

  route: {
    required: ['token', 'project'],
    executor: (options) => {
      OKDRoute(name, options.project, options.token)  
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
        }
      }

      let exec = actions[options.resource]

      if(!_.isUndefined(exec))
        exec()
      else 
      {
        console.log(`Command not found try: node sso.js -image [${Object.keys(actions).join(', ')}]`)
      }
    }
  },

  image: {
    required: ['name', 'token', 'project'],
    executor: (options) => {

      const actions = {
        update: () => UpdateSSO(options.params),
        create: () => ImageBuilder(options.params)
      }

      let exec = actions[options.resource]

      if(!_.isUndefined(exec))
        exec()
      else 
      {
        console.log(`Command not found try: node sso.js -image [${Object.keys(actions).join(', ')}]`)
      }

      //OKDRoute(name, options.project, options.token)  
    }
  },

  useThisImage: (name, image, project, token) => {
    UpdateSSO(name, image, project, Token(token))
  },

  "install-p": (name, project, token) => {
    console.log('installing with-pg that -> ', name, project, token)
    let postgressSSO = new OKDResourceTemplate('./lib/ocp/templates/sso-postgress.json')
    let okdCreator   = new CreateOKDProject(postgressSSO)

    okdCreator.create(name, project,  Token(token))
  }

}).run()
