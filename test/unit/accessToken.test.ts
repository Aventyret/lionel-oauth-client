/**
 * @jest-environment jsdom
 */

import { getAccessToken, removeAccessToken } from '../../src/accessToken'
import createStorageModule from '../../src/createStorageModule'
import createLogger from '../../src/logger'
import { oauthConfig } from './test-config'
import accessTokenMock from './mocks/accessTokenMock.json'
import {
  createTokenValidTimeMock,
  createTokenExpiredTimeOutsideLeewayMock
} from './mocks/timeMocks'

describe('getAccessToken', (): void => {
  describe('when token is valid', (): void => {
    beforeAll(createTokenValidTimeMock(accessTokenMock.decodedPayload))
    it('should get an access token if there is one in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oauthConfig)
      storageModule.set('accessToken', accessTokenMock.encoded)
      const accessToken = getAccessToken(
        oauthConfig,
        storageModule,
        createLogger(oauthConfig)
      )
      storageModule.remove('accessToken')
      expect(accessToken).toBe(accessTokenMock.encoded)
    })
    it('should not throw error if access token is not in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oauthConfig)
      const accessToken = getAccessToken(
        oauthConfig,
        storageModule,
        createLogger(oauthConfig)
      )
      expect(accessToken).toBe(null)
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('after token is expired, outside of leeway', (): void => {
    beforeAll(
      createTokenExpiredTimeOutsideLeewayMock(
        accessTokenMock.decodedPayload,
        oauthConfig
      )
    )
    it('should not get token if an expired token is in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oauthConfig)
      storageModule.set('accessToken', accessTokenMock.encoded)
      const accessToken = getAccessToken(
        oauthConfig,
        storageModule,
        createLogger(oauthConfig)
      )
      expect(accessToken).toBe(null)
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
})
describe('removeAccessToken', (): void => {
  it('should remove access token from storage', async (): Promise<void> => {
    const storageModule = createStorageModule(oauthConfig)
    const logger = createLogger(oauthConfig)
    storageModule.set('accessToken', accessTokenMock.encoded)
    let accessToken = getAccessToken(oauthConfig, storageModule, logger)
    expect(accessToken).toBe(accessTokenMock.encoded)
    removeAccessToken(storageModule, logger)
    accessToken = getAccessToken(oauthConfig, storageModule, logger)
    expect(accessToken).toBe(null)
  })
})