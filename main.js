const sampleOrderData = {
  orderId: 'ORD-9821',
  customer: 'Олена Петренко',
  initialItems: [
    { id: 1, title: 'Механічна клавіатура', price: 3200, category: 'electronics' },
    { id: 2, title: 'Бездротова миша', price: 1100, category: 'electronics' },
  ],
}

class Product {
  static #count = 1
  static taxRate = 0.05

  #id
  #price

  constructor(title, price, category) {
    this.#id = `prod_${Product.#count++}`
    this.title = title
    this.price = price 
    this.category = category
  }

  get id() {
    return this.#id
  }

  get price() {
    return this.#price
  }

  set price(amount) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('It needs to be a number')
    }
    this.#price = amount
  }

  static formatPrice(amount, currency = 'uah') {
    return `${amount.toFixed(2)} ${currency}`
  }

  calculateTotalWithTax() {
    return this.price * (1 + Product.taxRate)
  }

  getInfo() {
    return `[ID: ${this.id}] ${this.title} (${this.category}) — ${this.price} UAH`
  }
}

class ElectronicsProduct extends Product {
  _warrantyMonths

  constructor(title, price, warrantyMonths, powerConsumption) {
    super(title, price, 'electronics')
    this._warrantyMonths = warrantyMonths
    this.powerConsumption = powerConsumption
  }

  getInfo() {
    return `${super.getInfo()} | Гарантія: ${this._warrantyMonths} міс., Capacity: ${this.powerConsumption} Вт`
  }
}

class PerishableProduct extends Product {
  #expirationDate

  constructor(title, price, category, expirationDate) {
    super(title, price, category)
    this.#expirationDate = expirationDate
  }

  isExpired() {
    return this.#expirationDate < new Date()
  }

  getInfo() {
    const formattedDate = this.#expirationDate.toISOString().split('T')[0]
    return `${super.getInfo()} | Appropriatte to: ${formattedDate}`
  }
}

class User {
  #passwordHash

  constructor(name, email, role = 'customer') {
    this.name = name
    this.email = email
    this.role = role
  }

  setPassword(newPassword) {
    if (newPassword.length < 6) {
      throw new Error('More than 6 symbols')
    }
    this.#passwordHash = `hash_${newPassword}`
  }

  checkPassword(password) {
    return this.#passwordHash === `hash_${password}`
  }

  getRole() {
    return this.role
  }
}

class AdminUser extends User {
  static #secretMasterKey = 'master_admin_2026'

  constructor(name, email, adminKey) {
    if (adminKey !== AdminUser.#secretMasterKey) {
      throw new Error('Not correct key of admin')
    }
    super(name, email, 'admin')
    this.permissions = ['all']
  }

  static createSuperAdmin(name, email) {
    return new AdminUser(name, email, AdminUser.#secretMasterKey)
  }
}

class ShoppingCart {
  #items = []
  static #totalOrdersCreated = 0

  static get totalOrders() {
    return ShoppingCart.#totalOrdersCreated
  }

  addItem(product, quantity = 1) {
    if (!(product instanceof Product)) {
      throw new Error('Object is not a valid product')
    }

    const existingItem = this.#items.find((item) => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.#items.push({ product, quantity })
    }
  }

  removeItem(productId) {
    this.#items = this.#items.filter((item) => item.product.id !== productId)
  }

  get totalCost() {
    return this.#items.reduce((total, item) => {
      return total + item.product.calculateTotalWithTax() * item.quantity
    }, 0)
  }

  checkout() {
    if (this.#items.length === 0) {
      throw new Error('Cart is empty')
    }

    ShoppingCart.#totalOrdersCreated++

    const orderReport = {
      items: this.#items.map((item) => `${item.product.title} x${item.quantity}`),
      totalCost: Product.formatPrice(this.totalCost),
      date: new Date(),
    }

    this.#items = []

    return orderReport
  }
}

function inspectHierarchy(instance) {
  const inheritanceChain = []
  let currentObj = instance

  while (currentObj && currentObj.constructor) {
    inheritanceChain.push(currentObj.constructor.name)
    currentObj = Object.getPrototypeOf(currentObj)

    if (!currentObj || currentObj === Object.prototype) {
      if (currentObj) inheritanceChain.push(currentObj.constructor.name)
      break
    }
  }

  return {
    constructorName: instance.constructor.name,
    inheritanceChain: inheritanceChain,
    isInstanceOf: function (ClassRef) {
      return instance instanceof ClassRef
    },
  }
}
