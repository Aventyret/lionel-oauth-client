/**
 * @jest-environment jsdom
 */

import createStorageModule from '../../src/createStorageModule'

const mockedStorage = window.Storage as jest.Mock<Storage>
interface MockStorage {
  [key: string]: string
}

describe('createStorageModule', (): void => {
  let mockStorage: MockStorage = {}

  beforeAll(() => {
    mockedStorage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value
    })
    mockedStorage.prototype.getItem = jest.fn(key => mockStorage[key])
    mockedStorage.prototype.removeItem = jest.fn(key => delete mockStorage[key])
    mockedStorage.prototype.clear = jest.fn(() => (mockStorage = {}))
  })

  beforeEach(() => {
    mockStorage = {}
  })

  afterAll(() => {
    mockedStorage.prototype.setItem.mockReset()
    mockedStorage.prototype.getItem.mockReset()
  })

  it('should have a storage key that is an instance of Storage', (): void => {
    const localStorageModule = createStorageModule()
    expect(localStorageModule.storage).toBeInstanceOf(Storage)
    const sessionStorageModule = createStorageModule('session')
    expect(sessionStorageModule.storage).toBeInstanceOf(Storage)
  })

  it('should set and get value to allowed key', (): void => {
    const module = createStorageModule()
    const value = '1337'
    module.set('accessToken', value)
    expect(module.get('accessToken')).toBe(value)
  })

  it('should throw error when trying to get a non-set value', (): void => {
    const module = createStorageModule()
    expect(() => module.get('accessToken')).toThrow('Value not set')
  })

  it('should remove value from allowed key', (): void => {
    const module = createStorageModule()
    module.set('codeVerifier', '1337')
    expect(module.get('codeVerifier')).toBeTruthy()
    module.remove('codeVerifier')
    expect(() => module.get('codeVerifier')).toThrow('Value not set')
  })

  it('should clear storage completely', (): void => {
    const module = createStorageModule()
    module.set('idToken', '1337')
    module.clear()
    expect(() => module.get('idToken')).toThrow('Value not set')
  })
})
