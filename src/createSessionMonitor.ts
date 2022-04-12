import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { getMetaData } from './metaData'
import { EventPublishFn } from './createEventModule'
import { Logger } from './logger'

export interface SessionMonitor {
  isActive: boolean
  start: () => void
  stop: () => void
}

const addIframe = (url: string, id: string): Promise<HTMLIFrameElement> => {
  return new Promise(resolve => {
    const iframe: HTMLIFrameElement = window.document.createElement('iframe')
    iframe.src = url
    iframe.id = id
    iframe.onload = () => resolve(iframe)
  })
}

interface SessionState {
  sub: string
  sessionState: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const getSessionState = (): SessionState | void => {}

const createSessionMonitor = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  publish: EventPublishFn,
  logger: Logger
) => {
  const _passiveMonitor = (): SessionMonitor => ({
    isActive: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    start: (): void => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stop: (): void => {}
  })

  if (!oauthClientConfig.monitorSession) {
    return _passiveMonitor()
  }

  if (
    oauthClientConfig.issuer.match(
      /([0-9a-z-]{2,}\.[0-9a-z-]{2,3}\.[0-9a-z-]{2,3}|[0-9a-z-]{2,}\.[0-9a-z-]{2,3})$/i
    )
  ) {
    logger.warn(
      'No session monitoring since issuer and client are not on the same main domain'
    )
    return _passiveMonitor()
  }

  let sessionState: string
  try {
    sessionState = storageModule.get('sessionState')
  } catch {
    logger.warn('Session state missing in storage. Will not monitor session')
  }

  const _iframeId = `lionel_monitor_session_${oauthClientConfig.issuer}_${
    oauthClientConfig.clientId
  }_${(oauthClientConfig.scopes || []).join('_')}`
  let _iframe: HTMLIFrameElement
  let _interval: number
  let _started = false

  const start = async (): Promise<void> => {
    if (_started) {
      return
    }
    const metaData = await getMetaData(oauthClientConfig, storageModule, logger)
    if (!metaData?.check_session_iframe) {
      logger.warn(
        'No session monitoring since check_session_iframe is missing in metadata'
      )
      return
    }
    _started = true
    _iframe = await addIframe(metaData.check_session_iframe || '', _iframeId)
    window.addEventListener('message', _handleIssuerPostMessage)
    _interval = window.setInterval(
      _postToIssuer,
      oauthClientConfig.monitorSessionIntervalSeconds || 5 * 1000
    )
  }

  const stop = (): void => {
    _started = false
    _iframe?.remove()
    window.removeEventListener('message', _handleIssuerPostMessage)
    clearInterval(_interval)
  }

  const _postToIssuer = (): void => {
    _iframe.contentWindow?.postMessage(
      `${oauthClientConfig.clientId} ${sessionState}`,
      oauthClientConfig.issuer
    )
  }

  const _handleChangedSession = (): void => {
    // TODO perform a silent signin
  }

  const _handleIssuerPostMessage = (e: MessageEvent): void => {
    if (e.source !== _iframe.contentWindow) {
      return
    }
    if (e.origin !== oauthClientConfig.issuer) {
      return
    }
    if (e.data === 'error') {
      stop()
    }
    if (e.data === 'changed') {
      _handleChangedSession()
      // Sign out if user is changed at issuer (do publish('sessionEnded'))
      // Update sessionState and restart session monitor if session is changed
    }
  }

  logger.log({ publish })

  return {
    isActive: true,
    start,
    stop
  }
}

export default createSessionMonitor
