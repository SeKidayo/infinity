---
title: Promise
author: seki
date: '2023-04-19'
---



# Promise

## 手动实现Promise

### 构造函数

ES6中创建一个`Promise`实例时，需要在其构造函数中传入执行器(executor)函数作为参数

```js
const p = new Promise((resolve, reject) => {
  // p实例化时,处于 pending(待定)状态,并同步执行该执行器函数内代码
  // 调用resolve方法,表明p的状态由 pending 变为 resolved(解决状态, 或称fulfilled兑现状态)
  // 调用reject方法,表明p的状态由 pending 变为 rejected(拒绝状态)
})
```

所以，手动实现`Promise`的构造函数大致结构如下：

```js
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.status = PENDING; // 当前状态
    this.value = undefined; // 存放 resolved状态下的值
    this.reason = undefined; // 存放 rejected状态下的值
    
    // Promise中代码如果出现异常,则需要将状态变更为rejected
    // 故此处采用 try catch 捕捉错误
    try {
      executor(this.resolve, this.reject);
    } catch (err) {
      reject(err);
    }
  }
  
  resolve() {
    // TODO
  }
  
  reject() {
    // TODO
  }
}
```



### `this`指向问题

上述代码看似还算合理，但其实暗藏大问题。

先实例化测试一下：

```js
// 实例化
const p = new MyPromise((resolve, reject) => {
  resolve('seki');
});
```

此时，内部的`reslove`中的`this`指向如何呢?

```js
resolve() {
	console.log(this); // undefined
}
```

whyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy????

希望下面的例子可以帮助理解：

```js
const obj = {
  a() {
    console.log(this);
  }
}

const b = obj.a;

obj.a(); // obj对象本身
b(); // window(严格模式下为undefined)
```

回到我们的MyPromise中,即相当于：执行器函数中的 resolve 被赋值为 MyPromise中的 this.resolve (resolve = this.resolve)

在此赋值过程中失去了调用者(this),导致this指向不存在

<br/>

**如何解决？**

思路并不固定，比如常见的采用`bind`更改`this`指向

```js
...
executor(this.resolve.bind(this), this.reject.bind(this));
...
```

或者**不将**`resolve`与`reject`方法挂载在实例上，而是在`constructor`内部以箭头函数的形式定义

```js
...
constructor(executor) {
...
	const resolve = (value) => {
  	// todo
	}
  
	const reject = (reason) => {
    // todo
  }
  
  try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
...
}
...
```

本文采用第二种方法实现

