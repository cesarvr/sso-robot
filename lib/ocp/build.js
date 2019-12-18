const okdAPI = require('okd-api')
const _ = require('lodash')
const Utilities = require('../tools')
const Workspace = require('./workspace')
const cluster = require('./ocp-server-url')
const watch = require('./watch')
const workspace = new Workspace()

class Build {
  robot({name, project, token, target}){
    const api  = okdAPI.okd(cluster, token).namespace(project)
    const file = workspace.compressRoot('./build.tar')

    return Promise.all([ api.bc.find(name),
            api.dc.find(name)
          ])
      .then(progress => progress.map(Utilities.exitIfNotFound) )
      .then(result =>  api.bc.binary(file, name) )
      .then(buildIsOver => workspace.clean() )
      .then(buildIsOver => watch.dc({name, project, token}) )
      .then(_.clone({name, project, token, target}))
      .catch(err => {
        console.log('err =>', err)
        workspace.clean()
      })
  }
}

module.exports = new Build()
