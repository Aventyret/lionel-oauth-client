import { getUser, getUserInfo, removeUser } from '../../src/user'
import createStorageModule from '../../src/createStorageModule'
import createEventModule from '../../src/createEventModule'
import createLogger from '../../src/logger'
import { oidcConfig } from './test-config'
import idTokenMock from './mocks/idTokenMock.json'
import metaDataMock from './mocks/metaDataMock.json'
import { createTokenValidTimeMock } from './mocks/timeMocks'

describe('getUser', (): void => {
  describe('when token is valid', (): void => {
    beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
    it('should get a user from id token if there is one in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      const { publish } = createEventModule()
      storageModule.set('accessToken', idTokenMock.encoded)
      storageModule.set('idToken', idTokenMock.encoded)
      const user = getUser(
        oidcConfig,
        storageModule,
        createLogger(oidcConfig),
        publish
      )
      storageModule.remove('accessToken')
      storageModule.remove('idToken')
      expect(user?.sub).toBe(idTokenMock.decodedPayload.sub)
    })
    it('should not throw error if id token is not in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      storageModule.set('accessToken', idTokenMock.encoded)
      const { publish } = createEventModule()
      const user = getUser(
        oidcConfig,
        storageModule,
        createLogger(oidcConfig),
        publish
      )
      expect(user).toBe(null)
      storageModule.remove('accessToken')
    })
    it('should merge claims from user info with id token claims', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      const { publish } = createEventModule()
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
        createLogger(oidcConfig),
        publish
      )
      storageModule.remove('accessToken')
      storageModule.remove('idToken')
      storageModule.remove('userInfo')
      expect(user?.sub).toBe('mocked_user_info_sub')
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
})
describe('getUserInfo', (): void => {
  beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
  beforeAll(() => {
    jest.spyOn(window, 'fetch').mockImplementation(
      jest.fn(() => {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sub: 'mocked_user_info_sub' })
        })
      }) as jest.Mock
    )
  })
  it('should get user info', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    const { publish } = createEventModule()
    storageModule.set('accessToken', idTokenMock.encoded)
    const user = await getUserInfo(
      {
        ...oidcConfig,
        useUserInfoEndpoint: true
      },
      storageModule,
      metaDataMock,
      createLogger(oidcConfig),
      publish
    )
    storageModule.remove('accessToken')
    storageModule.remove('userInfo')
    expect(user?.sub).toBe('mocked_user_info_sub')
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
describe('removeUser', (): void => {
  beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
  it('should remove access token from storage', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    const logger = createLogger(oidcConfig)
    const { publish } = createEventModule()
    storageModule.set('accessToken', idTokenMock.encoded)
    storageModule.set('idToken', idTokenMock.encoded)
    let user = getUser(oidcConfig, storageModule, logger, publish)
    expect(user?.sub).toBe(idTokenMock.decodedPayload.sub)
    removeUser(storageModule, logger, publish)
    user = getUser(oidcConfig, storageModule, logger, publish)
    expect(user).toBe(null)
    storageModule.remove('accessToken')
    storageModule.remove('idToken')
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
