import { OauthClientConfig } from './createOauthClient'

type LogMessage = string | number | object

export interface Logger {
  log: (message: LogMessage) => void
  error: (e: unknown) => void
}

const log = (message: LogMessage): void => {
  console.log('Lionel log:', message)
}

const error = (e: unknown): void => {
  console.error('Lionel error:', e)
}

export default (config: OauthClientConfig): Logger => {
  return {
    log: (message: LogMessage) => {
      if (config.debug) {
        log(message)
      }
    },
    error: (e: unknown) => {
      if (config.debug) {
        error(e)
      }
    }
  }
}
