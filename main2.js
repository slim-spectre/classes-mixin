class Document {
  constructor(title, author) {
    this.title = title
    this.author = author
    this.content = ''
    this.createdAt = new Date()
  }
}

const eventEmitterMixin = {
  _initEvents() {
    if (!this._eventHandlers) {
      this._eventHandlers = {}
    }
  },

  on(eventName, handler) {
    this._initEvents()

    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = []
    }

    this._eventHandlers[eventName].push(handler)
  },
  off(eventName, handler) {
    this._initEvents();

    if (!this._eventHandlers[eventName]) return;

    this._eventHandlers[eventName] = this._eventHandlers[eventName].filter(
      (h) => h !== handler
    )
  },
  emit(eventName, ...args) {
    this._initEvents();

    const handlers = this._eventHandlers[eventName];
    if (handlers && handlers.length > 0) {
      handlers.forEach((handler) => handler(...args));
    }
  },
}
class Article extends Document {}
Object.assign(Article.prototype, eventEmitterMixin)

const article = new Article('Новинки JS 2026', 'Олексій')
article.on('publish', (data) => console.log(`Статтю опубліковано: ${data.url}`))
article.emit('publish', { url: 'https://example.com/js-2026' })
