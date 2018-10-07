
import Element from './Element'

export default class StringElement extends Element {

  async scan() {
    const string = await this.handler.get(this.key)
    console.log(string)
    let result = null
    try {
      result = JSON.parse(string)
      if(typeof result !== 'object' || !result) {
        result = string
      }
    }catch (e) {
      result = '' + string
    }

    return result
  }
}