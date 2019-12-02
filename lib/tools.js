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
		console.log('cmd: ',  cmds)
	return cmds
}

const remove_ids = (obj) => {
	let keys = Object.keys(obj)

	keys = keys.filter(key => key !== 'id')
	return _.pick(obj, keys)
} 


module.exports = { read_params, remove_ids, read_command, parseEqualitySyntax } 