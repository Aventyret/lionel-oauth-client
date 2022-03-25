beforeAll(() => {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (array: Uint8Array) => {
        return array.map(() => {
          return Math.floor(Math.random() * 10)
        })
      }
    }
  })
})
