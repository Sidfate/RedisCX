
import Element from './Element'
import md5 from 'md5'

export default class ListElement extends Element {

  async save(element) {
    const length = await this.handler.llen(this.key)

    if(!element.key || element.key >= length) {
      await this.handler.lpush(this.key, element.value)
    }else {
      await this.handler.lset(this.key, element.key, element.value)
    }
  }

  async batchDelete(list) {
    let pipeline = this.handler.pipeline()

    console.log(md5(111))
    list.forEach((item) => {
      pipeline.lset(this.key, item.key, md5(item.key))
      pipeline.lrem(this.key, 0, md5(item.key))
    })

    return this.exec(pipeline)
  }

  async scan(search) {
    const listLength = await this.handler.llen(this.key)
    const list = await this.handler.lrange(this.key, 0, listLength)


    let result = []
    list.map((value, key) => {
      if(!search || value.indexOf(search) >= 0) {
        result.push({key, value})
      }
    })

    return result
  }

  get hasElementKey() {
    return true
  }
}