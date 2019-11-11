const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')
const KeycloakConfigurator = require('./lib/configure')
const ssecure_service = require('./lib/secure_service_tester')
const SPI = require('./lib/spi')
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

  'client': async function(url, username, password, realm) {
    let spi = await SPI(url, username, password, realm)
    let client = await spi.client.get()
    console.log('clients => ', client)
  },

  'add-client': async function(url, username, password, realm) {
    let spi = await SPI(url, username, password, realm)
    let client = {
      clientId: 'amaranto',
      consentRequired: false,
      standardFlowEnabled: true,
      implicitFlowEnabled: true,
      directAccessGrantsEnabled: true
    }

    let ret = await spi.client.post(client)
    console.log('add-client => ', ret)
  },
   
  'providers': async function(url, username, password, realm) {
    let spi = await SPI(url, username, password, realm)
    let federated = await spi.providers.get()
    console.log('providers =>', federated)
  },

  'federated': async function(url, username, password, realm) {
    let spi = await SPI(url, username, password, realm)
    let federated = await spi.federation.get()
    console.log('federated =>', federated)
  },

  roles: (url, username, password, realm) => {
      KeycloakConfigurator.run(url, username, password, realm)
  },

  config: (url, username, password, realm) => {
      KeycloakConfigurator.run(url, username, password, realm)
  }

}).run()
