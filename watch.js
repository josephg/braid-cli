const EventSource = require('eventsource')
const {inspect} = require('util')
const chalk = require('chalk')

const url = process.argv[2] || 'http://localhost:4040/raw/posts/bar'
const es = new EventSource(url)

let verbose = true // TODO: Set me with command line flags
let streamHeaders = {}
let patchType // 'full-snapshot' / 'update-keys' / ...?

let isFirst = true
let value

const merge = (patchType, patch) => {
  // console.log('merge', patchType)
  switch (patchType) {
    case 'full-snapshot': return patch
    case 'update-keys': {
      // This just merges the two objects together.
      return {...value, ...patch}
    }
    default: {
      console.error('Unknown patch type', patchType)
      return patch
    }
  }
}

es.onmessage = e => {
  const message = JSON.parse(e.data)
  let {headers, version, data} = message

  console.clear()

  if (isFirst) {
    // TODO: Lowercase all values here.
    if (headers != null) streamHeaders = {...streamHeaders, ...headers}
    patchType = streamHeaders['x-patch-type'] || 'full-snapshot'
    value = data
    isFirst = false
  } else {
    value = merge(patchType, data)
  }
  
  if (streamHeaders) {
    for (const k in streamHeaders) {
      console.log(`${chalk.yellow(k)}: ${streamHeaders[k]}`)
    }
    console.log()
  }
  if (version != null) {
    console.log(`${chalk.cyan('version')}: ${chalk.cyan(version)}`)
  } else {
    console.log(`${chalk.cyan('version')}: ${chalk.red('unset')}`)
  }

  console.log(
    `${chalk.cyan('value')}:`,
    inspect(value, {compact: false, depth: null, colors: process.stdout.isTTY})
  )

  if (verbose) {
    console.log()

    if (patchType !== 'full-snapshot') {
      console.log(
        `${chalk.cyan('last change')}:`,
        inspect(data, {compact: false, depth: null, colors: process.stdout.isTTY})
      )
      console.log(`${chalk.cyan('at')}:`, new Date().toLocaleTimeString())
    }
  
  }
}