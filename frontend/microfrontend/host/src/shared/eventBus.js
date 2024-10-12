class EventBus {
  constructor() {
    this.events = {}
  }

  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)
  }

  unsubscribe(eventName, callback) {
    if (!this.events[eventName]) {
      return
    }

    const index = this.events[eventName].indexOf(callback)
    this.events[eventName].splice(index, 1)
  }

  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data))
    }
  }

  debug() {
    for (let eventName in this.events) {
      console.log(
        `[eventBus]: has ${this.events[eventName].length} cbs for ${eventName}`
      )
    }

    return this.events
  }
}

export const eventBus = new EventBus()
