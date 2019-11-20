const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')
const ssecure_service = require('./lib/secure_service_tester')
const SPI = require('./lib/spi')
const _ = require('lodash')


const CreateOKDProject = require('./lib/ocp/create')
const OKDResourceTemplate = require('./lib/ocp/template')
const ImageBuilder = require('./lib/ocp/image-builder')



let user     = process.env['RHSSO_ADMIN_USER'] || 'admin'
let password = process.env['RHSSO_ADMIN_PASSWORD'] || 'admin'


async function KCResourceFactory(resource, url, realm, id){

  if(_.isEmpty(url)) {
    console.log(`Need an URL!!`)
    process.exit(-1)
  }

  if(_.isEmpty(resource)){
    console.log(`Need an resource example: node sso.js -get url realms`)
    process.exit(-1)
  }

  
  let spi = await SPI(url, user, password, realm, id)
  let spiResource = spi[resource]

  if(_.isEmpty(spiResource)){
    console.log(`Resource (${spiResource}) doesn't exist or not implemented`)
    process.exit(-1)
  }

  return spiResource
}

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

  url: (url, name, password, realm) => {
    console.log(' == calling:', url, 'name:', name, 'password:', password)
    OAuth2.loginWithCredentials(url, name, password, realm)
  },

  impersonate: (url, name) => {
    console.log(' == calling:', url, 'name:', name)

    OAuth2.loginAsDevUser(url, name)
  },

  /*shorcut for impersonate*/
  ip: (url, name) => {
    console.log(' == calling:', url, 'name:', name)
    OAuth2.loginAsDevUser(url, name)
  },

  get_roles: (url, name, svc) => {
    ssecure_service(url, name, svc)
  },

  get: async function(resource, url, realm, id) {

    let keycloakREST = await KCResourceFactory(resource, url, realm, id)

    let federated = await keycloakREST.get()
    console.log(federated)
  },

  post: async function(resource, url, file, realm, id) {

    let keycloakREST = await KCResourceFactory(resource, url, realm, id)
    let payload = JSON.parse( require('fs').readFileSync(file).toString() ) 
    
    console.log('payload=>', payload)
    
    let federated = await keycloakREST.post(payload)
    console.log(federated)
  },
   
  install: (name, project, token) => {
    console.log('installing that -> ', name, project, token)
    let simpleSSO  = new OKDResourceTemplate('./lib/ocp/templates/sso.json')
    let okdCreator = new CreateOKDProject(simpleSSO)

    okdCreator.create(name, project, token)
  },

  builder: (name, project, token) => {

    ImageBuilder(name, project, token)
  },

  "install-with-pg": (name, project, token) => {
    console.log('installing with-pg that -> ', name, project, token)
    let postgressSSO = new OKDResourceTemplate('./lib/ocp/templates/sso-postgress.json')
    let okdCreator   = new CreateOKDProject(postgressSSO)

    okdCreator.create(name, project, token)
  }

}).run()
