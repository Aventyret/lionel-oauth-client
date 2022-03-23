const storageKeys = <const>['accessToken', 'idToken', 'state', 'codeVerifier']
export type StorageKey = typeof storageKeys[number]

const storageModuleTypes = <const>['local', 'session']
export type StorageModuleType = typeof storageModuleTypes[number]

export interface StorageModule {
  storage: Storage
  set: (key: StorageKey, value: string) => void
  get: (key: StorageKey) => string
  remove: (key: StorageKey) => void
  clear: () => void
}

const invalidKey = (key: StorageKey) => {
  if (storageKeys.includes(key)) return
  throw Error('Invalid storage key')
}

export const createStorageModule = (
  type: StorageModuleType = 'local'
): StorageModule => {
  if (!storageModuleTypes.includes(type))
    throw Error('Not a valid storage type')

  const storage = 'session' ? sessionStorage : localStorage

  const set = (key: StorageKey, value: string) => {
    invalidKey(key)
    storage.setItem(key, value)
  }

  const get = (key: StorageKey) => {
    invalidKey(key)
    const value = storage.getItem(key)
    if (!value) throw Error('Value not set')
    return value
  }

  const remove = (key: StorageKey) => {
    invalidKey(key)
    storage.removeItem(key)
  }

  const clear = () => {
    storage.clear()
  }

  return {
    storage,
    set,
    get,
    remove,
    clear
  }
}

export default createStorageModule
