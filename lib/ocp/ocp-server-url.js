const _ = require('lodash')
module.exports = function() {
	const KUBERENTES_SERVER =  !_.isUndefined(process.env['OKD_SERVER'])?process.env['OKD_SERVER'].trim(): `https://${process.env['KUBERNETES_SERVICE_HOST']}:${process.env['KUBERNETES_SERVICE_PORT_HTTPS']}`

	//TODO Delete me
	//console.log(  _.isEmpty(KUBERENTES_SERVER)? "Warning: No backend URL available": `Kubernetes API server: ${KUBERENTES_SERVER}` )
	return KUBERENTES_SERVER
}()