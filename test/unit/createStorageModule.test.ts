import createStorageModule from '../../src/createStorageModule'
import { oauthConfig } from './test-config'
import { vi, Mock } from 'vitest'

const mockedStorage = window.Storage as Mock
interface MockStorage {
  [key: string]: string
}

describe('createStorageModule', (): void => {
  let mockStorage: MockStorage = {}

  beforeAll(() => {
    mockedStorage.prototype.setItem = vi.fn((key, value) => {
      mockStorage[key] = value
    })
    mockedStorage.prototype.getItem = vi.fn(key => mockStorage[key])
    mockedStorage.prototype.removeItem = vi.fn(key => delete mockStorage[key])
    mockedStorage.prototype.clear = vi.fn(() => (mockStorage = {}))
  })

  beforeEach(() => {
    mockStorage = {}
  })

  afterAll(() => {
    mockedStorage.prototype.setItem.mockReset()
    mockedStorage.prototype.getItem.mockReset()
  })

  it('should have a storage key that is an instance of Storage', (): void => {
    const localStorageModule = createStorageModule(oauthConfig)
    expect(localStorageModule.storage).toBeInstanceOf(Storage)
    const sessionStorageModule = createStorageModule({
      ...oauthConfig,
      tokenStorage: 'session'
    })
    expect(sessionStorageModule.storage).toBeInstanceOf(Storage)
  })

  it('should throw an error when creating a StorageModule instance with an unsupported type', () => {
    expect(() =>
      //@ts-expect-error test to see if an error is thrown when providing an unsupported `type`
      createStorageModule({ ...oauthConfig, tokenStorage: 'fail' })
    ).toThrow('Not a valid storage type')
  })

  it('should set and get value to allowed key', (): void => {
    const module = createStorageModule(oauthConfig)
    const value = '1337'
    module.set('accessToken', value)
    expect(module.get('accessToken')).toBe(value)
  })

  it('should throw error when trying to get a non-set value', (): void => {
    const module = createStorageModule(oauthConfig)
    expect(() => module.get('accessToken')).toThrow('Value not set')
  })

  it('should remove value from allowed key', (): void => {
    const module = createStorageModule(oauthConfig)
    module.set('codeVerifier', '1337')
    expect(module.get('codeVerifier')).toBeTruthy()
    module.remove('codeVerifier')
    expect(() => module.get('codeVerifier')).toThrow('Value not set')
  })

  it('should clear storage completely', (): void => {
    const module = createStorageModule(oauthConfig)
    module.set('idToken', '1337')
    module.clear()
    expect(() => module.get('idToken')).toThrow('Value not set')
  })

  it('should throw an error when trying to get, set or remove using a unsupported key', () => {
    const module = createStorageModule(oauthConfig)
    //@ts-expect-error throws error on `get` when using unsupported key
    expect(() => module.get('fail')).toThrow('Invalid storage key')
    //@ts-expect-error throws error on `set` when using unsupported key
    expect(() => module.set('fail')).toThrow('Invalid storage key')
    //@ts-expect-error throws error on `remove` when using unsupported key
    expect(() => module.remove('fail')).toThrow('Invalid storage key')
  })
})
