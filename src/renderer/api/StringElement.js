
import Element from './Element'

export default class StringElement extends Element {

  async scan() {
    const string = await this.handler.get(this.key)

    let result = null
    try {
      result = JSON.parse(string)
    }catch (e) {
      result = string
    }

    return result
  }
}