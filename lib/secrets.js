
const SPI = require('./spi')

module.exports = async function(url, user, password, realm){
	let spi = await SPI(url, user, password, realm)


	let clients = await spi.client.get()
	let webapp1 = clients.filter(cli => cli.clientId === 'webapp1')[0]
	
	let secretSPI = await SPI(url, user, password, realm, webapp1.id)
	let secret = await secretSPI['client-secret'].get()
	console.log('secret -> ', secret)

	return secret.value
}
