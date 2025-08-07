import { getUser, getUserInfo, removeUser } from '../../src/user'
import createStorageModule from '../../src/createStorageModule'
import createLogger from '../../src/logger'
import { oidcConfig } from './test-config'
import idTokenMock from './mocks/idTokenMock.json'
import metaDataMock from './mocks/metaDataMock.json'
import { createTokenValidTimeMock } from './mocks/timeMocks'
import { vi, Mock } from 'vitest'

describe('getUser', (): void => {
  describe('when token is valid', (): void => {
    beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
    it('should get a user from id token if there is one in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      storageModule.set('accessToken', idTokenMock.encoded)
      storageModule.set(
        'accessTokenExpires',
        idTokenMock.decodedPayload.exp.toString()
      )
      storageModule.set('idToken', idTokenMock.encoded)
      const user = getUser(oidcConfig, storageModule, createLogger(oidcConfig))
      storageModule.remove('accessToken')
      storageModule.remove('accessTokenExpires')
      storageModule.remove('idToken')
      expect(user?.sub).toBe(idTokenMock.decodedPayload.sub)
    })
    it('should not throw error if id token is not in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      storageModule.set('accessToken', idTokenMock.encoded)
      const user = getUser(oidcConfig, storageModule, createLogger(oidcConfig))
      expect(user).toBe(null)
      storageModule.remove('accessToken')
    })
    it('should merge claims from user info with id token claims', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      storageModule.set('accessToken', idTokenMock.encoded)
      storageModule.set('idToken', idTokenMock.encoded)
      storageModule.set(
        'userInfo',
        JSON.stringify({ sub: 'mocked_user_info_sub' })
      )
      const user = getUser(
        {
          ...oidcConfig,
          useUserInfoEndpoint: true,
          metaData: {
            ...oidcConfig.metaData,
            userinfo_endpoint: 'https://demo.test/userinfo'
          }
        },
        storageModule,
        createLogger(oidcConfig)
      )
      storageModule.remove('accessToken')
      storageModule.remove('idToken')
      storageModule.remove('userInfo')
      expect(user?.sub).toBe('mocked_user_info_sub')
    })
    afterAll(() => {
      vi.resetAllMocks()
    })
  })
})
describe('getUserInfo', (): void => {
  beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
  beforeAll(() => {
    vi.spyOn(window, 'fetch').mockImplementation(
      vi.fn(() => {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sub: 'mocked_user_info_sub' })
        })
      }) as Mock
    )
  })
  it('should get user info', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    storageModule.set('accessToken', idTokenMock.encoded)
    storageModule.set(
      'accessTokenExpires',
      idTokenMock.decodedPayload.exp.toString()
    )
    const user = await getUserInfo(
      {
        ...oidcConfig,
        useUserInfoEndpoint: true
      },
      storageModule,
      metaDataMock,
      createLogger(oidcConfig)
    )
    storageModule.remove('accessToken')
    storageModule.remove('accessTokenExpires')
    storageModule.remove('userInfo')
    expect(user?.sub).toBe('mocked_user_info_sub')
  })
  afterAll(() => {
    vi.resetAllMocks()
  })
})
describe('removeUser', (): void => {
  beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
  it('should remove access token from storage', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    const logger = createLogger(oidcConfig)
    storageModule.set('accessToken', idTokenMock.encoded)
    storageModule.set('idToken', idTokenMock.encoded)
    let user = getUser(oidcConfig, storageModule, logger)
    expect(user?.sub).toBe(idTokenMock.decodedPayload.sub)
    removeUser(storageModule, logger)
    user = getUser(oidcConfig, storageModule, logger)
    expect(user).toBe(null)
    storageModule.remove('accessToken')
    storageModule.remove('idToken')
  })
  afterAll(() => {
    vi.resetAllMocks()
  })
})
