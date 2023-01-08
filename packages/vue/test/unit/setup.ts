beforeAll(() => {
  Object.defineProperty(window, 'fetch', {
    value: jest.fn()
  })
})
