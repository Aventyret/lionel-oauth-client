import signOut, { getSignOutRedirectUri } from '../../src/signOut'
import createStorageModule from '../../src/createStorageModule'
import createState from '../../src/createState'
import createLogger from '../../src/logger'
import { oidcConfig } from './test-config'
import metaDataMock from './mocks/metaDataMock.json'

describe('getSignOutRedirectUri', (): void => {
  it('should return a correct uri to end session endpoint', async (): Promise<void> => {
    const state = createState()
    const storageModule = createStorageModule(oidcConfig)
    const signOutRedirectUri = await getSignOutRedirectUri(
      {},
      metaDataMock,
      storageModule,
      state
    )
    expect(signOutRedirectUri).toMatch(
      new RegExp(`^${metaDataMock.end_session_endpoint}?`)
    )
    expect(signOutRedirectUri).toMatch(new RegExp(`state=${state}`))
  })
  it('should include id_token_hint if id_token is in storage', async (): Promise<void> => {
    const state = createState()
    const storageModule = createStorageModule(oidcConfig)
    storageModule.set('idToken', 'mock_id_token')
    const signOutRedirectUri = await getSignOutRedirectUri(
      {},
      metaDataMock,
      storageModule,
      state
    )
    expect(signOutRedirectUri).toMatch(
      new RegExp(`^${metaDataMock.end_session_endpoint}?`)
    )
    expect(signOutRedirectUri).toMatch(
      new RegExp('id_token_hint=mock_id_token')
    )
    storageModule.remove('idToken')
  })
  it('should not include id_token_hint if id_token is in storage but useIdTokenHint is false', async (): Promise<void> => {
    const state = createState()
    const storageModule = createStorageModule(oidcConfig)
    storageModule.set('idToken', 'mock_id_token')
    const signOutRedirectUri = await getSignOutRedirectUri(
      {
        useIdTokenHint: false
      },
      metaDataMock,
      storageModule,
      state
    )
    expect(signOutRedirectUri).toMatch(
      new RegExp(`^${metaDataMock.end_session_endpoint}?`)
    )
    expect(signOutRedirectUri).toMatch(
      new RegExp(/^((?!(id_token_hint=mock_id_token)).)*$/)
    )
    storageModule.remove('idToken')
  })
  it('should throw without meta data', async (): Promise<void> => {
    const state = createState()
    const storageModule = createStorageModule(oidcConfig)
    try {
      await getSignOutRedirectUri({}, null, storageModule, state)
    } catch (error: unknown) {
      expect((error as Error).message).toBe(
        'No end_session_endpoint in meta data'
      )
    }
  })
  it('should throw without end_session_endpoint in meta data', async (): Promise<void> => {
    const state = createState()
    const storageModule = createStorageModule(oidcConfig)
    try {
      await getSignOutRedirectUri(
        {},
        { ...metaDataMock, end_session_endpoint: undefined },
        storageModule,
        state
      )
    } catch (error: unknown) {
      expect((error as Error).message).toBe(
        'No end_session_endpoint in meta data'
      )
    }
  })
})

describe('signOut', (): void => {
  it('should not throw any errors', async (): Promise<void> => {
    await signOut(
      {},
      oidcConfig,
      metaDataMock,
      createStorageModule(oidcConfig),
      createLogger(oidcConfig)
    )
  })
})
