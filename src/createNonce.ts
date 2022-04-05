import { randomString, hash } from './cryptoHelpers'

export const nonceHash = async (nonceValue: string): Promise<string> => {
  return await hash(nonceValue)
}

export default (): string => {
  return randomString(32)
}
