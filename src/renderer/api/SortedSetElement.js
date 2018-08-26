
import Element from './Element'

export default class SortedSetElement extends Element {
  async scan(search) {
    const match = search ? '*'+search+'*' : '*'
    const list = await this.scanStream('zscan', match, 100)

    return list.map((item) => {
      return {key: null, value: item[0], score: item[1]}
    })
  }

  get hasElementScore() {
    return true
  }
}