import { TokenPart } from '../../../src/jwt'
import { OauthClientConfig } from '../../../src/createOauthClient'

export const createTokenValidTimeMock = (tokenClaims: TokenPart) => () =>
  jest
    .spyOn(Date, 'now')
    .mockImplementation(
      jest.fn(() => (tokenClaims.nbf + 1) * 1000) as jest.Mock
    )

export const createTokenEarlyTimeWithinLeewayMock =
  (tokenClaims: TokenPart) => () =>
    jest
      .spyOn(Date, 'now')
      .mockImplementation(
        jest.fn(() => (tokenClaims.nbf - 1) * 1000) as jest.Mock
      )

export const createTokenEarlyTimeOutsideLeewayMock =
  (tokenClaims: TokenPart, oauthConfig: OauthClientConfig) => () =>
    jest
      .spyOn(Date, 'now')
      .mockImplementation(
        jest.fn(
          () =>
            (tokenClaims.nbf - (oauthConfig.tokenLeewaySeconds || 0) - 1) * 1000
        ) as jest.Mock
      )

export const createTokenExpiredTimeWithinLeewayMock =
  (tokenClaims: TokenPart) => () =>
    jest
      .spyOn(Date, 'now')
      .mockImplementation(
        jest.fn(() => (tokenClaims.exp + 1) * 1000) as jest.Mock
      )

export const createTokenExpiredTimeOutsideLeewayMock =
  (tokenClaims: TokenPart, oauthConfig: OauthClientConfig) => () =>
    jest
      .spyOn(Date, 'now')
      .mockImplementation(
        jest.fn(
          () =>
            (tokenClaims.exp + (oauthConfig.tokenLeewaySeconds || 0) + 1) * 1000
        ) as jest.Mock
      )
