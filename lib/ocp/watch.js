const okdAPI = require('okd-api')
const _ = require('lodash')
const cluster = require('./ocp-server-url')


const isRolledOut = (events) =>  !_.isEmpty( events.find(({message}) => message.includes(`successfully rolled out`) ) )
const didDeploymentFinish = (events, name, version ) => !_.isEmpty( events.find(({message}) => message.includes(`"${name}-${version}" successfully rolled out`) ) )
    
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
  	let isDeploymentInProgress = false
    let nextVersion = -1

  	console.log(`watching ${name}...`)
  	api.dc.watch(name, (raw_events) => {

  		let events = getDeploymentEvents(raw_events)

      //console.log('type -> ', raw_events.type, ' evts -> ', events, `"${name}-${nextVersion}" successfully rolled out`)

  		if(raw_events.type === 'ADDED' && isRolledOut(events)) {
          nextVersion = (events[0].version + 1)
  				return
  		}

  		if( didDeploymentFinish(events, name, nextVersion) ) {
  			console.log('Image has been deployed, getting the route...')
          
        api.dc.get_pods(name).then(done => {  
          let pod = _.first(done)
          console.log(`You might need to add some roles to ${name} service account try: \n node sso.js role new --service_account=${name} --project=${project} --token=${token}`)
          console.log(`Then you can install RHSSO with: \n oc exec -n ${project} ${pod.metadata.name} -- node sso.js deploy create --name=my-sso --project=${project}`)
        })
        .then(done => process.exit(0))
  		}

  	})
  }
}


module.exports = new Watch()
