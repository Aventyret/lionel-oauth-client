import { OauthClientConfig } from './createOauthClient'

type LogMessage = string | number | object

export interface Logger {
  log: (message: LogMessage) => void
}

const log = (message: LogMessage): void => {
  console.log('Lionel log:', message)
}

export default (config: OauthClientConfig): Logger => {
  return {
    log: (message: LogMessage) => {
      if (config.debug) {
        log(message)
      }
    }
  }
}
