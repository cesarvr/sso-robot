
const okdAPI = require('okd-api')
const _ = require('lodash')

const cluster = require('./ocp-server-url')
const IMG_TEMPLATES = [ {name:'build', file:'./lib/ocp/templates/sso-img-build.json'}, {name: 'is', file: './lib/ocp/templates/sso-img-is.json' } ]

const loadTemplates = ({name, file}) => { 
	return { name, 
			 file: JSON.parse( require('fs').readFileSync(file).toString() ) 
		   } 
}

const configureTemplateNames = (tname, {name, file}) => { 
	file.metadata.name = tname
	file.metadata.annotations.application = tname

	return { name, file }  
}

const setBuilderImageStream = (name, builderImage) => {
	builderImage.file.spec.output.to.name = `${name}:latest` 
	return builderImage	
}

const newImageBuilder = (name, PROJECT, token) => {
		let files = IMG_TEMPLATES
			.map(template => loadTemplates(template))
			.map(template => configureTemplateNames(name, template))
		

		setBuilderImageStream(name, files[0])

		console.log("files =>", JSON.stringify( files,null,4) , token )
		const OKD = okdAPI.okd(cluster, token).namespace(PROJECT)

		let resources = files.map(( {file} ) => OKD.from_json(file)).map(res => res.post())

		Promise.all(resources).then(res => console.log(res)).catch(err => console.log("somethin went wrong.. ", err))
}

module.exports = newImageBuilder