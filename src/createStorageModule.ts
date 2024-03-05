import { OauthClientConfig } from './createOauthClient'

const storageKeys = <const>[
  'accessToken',
  'accessTokenExpires',
  'idToken',
  'userInfo',
  'state',
  'codeVerifier',
  'nonce',
  'silentState',
  'silentCodeVerifier',
  'metaData',
  'signoutState'
]
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

export const createStorageModule = (
  config: OauthClientConfig
): StorageModule => {
  const type = config.tokenStorage || 'local'

  if (!storageModuleTypes.includes(type))
    throw Error('Not a valid storage type')

  const storage = 'session' ? sessionStorage : localStorage

  const _invalidKey = (key: StorageKey): void => {
    if (storageKeys.includes(key)) return
    throw Error('Invalid storage key')
  }

  const _hashedKey = (key: StorageKey): string => {
    return btoa(
      `${config.issuer}-${config.clientId}-${(config.scopes || []).join(
        '_'
      )}-${key}`
    )
  }

  const set = (key: StorageKey, value: string) => {
    _invalidKey(key)
    storage.setItem(_hashedKey(key), value)
  }

  const get = (key: StorageKey) => {
    _invalidKey(key)
    const value = storage.getItem(_hashedKey(key))
    if (!value) throw Error(`Value not set (${key})`)
    return value
  }

  const remove = (key: StorageKey) => {
    _invalidKey(key)
    storage.removeItem(_hashedKey(key))
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
