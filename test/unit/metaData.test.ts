/**
 * @jest-environment jsdom
 */

import { validateMetaData, getMetaData } from '../../src/metaData'
import createStorageModule from '../../src/createStorageModule'
import createLogger from '../../src/logger'
import { oidcConfig } from './test-config'
import metaDataMock from './mocks/metaDataMock.json'

describe('validateMetaData', (): void => {
  it('should not throw error with valid meta data', (): void => {
    validateMetaData(metaDataMock, oidcConfig, createLogger(oidcConfig))
  })
  it('should throw with missing issuer', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          issuer: ''
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow('Required attribute issuer missing in meta data')
  })
})
describe('getMetaData', (): void => {
  beforeAll(() => {
    jest.spyOn(window, 'fetch').mockImplementation(
      jest.fn(() => {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              ...metaDataMock,
              scopes_supported: [
                ...metaDataMock.scopes_supported,
                'from_discovery'
              ]
            })
        })
      }) as jest.Mock
    )
  })
  it('should get metaData from storage if is present there', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    storageModule.set(
      'metaData',
      JSON.stringify({
        ...metaDataMock,
        scopes_supported: [...metaDataMock.scopes_supported, 'from_storage']
      })
    )
    const metaData = await getMetaData(
      oidcConfig,
      storageModule,
      createLogger(oidcConfig)
    )
    expect(metaData.scopes_supported?.includes('from_storage')).toBe(true)
    expect(metaData.scopes_supported?.includes('from_discovery')).toBe(false)
    const metaDataInStorage = JSON.parse(storageModule.get('metaData'))
    storageModule.remove('metaData')
    expect(metaDataInStorage.scopes_supported?.includes('from_storage')).toBe(
      true
    )
    expect(metaDataInStorage.scopes_supported?.includes('from_discovery')).toBe(
      false
    )
  })
  it('should get metaData from config if is present there, and set it in storage', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    const metaData = await getMetaData(
      oidcConfig,
      storageModule,
      createLogger(oidcConfig)
    )
    expect(metaData.scopes_supported?.includes('from_storage')).toBe(false)
    expect(metaData.scopes_supported?.includes('from_discovery')).toBe(false)
    const metaDataInStorage = JSON.parse(storageModule.get('metaData'))
    storageModule.remove('metaData')
    expect(metaDataInStorage.scopes_supported?.includes('from_storage')).toBe(
      false
    )
    expect(metaDataInStorage.scopes_supported?.includes('from_discovery')).toBe(
      false
    )
  })
  it('should get metaData from discovery if not present in config, and set it in storage', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    const metaData = await getMetaData(
      {
        ...oidcConfig,
        metaData: undefined
      },
      storageModule,
      createLogger(oidcConfig)
    )
    expect(metaData.scopes_supported?.includes('from_storage')).toBe(false)
    expect(metaData.scopes_supported?.includes('from_discovery')).toBe(true)
    const metaDataInStorage = JSON.parse(storageModule.get('metaData'))
    storageModule.remove('metaData')
    expect(metaDataInStorage.scopes_supported?.includes('from_storage')).toBe(
      false
    )
    expect(metaDataInStorage.scopes_supported?.includes('from_discovery')).toBe(
      true
    )
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
