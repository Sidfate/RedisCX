import Store from 'electron-store'

const store = new Store()
const CONNECT_MAP = 'connectMap'
const SEARCH_HISTORY = 'searchHistory'

//cleanSearchHistory()
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

export function getSearchHistory(domain) {
  const map = store.get(SEARCH_HISTORY+'.'+domain)
  return map ? map : []
}

export function addSearchHistory(domain, list) {
  return store.set(SEARCH_HISTORY+'.'+domain, list)
}

export function cleanSearchHistory() {
  return store.delete(SEARCH_HISTORY)
}