
import Element from './Element'

export default class SetElement extends Element {
  async save(element) {
    if(element.rawValue) {
      await this.handler.srem(this.key, element.rawValue)
    }
    await this.handler.sadd(this.key, element.value)
  }

  async batchDelete(list) {
    let pipeline = this.handler.pipeline()

    list.forEach((item) => {
      pipeline.srem(this.key, item.value)
    })

    return this.exec(pipeline)
  }

  async scan(search) {
    const match = search ? '*'+search+'*' : '*'
    const list = await this.scanStream('sscan', match, 10)

    return list[0].map((item) => {
      return {key: null, value: item}
    })
  }
}