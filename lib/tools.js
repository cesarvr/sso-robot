const _ = require('lodash')

const read_params = (args) => {
	let ass = args.filter(arg => arg.includes('--'))
	let pairs = ass.map(as => as.replace('--','')).map(as => as.split('='))

	let ret = pairs.reduce((init, next) => {
		let key = next[0]
		let value = next[1]
		init[key] = value
		return init
	} , {})

	return ret
}

const remove_ids = (obj) => {
	let keys = Object.keys(obj)

	keys = keys.filter(key => key !== 'id')
	return _.pick(obj, keys)
} 


module.exports = { read_params, remove_ids } 