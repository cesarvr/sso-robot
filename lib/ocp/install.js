const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')
const Utilities = require('../tools')

class Install{
  onOpenShift({name, project, token, target}) {
    const api = okdAPI.okd(cluster, token).namespace(project)

  	let bc = api.from_template({ name }, './templates/ocp/builder.yml')
  	let is = api.from_template({ name }, './templates/ocp/is.yml')
  	let dc = api.from_template({ name,
  								 service_account_name:name,
  								 project
  								}, './templates/ocp/dc.yml')

   	return Promise.all([bc.post(), dc.post(), is.post()])
   		   .then(completed => completed.map(Utilities.isValidResponseFromOCP) )
   		   .then(completed => completed.map(Utilities.showResponseFromOCP))
         .then(resp => _.clone({name, project, token, target}) )
   		   .catch(err => console.log('err => ' , err ) )
  }
}

module.exports = new Install()
