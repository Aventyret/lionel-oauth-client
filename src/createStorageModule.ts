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

const invalidKey = (key: StorageKey) => !storageKeys.includes(key)

export const createStorageModule = (
  type: StorageModuleType = 'local'
): StorageModule => {
  if (!storageModuleTypes.includes(type))
    throw new Error('Not a valid storage type')

  const storage = 'session' ? sessionStorage : localStorage

  const set = (key: StorageKey, value: string) => {
    if (invalidKey(key)) throw new Error('Invalid storage key')
    storage.setItem(key, value)
  }

  const get = (key: StorageKey) => {
    if (invalidKey(key)) throw new Error('Invalid storage key')
    const value = storage.getItem(key)
    if (!value) throw new Error('Value not set')
    return value
  }

  const remove = (key: StorageKey) => {
    if (invalidKey(key)) throw new Error('Invalid storage key')
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
