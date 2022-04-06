import createEventModule from '../../src/createEventModule'

describe('createEventModule', () => {
  it('should add subscribe fn to specific event', () => {
    const eventModule = createEventModule()
    const mockFn = jest.fn().mockName('subscribeCallback')
    eventModule.subscribe('tokenLoaded', mockFn)
    eventModule.publish('tokenLoaded')
    expect(mockFn).toHaveBeenCalled()
  })

  it('should trigger all subscribe fn for same event when event is published', () => {
    const eventModule = createEventModule()
    const mockFn = jest.fn().mockName('subscribeCallback')
    eventModule.subscribe('tokenLoaded', mockFn)
    eventModule.subscribe('tokenLoaded', mockFn)
    eventModule.publish('tokenLoaded')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should remove subscribe fn from specific event', () => {
    const eventModule = createEventModule()
    const mockFn = jest.fn().mockName('subscribeCallback')
    eventModule.subscribe('tokenLoaded', mockFn)
    eventModule.unsubscribe('tokenLoaded', mockFn)
    eventModule.publish('tokenLoaded')
    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should throw an error if using an invalid event type', () => {
    const eventModule = createEventModule()
    const errorMessage = `Invalid event type: fail`
    //@ts-expect-error throws error if using an invalid event type on subscribe
    expect(() => eventModule.subscribe('fail', jest.fn())).toThrow(errorMessage)
    //@ts-expect-error throws error if using an invalid event type on unsubscribe
    expect(() => eventModule.unsubscribe('fail', jest.fn())).toThrow(
      errorMessage
    )
    //@ts-expect-error throws error if using an invalid event type on publish
    expect(() => eventModule.publish('fail', jest.fn())).toThrow(errorMessage)
  })
})
