const sampleOrderData = {
    orderId: 'ORD-9821',
    customer: 'Олена Петренко',
    initialItems: [
        { id: 1, title: 'Механічна клавіатура', price: 3200, category: 'electronics' },
        { id: 2, title: 'Бездротова миша', price: 1100, category: 'electronics' },
    ],
}


class Product {

  static #count = 1;
  static taxRate = 0.05

  #id;
  #price

  constructor(title, price, category) {
    this.#id = `prod_${Product.#count++}`;
    this.title = title
    this.price = price
    this.category = category
  }

  get id(){
    return this.#id
  }

  get price() {
    return this.#price
  }

  set price(amount) {
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      throw new Error('It is not a number')
    }
    if (amount <= 0) {
      throw new Error('Cannot be less number')
    }
    this.#price = amount
  }

  static formatPrice(amount, currency = 'UAH') {
    return `${amount.toFixed(2)} ${currency}`
  }

  calculateTotalWithTax() {
    return this.price * (1 + Product.taxRate)
  }

  getInfo() {
    return `ID ${this.id} ${this.title} (${this.category}) ${this.price} UAH`
  }
}

const keyboard = new Product('Механічна клавіатура', 3200, 'electronics')

// console.log(keyboard.id) 
// console.log(keyboard.price) 
// console.log(keyboard.getInfo()) 
// console.log(Product.formatPrice(keyboard.calculateTotalWithTax()))

class ElectronicsProduct extends Product {

  #warrantyMonths;

  constructor(title,price, warrantyMonths, powerConsumption){
    super(title,price,'electronics');
    this.#warrantyMonths = warrantyMonths;
    this.powerConsumption = powerConsumption;
  }

  getInfo() {
    return `${super.getInfo()} | warranty: ${this.#warrantyMonths} months and Capacity: ${this.powerConsumption} V`
  }
}

class PerishableProduct extends Product {

  #expirationDate;

  constructor (title,price, category, expirationDate) {
    super(title,price, category);
    this.#expirationDate = expirationDate;
  }

  isExpired() {
    return this.#expirationDate < new Date();
  }
  getInfo() {
    return `${super.getInfo()}.Need to be used until  ${this.#expirationDate.toISOString().split('T')[0]}`
  }
}

const tv = new ElectronicsProduct('Smart TV 55"', 18000, 24, 120)
// console.log(tv.getInfo())

const milk = new PerishableProduct('Органічне молоко', 45, 'dairy', new Date('2026-10-01'))
// console.log(milk.isExpired()) 
// console.log(milk.getInfo())

class User {

  #passwordHash

  constructor (name,email, role = 'customer'){
    this.name = name;
    this.email = email;
    this.role = role;
  }

  setPassword(newPassword) {
    if(newPassword.length >= 6){
      this.#passwordHash = `_${newPassword}_`
    }else{
      throw new Error("Password need to be at least 6 symbols")
    }
  }
  checkPassword(password){
    return this.#passwordHash == `_${password}_`
  }
  getRole() {
    return this.role;
  }
}

class AdminUser extends User {

  static #secretMasterKey = 'master_admin_2026'

  constructor (name,email,adminKey) {
    if(adminKey == AdminUser.#secretMasterKey){
      super(name,email,"admin");
      this.permissions = ['all'];
    }else{
      throw new Error("You cunt go:not correct key")
    }
  }

  static createSuperAdmin (name,email) {
    return new this(name,email,AdminUser.#secretMasterKey);
  }
}

const admin = AdminUser.createSuperAdmin('Тарас', 'taras@store.ua')
// console.log(admin.getRole())
// console.log(admin.permissions) 

class ShoppingCart {
  #items = [];
  static #totalOrdersCreated = 0;

  static get totalOrders(){
    return ShoppingCart.#totalOrdersCreated;
  }
  addItem(product, quantity = 1){
    if(product instanceof Product){
      let isFound = false;
      for(let item of this.#items){
        if(item.product == product){
          isFound = true;
          item.quantity++
        }
      }
      if(!isFound){
        this.#items.push({
          product : product,
          quantity : quantity,
        })
      }
    }
  }
  removeItem(productId) {
    this.#items.filter(obj => obj.product.id !== productId);
  }
  get totalCost(){
    let total = 0;
    for(let item of this.#items){
      let itemCost = item.product.calculateTotalWithTax(item.product.price * item.quantity);
      total += itemCost
    }
    return total;
  }
  checkout() {
    if(this.#items.length == 0) throw new Error("The bucket has no items")
    ShoppingCart.#totalOrdersCreated++;
    let number = 1;
    for(let item of this.#items){
      console.log(`Item ${number}: ${item.product.title}`)
      number++
    }
    return `Total cost : ${this.totalCost} Date: ${new Date()}`
  }
}

const cart = new ShoppingCart()
cart.addItem(keyboard, 2)
cart.addItem(tv, 1)

// console.log(cart.totalCost) 
// const orderReport = cart.checkout()
// console.log(orderReport)
// console.log(ShoppingCart.totalOrders) // 1

function inspectHierarchy (instanse) {
  let current = Object.getPrototypeOf(instanse);
  let parentBox = [];
  while(current !== null){
    parentBox.push(current.constructor?.name)
    current = Object.getPrototypeOf(current);
  }
  parentBox.push(null);
  return {
    constructorName : instanse.constructor.name,
    inheritanceChain : parentBox,
    isInstanceOf : function (ClassRef) {
      return (instanse instanceof ClassRef);
    }
  }
}
const report = inspectHierarchy(tv)
console.log(report.constructorName) 
console.log(report.inheritanceChain) 
console.log(report.isInstanceOf(Product)) 