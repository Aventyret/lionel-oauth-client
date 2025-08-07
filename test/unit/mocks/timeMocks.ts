import { TokenPart } from '../../../src/jwt'
import { OauthClientConfig } from '../../../src/createOauthClient'
import { vi, Mock } from 'vitest'

export const createTokenValidTimeMock = (tokenClaims: TokenPart) => () =>
  vi
    .spyOn(Date, 'now')
    .mockImplementation(vi.fn(() => (tokenClaims.nbf + 1) * 1000) as Mock)

export const createTokenEarlyTimeWithinLeewayMock =
  (tokenClaims: TokenPart) => () =>
    vi
      .spyOn(Date, 'now')
      .mockImplementation(vi.fn(() => (tokenClaims.nbf - 1) * 1000) as Mock)

export const createTokenEarlyTimeOutsideLeewayMock =
  (tokenClaims: TokenPart, oauthConfig: OauthClientConfig) => () =>
    vi
      .spyOn(Date, 'now')
      .mockImplementation(
        vi.fn(
          () =>
            (tokenClaims.nbf - (oauthConfig.tokenLeewaySeconds || 0) - 1) * 1000
        ) as Mock
      )

export const createTokenExpiredTimeWithinLeewayMock =
  (tokenClaims: TokenPart) => () =>
    vi
      .spyOn(Date, 'now')
      .mockImplementation(vi.fn(() => (tokenClaims.exp + 1) * 1000) as Mock)

export const createTokenExpiredTimeOutsideLeewayMock =
  (tokenClaims: TokenPart, oauthConfig: OauthClientConfig) => () =>
    vi
      .spyOn(Date, 'now')
      .mockImplementation(
        vi.fn(
          () =>
            (tokenClaims.exp + (oauthConfig.tokenLeewaySeconds || 0) + 1) * 1000
        ) as Mock
      )

export const createTokenTimeAfterAuthTimeMock =
  (tokenClaims: TokenPart, secondsAfterAuthTime: number) => () =>
    vi
      .spyOn(Date, 'now')
      .mockImplementation(
        vi.fn(
          () => (tokenClaims.auth_time + secondsAfterAuthTime) * 1000
        ) as Mock
      )
