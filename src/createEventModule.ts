const eventTypes = <const>['tokenUpdated', 'refreshNeeded']
export type EventType = typeof eventTypes[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallbackFn = (...args: any[]) => any

export interface EventModule {
  subscribe: (eventType: EventType, callback: EventCallbackFn) => void
  unsubscribe: (eventType: EventType, callback: EventCallbackFn) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish: (eventType: EventType, ...args: any[]) => void
}

interface Events {
  [key: string]: EventCallbackFn[]
}

export const createEventModule = (): EventModule => {
  const events: Events = {}

  const _invalidEventType = (eventType: EventType) => {
    if (eventTypes.includes(eventType)) return
    throw Error(`Invalid event type: ${eventType}`)
  }

  const subscribe = (eventType: EventType, callback: EventCallbackFn) => {
    _invalidEventType(eventType)
    if (events[eventType]) {
      events[eventType].push(callback)
    } else {
      events[eventType] = [callback]
    }
  }

  const unsubscribe = (eventType: EventType, callback: EventCallbackFn) => {
    _invalidEventType(eventType)
    if (events[eventType]) {
      events[eventType] = events[eventType].filter(fn => fn !== callback)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publish = (eventType: EventType, ...args: any[]) => {
    _invalidEventType(eventType)
    const callbacks = events[eventType]
    if (!Array.isArray(callbacks)) return
    callbacks.forEach(callback => callback(...args))
  }

  return {
    subscribe,
    unsubscribe,
    publish
  }
}

export default createEventModule
