import { randomString, hash } from './cryptoHelpers'

export interface Nonce {
  value: string
  hash: string
}

export const nonceHash = async (nonceValue: string): Promise<string> => {
  return await hash(nonceValue)
}

export default async (): Promise<Nonce> => {
  const value = randomString(32)

  return {
    value,
    hash: await nonceHash(value)
  }
}
