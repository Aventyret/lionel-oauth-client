import createStorageModule from '../../src/createStorageModule'

describe('createStorageModule', (): void => {
  it('should have a storage key that is an instance of Storage', (): void => {
    const localStorageModule = createStorageModule()
    expect(localStorageModule.storage).toBeInstanceOf(Storage)
    const sessionStorageModule = createStorageModule('session')
    expect(sessionStorageModule.storage).toBeInstanceOf(Storage)
  })

  it('should throw an error if using a non-valid storage type', (): void => {
    expect(() => createStorageModule()).toThrow('Not a valid storage type')
  })

  it('should set and get value to allowed key', (): void => {
    const module = createStorageModule()
    const value = '1337'
    module.set('accessToken', value)
    expect(module.get('accessToken')).toBe(value)
  })

  it('should throw error when trying to get a non-set value', (): void => {
    const module = createStorageModule()
    expect(module.get('accessToken')).toThrow('Value not set')
  })

  it('should remove value from allowed key', (): void => {
    const module = createStorageModule()
    module.set('codeVerifier', '1337')
    expect(module.get('codeVerifier')).toBeTruthy()
    module.remove('codeVerifier')
    expect(module.get('codeVerifier')).toBeFalsy()
  })

  it('should clear storage completely', (): void => {
    const module = createStorageModule()
    module.set('idToken', '1337')
    module.clear()
    expect(module.get('idToken')).toBeFalsy()
  })
})
