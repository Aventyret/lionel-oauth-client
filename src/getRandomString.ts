const validChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export default (length: number): string => {
  const uIntArray = new Uint8Array(length)
  crypto.getRandomValues(uIntArray)
  const array = Array.from(uIntArray).map((randomNumber: number) =>
    validChars.charCodeAt(randomNumber % validChars.length)
  )
  return String.fromCharCode.apply(null, array)
}
