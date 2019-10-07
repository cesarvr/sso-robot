const fs = require('fs')
const LOGS = "./logs"

module.exports = class Clean {
  doIt() {

    let files = fs.readdirSync(LOGS)
    files.filter(file => file.includes(".json"))
         .forEach(file => fs.unlinkSync(`${LOGS}/${file}`))
  }
}
