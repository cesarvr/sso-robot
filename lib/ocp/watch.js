const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')

const didDeploymentFinish = (events ) =>
    !_.isEmpty( events.find(({message}) => message.includes('successfully rolled out') ) )


function getDeploymentEvents(raw_events){
	let events = raw_events.object.status.conditions.map(state => _.clone({
			action: state.type,
			version: raw_events.object.status.latestVersion,
			status: state.status,
			message: state.message,
	}) )

	return events
}

class Watch {
  dc({name, project, token}){
  	const api  = okdAPI.okd(cluster, token).namespace(project)
  	let evtss = []
  	let isDeploymentInProgress = false

  	console.log(`watching ${name}...`)
  	api.dc.watch(name, (raw_events) => {

  		let events = getDeploymentEvents(raw_events)
  		evtss.push(raw_events)

  		if(raw_events.type === 'ADDED' && didDeploymentFinish(events)) {
  				return
  		}

  		if(didDeploymentFinish(events)) {
  			console.log('Image has been deployed...')
  			process.exit(0)
  		}

  	})
  }
}


module.exports = new Watch()
