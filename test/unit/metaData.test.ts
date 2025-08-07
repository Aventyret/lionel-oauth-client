import { validateMetaData, getMetaData } from '../../src/metaData'
import createStorageModule from '../../src/createStorageModule'
import createLogger from '../../src/logger'
import { oidcConfig } from './test-config'
import metaDataMock from './mocks/metaDataMock.json'
import { vi, Mock } from 'vitest'

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
  it('should throw with non TLS userinfo_endpoint', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          userinfo_endpoint: metaDataMock.userinfo_endpoint.replace(
            'https',
            'http'
          )
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow('userinfo_endpoint needs to utilize TLS')
  })
  it('should pass when not specifing scopes_supported', (): void => {
    validateMetaData(
      {
        ...metaDataMock,
        scopes_supported: undefined
      },
      oidcConfig,
      createLogger(oidcConfig)
    )
  })
  it('should throw when not supporting openid', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          scopes_supported: ['profile']
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow('Scope openid is missing in scopes_supported in meta data')
  })
  it('should throw when not supporting code response type', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          response_types_supported: ['implicit']
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow(
      'code is missing in response_types_supported in meta data. Lionel oAuth Client only supports the PKCE flow.'
    )
  })
  it('should throw when not supporting authorization_code grant type', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          grant_types_supported: ['client_credentials']
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow('authorization_code grant type not supported')
  })
  it('should throw with invalid subject_types_supported', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          subject_types_supported: ['protected']
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow('Invalid supported subject types in meta data')
  })
  it('should throw when not supporting RS256 alg values', (): void => {
    expect(() => {
      validateMetaData(
        {
          ...metaDataMock,
          id_token_signing_alg_values_supported: ['S256']
        },
        oidcConfig,
        createLogger(oidcConfig)
      )
    }).toThrow('RS256 missing as supported signing alg values in meta data')
  })
})
describe('getMetaData', (): void => {
  beforeAll(() => {
    vi.spyOn(window, 'fetch').mockImplementation(
      vi.fn(() => {
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
      }) as Mock
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
    vi.resetAllMocks()
  })
})
