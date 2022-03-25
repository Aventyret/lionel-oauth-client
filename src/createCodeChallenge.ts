export default async (codeVerifier: string): Promise<string> => {
  const codeVerifierCharCodes = textEncodeLite(codeVerifier)
  const hashedCharCodes = await crypto.subtle.digest(
    'SHA-256',
    codeVerifierCharCodes
  )
  return urlSafe(new Uint8Array(hashedCharCodes))
}

const textEncodeLite = (string: string): Uint8Array => {
  const charCodeBuffer = new Uint8Array(string.length)
  for (let i = 0; i < string.length; i++) {
    charCodeBuffer[i] = string.charCodeAt(i)
  }
  return charCodeBuffer
}

const urlSafe = (uInt8Array: Uint8Array): string => {
  const string = new TextDecoder('utf-8').decode(uInt8Array)
  console.log(string)
  const encoded = btoa(string)
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
