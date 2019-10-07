

const CMD = require('./lib/cmd')
const Clean = require('./lib/clean')
const OAuth2 = require('./lib/oauth2')


new CMD({
  clean: () => new Clean().doIt(),
  clear: () => new Clean().doIt(),
  url: (url, name, realm) => {
    console.log(' == calling:', url, 'name:', name)
    OAuth2(url, name, realm)
}
}).run()
