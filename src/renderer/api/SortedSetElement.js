
import Element from './Element'

export default class SortedSetElement extends Element {

  async save(element) {
    if(element.rawValue) {
      await this.handler.zrem(this.key, element.rawValue)
    }
    await this.handler.zadd(this.key, element.score, element.value)
  }

  async batchDelete(list) {
    let pipeline = this.handler.pipeline()

    list.forEach((item) => {
      pipeline.zrem(this.key, item.value)
    })

    return this.exec(pipeline)
  }

  async scan(search) {
    const match = search ? '*'+search+'*' : '*'
    const list = await this.scanStream('zscan', match, 100)

    let result = []
    list.map((item, index) => {
      item.map((one, index) => {
        if(index%2 === 0) {
          result.push({value: one, score: item[index+1]})
        }
      })
    })

    return result
  }

  get hasElementScore() {
    return true
  }
}