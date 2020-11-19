const EventSource = require('eventsource')
const {inspect} = require('util')
const chalk = require('chalk')

const url = process.argv[2] || 'http://localhost:4040/raw/posts/bar'
const es = new EventSource(url)

// console.log('es', es)

let streamHeaders = null

let value

es.onmessage = e => {
  // console.log('e.data', e.data)

  const message = JSON.parse(e.data)
  let {headers, version, data} = message
  // if (version === undefined) {
  //   version = 'unknown'
  //   data = message
  // }
  if (headers != null) streamHeaders = headers

  value = data
  
  console.clear()
  if (streamHeaders) {
    for (const k in streamHeaders) {
      console.log(`${chalk.yellow(k)}: ${streamHeaders[k]}`)
    }
    console.log()
  }
  console.log(`${chalk.yellow('version')}: ${chalk.cyan(version)}`)
  console.log(`${chalk.yellow('value')}:`)

  console.dir(value, {compact: false, depth: null})
}