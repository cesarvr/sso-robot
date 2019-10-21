const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')
const KeycloakConfigurator = require('./lib/configure')

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
    OAuth2(url, name, password, realm)
  },
  roles: (url, username, password, realm) => {
      KeycloakConfigurator.run(url, username, password, realm)
  },
  config: (url, username, password, realm) => {
      KeycloakConfigurator.run(url, username, password, realm)
  }
}).run()
