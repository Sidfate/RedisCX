
import Element from './Element'

export default class SetElement extends Element {
  async delete() {

  }

  async batchDelete(list) {
    console.log(list)
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