const randomStringChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const randomString = (length: number): string => {
  const uIntArray = new Uint8Array(length)
  crypto.getRandomValues(uIntArray)
  const array = Array.from(uIntArray).map((randomNumber: number) =>
    randomStringChars.charCodeAt(randomNumber % randomStringChars.length)
  )
  return String.fromCharCode.apply(null, array)
}

export const hash = async (input: string): Promise<string> => {
  const utf8 = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map(bytes => bytes.toString(16).padStart(2, '0'))
    .join('')
  return hashHex
}
