
import HashElement from './HashElement'
import StringElement from './StringElement'
import ListElement from './ListElement'
import SetElement from './SetElement'
import SortedSetElement from './SortedSetElement'

export default class Factory {
  constructor(redis, key) {
    this.redis = redis
    this.key = key
  }

  async build() {
    let element = null
    const type = await this.redis.type(this.key)
    const ttl = await this.redis.ttl(this.key)
    this.type = type
    this.ttl = ttl

    switch (type) {
      case 'string':
        element = new StringElement(this.redis, this.key)
        break
      case 'hash':
        element = new HashElement(this.redis, this.key)
        break
      case 'list':
        element = new ListElement(this.redis, this.key)
        break
      case 'set':
        element = new SetElement(this.redis, this.key)
        break
      case 'zset':
        element = new SortedSetElement(this.redis, this.key)
        break
      default:
        return null
    }
    this.element = element
    return this
  }

  async scan(search) {
    return await this.element.scan(search)
  }

  async batchDelete(list) {
    return await this.element.batchDelete(list)
  }

  async save(element) {
    return await this.element.save(element)
  }

  async getType() {
    return this.type
  }

  async getTtl() {
    return this.ttl
  }

  get hasElementKey() {
    return this.element.hasElementKey
  }

  get hasElementScore() {
    return this.element.hasElementScore
  }
}