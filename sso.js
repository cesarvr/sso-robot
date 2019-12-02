const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')
const { read_params, remove_ids, parseEqualitySyntax } = require('./lib/tools')
const ssecure_service = require('./lib/secure_service_tester')
const {KeycloakFactory} = require('./lib/keycloak')
const _ = require('lodash')

const Token = require('./lib/ocp/token')
const CreateOKDProject = require('./lib/ocp/create')
const OKDResourceTemplate = require('./lib/ocp/template')
const ImageBuilder = require('./lib/ocp/image-builder')
const UpdateSSO = require('./lib/ocp/update')
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

const get_query_helper = (options) => parseEqualitySyntax(options.params.query.split('&'))

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
   
  install: (name, project, token) => {
    console.log('installing that -> ', name, project, token)
    let simpleSSO  = new OKDResourceTemplate('./lib/ocp/templates/sso.json')
    let okdCreator = new CreateOKDProject(simpleSSO)

    okdCreator.create(name, project,  Token(token))
  },

  builder: {
    required: ['name', 'token', 'project'],
    executor: options => ImageBuilder(options.params) 
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
