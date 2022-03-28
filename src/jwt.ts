interface Token {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  signature: string
}

export const parseJwt = (token: string): Token => {
  const tokenParts = token.split('.')

  return {
    header: parseJwtPart(tokenParts[0]),
    payload: parseJwtPart(tokenParts.length > 1 ? tokenParts[1] : ''),
    signature: tokenParts.length > 2 ? tokenParts[2] : ''
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseJwtPart = (part: string): any => {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  try {
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (char) {
          return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(json)
  } catch (error) {}

  return {}
}
