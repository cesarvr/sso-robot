const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')
const KeycloakConfigurator = require('./lib/configure')
const ssecure_service = require('./lib/secure_service_tester')
const SPI = require('./lib/spi')
const CreateOKDProject = require('./lib/ocp/create')
const _ = require('lodash')

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

 'get': async function(resource, url, realm) {
    let user     = process.env['RHSSO_ADMIN_USER'] || 'admin'
    let password = process.env['RHSSO_ADMIN_PASSWORD'] || 'admin'
    
    if(_.isEmpty(url)){
      console.log(`Need an URL!!`)
      process.exit(-1)
    }

    if(_.isEmpty(resource)){
      console.log(`Need an resource example: node sso.js -get url realms`)
      process.exit(-1)
    }
  
    let spi = await SPI(url, user, password, realm)
    let spiResource = spi[resource]

    if(_.isEmpty(spiResource)){
      console.log(`Resource (${spiResource}) doesn't exist or not implemented`)
      process.exit(-1)
    }

    let federated = await spiResource.get()
    console.log(federated)
  },


 'post': async function(resource, url, file, realm) {
    let user     = process.env['RHSSO_ADMIN_USER'] || 'admin'
    let password = process.env['RHSSO_ADMIN_PASSWORD'] || 'admin'
    
    if(_.isEmpty(url)){
      console.log(`Need an URL!!`)
      process.exit(-1)
    }

    if(_.isEmpty(resource)){
      console.log(`Need an resource example: node sso.js -get url realms`)
      process.exit(-1)
    }

    let payload = JSON.parse( require('fs').readFileSync(file).toString() ) 
    console.log('payload=>', payload)
    
    let spi = await SPI(url, user, password, realm)
    let spiResource = spi[resource]

    if(_.isEmpty(spiResource)){
      console.log(`Resource (${spiResource}) doesn't exist or not implemented`)
      process.exit(-1)
    }

    let federated = await spiResource.post(payload)
    console.log(federated)
  },

   
  roles: (url, username, password, realm) => {
      KeycloakConfigurator.run(url, username, password, realm)
  },

  config: (url, username, password, realm) => {
      KeycloakConfigurator.run(url, username, password, realm)
  },

  'new-sso' : (name, project) => {
    CreateOKDProject(name, project)
  }

}).run()
