
import Element from './Element'

export default class ListElement extends Element {
  async add(member) {
  }

  async set(field, value) {x
  }

  async delete(member) {

  }

  async scan(search) {
    const listLength = await this.handler.llen(this.key)
    const list = await this.handler.lrange(this.key, 0, listLength)

    return list.map((value, key) => {
      return {key, value}
    })
  }

  get hasElementKey() {
    return true
  }
}