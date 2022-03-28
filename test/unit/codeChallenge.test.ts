/**
 * @jest-environment jsdom
 */

import { createCodeChallenge } from '../../src/codeChallenge'

describe('createCodeChallenge', (): void => {
  it('should return a matching codeVerifier and codeChallenge', async (): Promise<void> => {
    const codeChallengeData = await createCodeChallenge()
    expect(codeChallengeData.verifier).toBe('mocked_code_verifier')
    expect(codeChallengeData.challenge).toBe('mocked_code_challenge')
  })
})
