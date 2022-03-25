import getPkce from 'oauth-pkce'

interface CodeChallengeData {
  verifier: string
  challenge: string
}

export default async (): Promise<CodeChallengeData> => {
  return new Promise((resolve, reject) => {
    getPkce(
      43,
      (error: object | null, { verifier, challenge }: CodeChallengeData) => {
        if (error) reject(error)
        if (!error) {
          resolve({
            verifier: verifier,
            challenge: challenge
          })
        }
      }
    )
  })
}
