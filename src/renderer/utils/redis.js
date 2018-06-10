import Store from 'electron-store'

const store = new Store()
const CONNECT_MAP = 'connectMap'

export function getConnectMap() {
  const map = store.get(CONNECT_MAP)
  return map ? map : {}
}

export function setConnectMap(connectionMap) {
  return store.set(CONNECT_MAP, connectionMap)
}

export function cleanConnect() {
  return store.delete(CONNECT_MAP)
}