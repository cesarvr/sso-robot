const _ = require('lodash')

const replacer = (old_value, n_value, placeholder) => {
	let pattern = '${'+placeholder+'}'
	
	if(_.isString(old_value) && old_value.includes(pattern)){

		n_value.indexOf()

		return old_value.replace(pattern, n_value)
	}

	return old_value
}

const has_placeholders = (old_value) => _.isString(old_value)?old_value.includes('${'):false

const detect_type = (obj) => {
	if(_.isArray(obj)) return []
	if(_.isObject(obj)) return {}
}


function parser({okd, placeholders}) {
	let keys = Object.keys(okd)
	let oo = detect_type(okd)

	keys.forEach(key => {
		let val = okd[key]
		
		if(_.isObject(val)) 
			oo[key] = parser({okd: val, placeholders})
		else {
			if( has_placeholders(val) )
				oo[key] = placeholders
								.map(placeholder => replacer(val, placeholder.value, placeholder.name))
								.filter(value => value !== val )[0] || ''
			else
				oo[key] = val
		}
	})

	return oo
}


class Template {
	constructor(templateFile){
		this.sso = JSON.parse( require('fs').readFileSync(templateFile).toString() ) 
	}

	paramWithName(key){
		let ff = this.sso.parameters.find(params => params.name === key)
		return ff
	}

	objectWithName(key){
		let ff = this.parse().find(params => {
			return params.metadata.name === key
		})
		return ff
	}

	update(key, value){
		let field = this.sso.parameters.find(params => params.name === key)
		field.value = value
	}

	parse(){
		let placeholders = this.sso.parameters.filter(element => element.hasOwnProperty('value') )

		return this.sso.objects.map(object => parser({okd: object, placeholders }) )
	}
}



module.exports = Template