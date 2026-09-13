# Домашнє завдання — JS Day 8: Класи в JavaScript (Синтаксис class, Наслідування, Статичні та приватні поля, Міксини, Розширення вбудованих класів)

для 12 балів обов'язково зробити лише 1 завдання із 2-х на ваш вибір (інше за бажанням для додаткової практики).

---

## Завдання 1. ООП-архітектура інтернет-магазину та фінансового обліку (Class Syntax, Private/Protected Fields, Static Members, Inheritance)

Об'єктно-орієнтоване програмування на базі сучасних класів стандарту ES6+ дозволяє структурувати бізнес-логіку застосунку, гарантувати інкапсуляцію стану через приватні поля (`#field`), розмежовувати публічний та внутрішній інтерфейси, а також централізовано вести облік через статичні властивості й методи.

```javascript
// Базовий приклад початкових даних для сутностей магазину
const sampleOrderData = {
    orderId: 'ORD-9821',
    customer: 'Олена Петренко',
    initialItems: [
        { id: 1, title: 'Механічна клавіатура', price: 3200, category: 'electronics' },
        { id: 2, title: 'Бездротова миша', price: 1100, category: 'electronics' },
    ],
}
```

**Що потрібно зробити:**

1. Створити базовий клас товару `Product`:
   - Приймає в конструкторі `title`, `price` та `category`.
   - Має приватне поле `#id`, яке автоматично генерується або інкрементується для кожного нового товару.
   - Має приватне поле `#price`.
   - Гетер `id` повертає значення приватного поля `#id`.
   - Аксесор `price`:   
     - Гетер повертає числове значення `#price`.
     - Сетер перевіряє, що нове значення є числом більшим за 0. Якщо передано некоректне значення, викидати помилку `new Error('Ціна повинна бути додатним числом')`.
   - Статичне поле `taxRate = 0.05` (ставка податку за замовчуванням 5%).
   - Статичний метод `formatPrice(amount, currency = 'грн')`, який повертає відформатований рядок (наприклад, `"3200.00 грн"`).
   - Метод екземпляра `calculateTotalWithTax()`: розраховує повну ціну товару з урахуванням податку: `this.price * (1 + Product.taxRate)`.
   - Метод екземпляра `getInfo()`: повертає рядок виду `"[ID: <id>] <title> (<category>) — <ціна> грн"`.

```javascript
const keyboard = new Product('Механічна клавіатура', 3200, 'electronics')

console.log(keyboard.id) // Наприклад, "prod_1"
console.log(keyboard.price) // 3200
console.log(keyboard.getInfo()) // "[ID: prod_1] Механічна клавіатура (electronics) — 3200 грн"
console.log(Product.formatPrice(keyboard.calculateTotalWithTax())) // "3360.00 грн"

// keyboard.price = -100 // Error: Ціна повинна бути додатним числом
// keyboard.#price = 500 // SyntaxError: Private field '#price' must be declared in an enclosing class
```

2. Створити класи спадкоємців `ElectronicsProduct` та `PerishableProduct`, що наслідують `Product` через `extends`:
   - Клас `ElectronicsProduct`:
     - Конструктор приймає `(title, price, warrantyMonths, powerConsumption)`.
     - Викликає конструктор батьківського класу `super(title, price, 'electronics')`.
     - Зберігає захищену властивість `_warrantyMonths` та публічну `powerConsumption`.
     - Перевизначає метод `getInfo()`: викликає батьківський метод через `super.getInfo()` та додає до нього інформацію про гарантію та енергоспоживання:
       `"<базовий info> | Гарантія: <warrantyMonths> міс., Потужність: <powerConsumption> Вт"`.
   - Клас `PerishableProduct` (швидкопсувний товар, наприклад продукти харчування):
     - Конструктор приймає `(title, price, category, expirationDate)`.
     - Викликає `super(title, price, category)`.
     - Зберігає приватне поле `#expirationDate` (об'єкт `Date`).
     - Метод `isExpired()`: порівнює `#expirationDate` з поточною датою (`new Date()`) і повертає `true/false`.
     - Перевизначає метод `getInfo()`: додає до базового рядка термін придатності у форматі `YYYY-MM-DD` та позначку про придатність.

```javascript
const tv = new ElectronicsProduct('Smart TV 55"', 18000, 24, 120)
console.log(tv.getInfo())
// "[ID: prod_2] Smart TV 55" (electronics) — 18000 грн | Гарантія: 24 міс., Потужність: 120 Вт"

const milk = new PerishableProduct('Органічне молоко', 45, 'dairy', new Date('2026-10-01'))
console.log(milk.isExpired()) // false
console.log(milk.getInfo())
// "[ID: prod_3] Органічне молоко (dairy) — 45 грн | Придатний до: 2026-10-01"
```

3. Створити клас користувача `User` та його підклас `AdminUser`:
   - Клас `User`:
     - Конструктор приймає `name`, `email`, `role = 'customer'`.
     - Приватне поле `#passwordHash`.
     - Метод `setPassword(newPassword)`: перевіряє довжину пароля (мінімум 6 символів), імітує хешування (наприклад, додає префікс/хеш) та записує у `#passwordHash`.
     - Метод `checkPassword(password)`: перевіряє відповідність пароля збереженому хешу (повертає `true/false`).
     - Метод `getRole()`: повертає роль.
   - Клас `AdminUser extends User`:
     - Конструктор приймає `name`, `email`, `adminKey`.
     - Приватне статичне поле `#secretMasterKey = 'master_admin_2026'`.
     - У конструкторі перевіряє, чи збігається переданий `adminKey` із `#secretMasterKey`. Якщо ні — викидати помилку `new Error('Відмовлено у доступі: невірний ключ адміністратора')`.
     - Якщо ключ вірний — викликає `super(name, email, 'admin')` та ініціалізує власний масив прав доступу `permissions = ['all']`.
     - Статичний фабричний метод `createSuperAdmin(name, email)`: створює та повертає новий екземпляр `AdminUser` із внутрішнім правильним ключем.

```javascript
const admin = AdminUser.createSuperAdmin('Тарас', 'taras@store.ua')
console.log(admin.getRole()) // "admin"
console.log(admin.permissions) // ['all']

// Спроба створити з невірним ключем:
// const fakeAdmin = new AdminUser('Хакер', 'hacker@mail.com', '12345') 
// Error: Відмовлено у доступі: невірний ключ адміністратора
```

4. Створити клас кошика замовлення `ShoppingCart`:
   - Приватне поле `#items = []` (масив збережених товарів).
   - Приватне статичне поле `#totalOrdersCreated = 0` (лічильник створених кошиків/замовлень).
   - Статичний гетер `totalOrders`: повертає значення `#totalOrdersCreated`.
   - Метод `addItem(product, quantity = 1)`:
     - Перевіряє через `instanceof Product`, що доданий об'єкт дійсно є товаром або його спадкоємцем. Якщо ні — кидати помилку `new Error('Об’єкт не є валідним товаром')`.
     - Якщо товар уже є в списку, збільшує його кількість, інакше додає новий запис `{ product, quantity }`.
   - Метод `removeItem(productId)`: видаляє товар за його `id`.
   - Гетер `totalCost`: розраховує загальну суму всіх товарів у кошику з урахуванням кількості та податку (`calculateTotalWithTax`).
   - Метод `checkout()`:
     - Якщо кошик порожній, кидає помилку `"Кошик порожній"`.
     - Інкрементує статичний лічильник `#totalOrdersCreated`.
     - Повертає звіт про замовлення: масив замовлених найменувань, фінальну суму та дату.

```javascript
const cart = new ShoppingCart()
cart.addItem(keyboard, 2)
cart.addItem(tv, 1)

console.log(cart.totalCost) // Загальна вартість товарів із податком
const orderReport = cart.checkout()
console.log(orderReport)
console.log(ShoppingCart.totalOrders) // 1
```

5. Створити систему аналізу класів та ієрархії `inspectHierarchy(instance)`:
   - Приймає будь-який екземпляр класу.
   - Знаходить усі назви класів у ланцюжку прототипів аж до базового `Object` (використовуючи `Object.getPrototypeOf`).
   - Повертає об'єкт зі звітом:
     - `constructorName`: назва класу екземпляра (`instance.constructor.name`).
     - `inheritanceChain`: масив імен предків (наприклад, `['ElectronicsProduct', 'Product', 'Object']`).
     - `isInstanceOf(ClassRef)`: допоміжна функція всередині звіту, що обгортає `instance instanceof ClassRef`.

```javascript
const report = inspectHierarchy(tv)
console.log(report.constructorName) // "ElectronicsProduct"
console.log(report.inheritanceChain) // ["ElectronicsProduct", "Product", "Object"]
console.log(report.isInstanceOf(Product)) // true
```

---

## Завдання 2. Архітектура компонентів: Міксини, Розширення вбудованих класів та Фабрики (Mixins, Extending Built-in Classes, Symbol.species)

У JavaScript клас може розширювати лише одного прямого предка (`extends`). Проте в реальних застосунках об'єктам одночасно потрібні логування, генерація подій (Event Emitter), валідація та спеціальні структури даних. Для цього застосовують патерн **Міксини (Mixins)** та розширення вбудованих класів (`Array`, `Map`) із кастомізацією поведінки за допомогою `Symbol.species`.

```javascript
// Базова сутність документа або допису для контент-системи
class Document {
    constructor(title, author) {
        this.title = title
        this.author = author
        this.content = ''
        this.createdAt = new Date()
    }
}
```

**Що потрібно зробити:**

1. Створити міксин подій `eventEmitterMixin`:
   - Реалізує поведінку підписки на події та сповіщення слухачів:
     - `on(eventName, handler)`: реєструє функцію `handler` на подію `eventName`. Якщо слухачів ще немає, ініціалізує збереження (наприклад, у внутрішній колекції `_eventHandlers`).
     - `off(eventName, handler)`: видаляє вказаний `handler` зі списку підписників події.
     - `emit(eventName, ...args)`: викликає всі зареєстровані слухачі для `eventName`, передаючи аргументи `...args`.
   - Забезпечити коректне встановлення через `Object.assign(TargetClass.prototype, eventEmitterMixin)`.

```javascript
const eventEmitterMixin = {
    // on, off, emit
}

class Article extends Document {}
Object.assign(Article.prototype, eventEmitterMixin)

const article = new Article('Новинки JS 2026', 'Олексій')
article.on('publish', (data) => console.log(`Статтю опубліковано: ${data.url}`))
article.emit('publish', { url: 'https://example.com/js-2026' })
// Виведе: Статтю опубліковано: https://example.com/js-2026
```

2. Створити міксин логування `loggingMixin`, який успадковується від іншого міксину `serializableMixin`:
   - `serializableMixin`:
     - Має метод `serialize()`: повертає JSON-рядок стану об'єкта (`JSON.stringify(this)`).
     - Має метод `deserialize(jsonString)`: приймає JSON-рядок і застосовує значення через `Object.assign(this, JSON.parse(jsonString))`.
   - `loggingMixin`:
     - Встановлює `serializableMixin` як свій прототип: `Object.setPrototypeOf(loggingMixin, serializableMixin)` або через `__proto__`.
     - Метод `log(message)`: виводить у консоль `[<this.constructor.name>] <message> | Стан: <this.serialize()>` (де `this.serialize()` викликається з успадкованого міксину через `super.serialize()` або безпосередньо).
     - Метод `logAction(actionName, details)`: фіксує виконану дію з міткою часу.

```javascript
class Task {
    constructor(title) {
        this.title = title
        this.status = 'pending'
    }
}

Object.assign(Task.prototype, loggingMixin)

const task = new Task('Підготувати реліз')
task.status = 'in-progress'
task.log('Зміна статусу')
// [Task] Зміна статусу | Стан: {"title":"Підготувати реліз","status":"in-progress"}
```

3. Реалізувати спадкування класів за допомогою функції-генератора міксинів (Mixin Factory / Class Mixin Pattern):
   - Синтаксис `extends` дозволяє наслідувати вираз: `class MyClass extends Timestampable(BaseClass)`.
   - Створити фабрику міксинів `Timestampable`:
     - Приймає базовий клас `Base`.
     - Повертає анонімний клас `class extends Base`, який:
       - У конструкторі автоматично ініціалізує приватне поле `#updatedAt = new Date()`.
       - Додає метод `touch()`: оновлює `#updatedAt = new Date()`.
       - Додає гетер `updatedAt`: повертає значення дати.
       - Додає гетер `ageInSeconds`: повертає кількість секунд, що пройшли від створення/оновлення до поточного моменту.
   - Створити клас `BlogPost`, що наслідує `Document` через фабрику: `class BlogPost extends Timestampable(Document)`.

```javascript
class BlogPost extends Timestampable(Document) {
    publish() {
        this.touch()
        console.log(`Пост "${this.title}" оновлено: ${this.updatedAt.toISOString()}`)
    }
}

const post = new BlogPost('Класи та міксини в JS', 'Марія')
console.log(post.updatedAt) // Поточна дата
// post.touch();
// console.log(post.ageInSeconds);
```

4. Створити розширений клас масиву `AdvancedCollection`, що наслідує вбудований клас `Array` (`extends Array`):
   - Додати метод `sortBy(key, order = 'asc')`:
     - Сортує елементи за полем `key` об'єктів (в порядку зростання `'asc'` або спадання `'desc'`).
     - Повертає саму колекцію для ланцюжка викликів (chaining).
   - Додати метод `sumBy(key)`: повертає числову суму значень вказаного поля всіх об'єктів колекції.
   - Додати метод `groupBy(key)`: групує об'єкти за вказаним полем і повертає звичайний об'єкт вигляду `{ [key]: [...] }`.
   - Додати метод `first()` та `last()`: повертають перший та останній елементи або `undefined`.
   - Перевірити поведінку методів `filter`, `map`, `slice`: вони за замовчуванням повертають екземпляр `AdvancedCollection`, а не звичайний `Array`.

```javascript
const products = new AdvancedCollection(
    { title: 'Телефон', price: 15000, category: 'tech' },
    { title: 'Чохол', price: 400, category: 'accessory' },
    { title: 'Планшет', price: 22000, category: 'tech' },
    { title: 'Плівка', price: 200, category: 'accessory' },
)

console.log(products.sumBy('price')) // 37600
console.log(products.groupBy('category'))
// {
//   tech: [{ title: 'Телефон', ... }, { title: 'Планшет', ... }],
//   accessory: [{ title: 'Чохол', ... }, { title: 'Плівка', ... }]
// }

const expensiveTech = products.filter(p => p.price > 1000)
console.log(expensiveTech instanceof AdvancedCollection) // true
console.log(expensiveTech.sumBy('price')) // 37000 (методи AdvancedCollection доступні після filter!)
```

5. Кастомізувати повернення результатів у підкласі масиву через `Symbol.species`:
   - Створити клас `SmartList extends Array`:
     - Додати власний метод `unique()`: повертає новий список лише з унікальними елементами.
     - Налаштувати статичний гетер `Symbol.species`, щоб вбудовані методи трансформацій (`map`, `filter`, `concat`, `slice`) повертали **звичайний базовий масив `Array`**, а не `SmartList`:
       `static get [Symbol.species]() { return Array; }`.
     - Продемонструвати різницю: показати, що після виклику `smartList.filter(...)` повертається звичайний `Array`, у якого немає методу `.unique()`.

```javascript
class SmartList extends Array {
    unique() {
        return this.constructor.from(new Set(this))
    }

    static get [Symbol.species]() {
        return Array
    }
}

const list = new SmartList(1, 2, 2, 3, 4, 4, 5)
console.log(list.unique()) // SmartList(5) [1, 2, 3, 4, 5]

const filtered = list.filter(x => x > 2)
console.log(filtered instanceof SmartList) // false!
console.log(filtered instanceof Array) // true!
// filtered.unique() // TypeError: filtered.unique is not a function
```

---

## Додаткові вимоги

1. **Обов'язкова умова вибору:**
   - Для максимальної оцінки **12 балів** обов'язково виконати **лише 1 завдання із 2-х** (на ваш вибір).
   - Якщо виконано обидва завдання — оцінюється найкраще, а друге зараховується як додатковий плюс/бонус.
2. **Інкапсуляція та синтаксис класів:**
   - Чітко розмежовувати приватні поля синтаксису мови (`#privateField`) та захищені поля за домовленістю (`_protectedField`).
   - Пам'ятати: приватні поля `#` не доступні ззовні класу і не успадковуються підкласами напряму — доступ до них здійснюється через гетери, сетери або публічні методи батька.
3. **Робота з наслідуванням (`extends` і `super`):**
   - Завжди викликати `super(...)` у конструкторі дочірнього класу перед першим зверненням до `this`.
   - За потреби розширювати поведінку батьківських методів, викликаючи `super.method(...)`.
4. **Статичні методи та властивості:**
   - Використовувати статичні поля (`static field`) та методи для операцій, що стосуються всього класу загалом (фабричні методи, конфігурації, спільні лічильники), а не конкретних екземплярів.
5. **Міксини та вбудовані класи:**
   - Розуміти механіку `Object.assign` для домішування методів у `Class.prototype`.
   - Розуміти призначення `Symbol.species` при наслідуванні від стандартних структур даних (`Array`, `Map`, `Set`).
6. **Чистота коду та тестування:**
   - Змінні, методи та класи повинні мати зрозумілий самодокументований неймінг.
   - Продемонструвати роботу створених класів та методів у консолі (`console.log`) на конкретних тестових сценаріях.
