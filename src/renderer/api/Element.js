
var _ = require('lodash')
var Redis = require('ioredis')

export default class Element {
  constructor(handler, key) {
    this.handler = handler
    this.key = key
  }

  get hasElementKey() {
    return false
  }

  get hasElementScore() {
    return false
  }

  scanStream(command, match, count) {
    return new Promise((resolve, reject) => {
      let allKeys = []

      let stream = this.handler[command+'Stream'](this.key, {
        match,
        count
      })

      stream.on('data', function (resultKeys) {
        allKeys.push(resultKeys)
      })
      stream.on('end', function () {
        resolve(allKeys)
      })
    })
  }

  exec(pipeline) {
    console.log(pipeline)
    return new Promise((resolve, reject) => {
      pipeline.exec(function (err, results) {
        let error = _.find(results, (o)=> (o[0] instanceof Redis.ReplyError))

        if(error) {
          reject(error[0].message)
        }else {
          resolve()
        }
      })
    })
  }
}