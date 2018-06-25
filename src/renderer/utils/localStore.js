import Store from 'electron-store'

const store = new Store()
const CONNECT_MAP = 'connectMap'
const SEARCH_HISTORY = 'searchHistory'
const AUTO_SEARCH = 'autoSearch'
const AUTO_SEARCH_LIMIT = 'autoSearchLimit'

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

export function getAutoSearch() {
  return store.has(AUTO_SEARCH) ? store.get(AUTO_SEARCH) : false;
}

export function setAutoSearch(status) {
  return store.set(AUTO_SEARCH, status)
}

export function getAutoSearchLimit() {
  return store.has(AUTO_SEARCH_LIMIT) ? store.get(AUTO_SEARCH_LIMIT) : 10000;
}

export function setAutoSearchLimit(limit) {
  return store.set(AUTO_SEARCH_LIMIT, limit)
}
