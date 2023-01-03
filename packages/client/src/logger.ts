import { OauthClientConfig } from './createOauthClient'

type LogMessage = string | number | object

export interface Logger {
  log: (message: LogMessage) => void
  warn: (message: LogMessage) => void
  error: (e: unknown) => void
}

const log = (message: LogMessage): void => {
  console.log('Lionel log:', message)
}

const warn = (message: LogMessage): void => {
  console.warn('Lionel warning:', message)
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
    warn: (message: LogMessage) => {
      warn(message)
    },
    error: (e: unknown) => {
      if (config.debug) {
        error(e)
      }
    }
  }
}
