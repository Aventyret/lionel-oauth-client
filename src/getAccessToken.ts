import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

export default (storageModule: StorageModule, logger: Logger): string => {
  logger.log('Get Access Token')
  logger.log({ storageModule })
  return ''
}
