const _ = require('lodash')
module.exports = function() {
	let KUBERENTES_SERVER = undefined

	if(!_.isEmpty(process.env['OKD_SERVER'])){
		KUBERENTES_SERVER = process.env['OKD_SERVER'].trim()
	}

	if(!_.isEmpty(process.env['KUBERNETES_SERVICE_HOST'] ) ){
		KUBERENTES_SERVER = `https://${process.env['KUBERNETES_SERVICE_HOST']}:${process.env['KUBERNETES_SERVICE_PORT_HTTPS']}`	
	}

	//TODO Delete me
	//console.log(  _.isEmpty(KUBERENTES_SERVER)? "Warning: No backend URL available": `Kubernetes API server: ${KUBERENTES_SERVER}` )

	if(_.isEmpty(KUBERENTES_SERVER))
	{
		console.log("Need the URL for the openshift server (ie export OKD_SERVER=https://my-openshift-server)")
		process.exit(-1)
	}

	if(!_.isEmpty(process.env['DEBUG']))
		console.log('Server URL: ' + KUBERENTES_SERVER)
	
	return KUBERENTES_SERVER
}()