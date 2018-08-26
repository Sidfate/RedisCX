
import Element from './Element'

export default class HashElement extends Element {

  async save(element) {
    await this.handler.hset(this.key, element.key, element.value)
  }

  async batchDelete(list) {
    let pipeline = this.handler.pipeline()

    list.forEach((item) => {
      pipeline.hdel(this.key, item.key)
    })

    return this.exec(pipeline)
  }

  async scan(search) {
    const match = search ? '*'+search+'*' : '*'
    let list = await this.scanStream('hscan', match,  100)

    let result = []
    list.map((item, index) => {
      item.map((one, index) => {
        if(index%2 === 0) {
          result.push({key: one, value: item[index+1]})
        }
      })
    })

    return result
  }

  get hasElementKey() {
    return true
  }

}