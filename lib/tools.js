const _ = require('lodash')

const parseEqualitySyntax = (syntax) => {
	return syntax.map(as => as.split('=')).reduce((current, next) => {
		let key = next[0], value = next.slice(1, next.length).join('=')
		current[key] = value
		return current
	} , {})
}

const read_params = (args) => {
	let ass = args.filter(arg => arg.includes('--'))
	let pairs = ass.map(as => as.replace('--',''))

	let ret = parseEqualitySyntax(pairs)

	if(!_.isEmpty( process.env['DEBUG'] ) ) {
		console.log(`args: ${args} ==> params: ${JSON.stringify(ret, null, 4) } `)
	}

	return ret
}

const read_command = (args) => {
	let cmds = args.slice(2, args.length).filter(v => !v.includes('--'))
	
	if(!_.isEmpty( process.env['DEBUG'] ) )
		console.log('cmd: ',args,  cmds)
	return cmds
}

const remove_ids = (obj) => {
	let keys = Object.keys(obj)

	keys = keys.filter(key => key !== 'id')
	return _.pick(obj, keys)
} 

const get_query_helper = (options) => {
  let ret = parseEqualitySyntax(options.params.query.split(',') ) 
  if( !_.isUndefined(process.env['DEBUG'])) 
    console.log('parsing query => ', ret)

  return ret 
}

const watchUntilDeploymentEnds = (OKD, dcName) => {
	console.log("watching DeploymentConfig: ", dcName )

	let iter = 0 
	return new Promise( (resolve, reject) => {
		OKD.dc.watch(dcName, (events) => {
			let deploymentConditions = events.object.status.conditions
			
			if( _.isEmpty( deploymentConditions ) )
				return

			let availableCondition = deploymentConditions.find( condition => condition.type === 'Progressing' )
		
			try{
			console.log('iter -> ', iter)	
			if(availableCondition.reason === 'NewReplicationControllerAvailable' && iter++ > 1)
			{
				console.log('image deployed...')
				//process.exit(0)
				resolve(true)
			}
			}catch(e){
				resolve(true)
			}


		})
	})
}

const isValidResponse = (panicErroCode, response) => {
	let fail = false 

	if(response.kind === 'Status')
	{
		if(!_.isUndefined(response.details))
			console.log('type: ', response.details.kind)
		
		console.log('msg: ' , response.message )
		console.log('code: ', response.code )
	
		if( panicErroCode.indexOf(response.code) !== -1 )
			fail = true
	}

	if(fail){
		process.exit(-1)
	}

	return response
}

const isValidResponseFromOCP = (response) => {
	return isValidResponse([500, 401], response)
}


const exitIfNotFound = (response) => {
	return isValidResponse([500, 401, 404], response)
}

const showResponseFromOCP = (response) => {
	return isValidResponse([], response)
}

module.exports = { 
	read_params, 
	remove_ids, 
	read_command, 
	parseEqualitySyntax, 
	get_query_helper,
	isValidResponseFromOCP,
	showResponseFromOCP,
	exitIfNotFound,
	watchUntilDeploymentEnds
} 