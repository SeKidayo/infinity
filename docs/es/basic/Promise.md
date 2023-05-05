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

或者**不将**`resolve`与`reject`方法直接挂载在原型上，而是在`constructor`内部以箭头函数的形式定义一个闭包函数(如下例) 或 将该箭头函数定义为实例方法 均可

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

本文采用第二种方法上述代码实现



### `resolve`与`reject`

接下来完善`resolve`与`reject`

```js
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

/**
 * 手动实现Promise
 */
class MyPromise {
  constructor(executor) {
    this.status = PENDING; // 当前状态
    this.value = undefined; // 存放 resolved状态下的值
    this.reason = undefined; // 存放 rejected状态下的值
    this.resolvedCallbackList = []; // 存放成功的回调
    this.rejectedCallbackList = []; // 存放失败的回调

    const resolve = (value) => {
      if (this.status === PENDING) { // promise实例的状态一旦变更,便不会再次变化
        this.status = RESOLVED;
        this.value = value;
        for (let i = 0; i < this.resolvedCallbackList.length; i++) {
          this.resolvedCallbackList[i](value);
        }
      }
    }

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        for (let i = 0; i < this.resolvedCallbackList.length; i++) {
          this.rejectedCallbackList[i](reason);
        }
      }
    }
    
    // Promise中代码如果出现异常,则需要将状态变更为rejected
    // 故此处采用 try catch 捕捉错误
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
}
```





### `then`与`catch`

上一节可能会有疑惑，新引入两个实例属性`resolvedCallbackList`与`rejectedCallbackList`有何用处？

我们都知道`Promise`的实例方法`then`的调用形式如下：

```js
p.then(onResolved, onRejected)
```

其中`onResolved`方法会在`Promise`实例状态变更为`resolved`状态后触发（`onRejected`同理）

所以在我们实现的`then`方法被调用时，需要将该回调函数记录下来并在`resolve`方法中(状态变更后)真正调用

大致代码如下：

```js
const noop = () => {};
...
then(onResolved, onRejected) {
    // 设置类型转换
    onResolved = typeof onResolved === 'function' ? onResolved : noop;
    onRejected = typeof onRejected === 'function' ? onRejected : noop;

    // 根据实例的状态不同,共分三种情况:
    // 1. resolved
    if (this.status === RESOLVED) {

    }

    // 2. rejected
    if (this.status === REJECTED) {

    }

    // 3. pending
    if (this.status === PENDING) {
      
    }

  }
```

总所周知，`Promise`的`then`支持链式调用，也就是每个`then`方法都会返回一个新的`Promise`实例。

且返回的值取决于上一次`then`方法的返回值；特殊地，如果返回值也是一个`Promise`实例，则取其状态变更时的结果作为真正的返回值。

基于上面的描述，我们可以得到如下代码：

```js
then(onResolved, onRejected) {
    const that = this;
    let nextPromise;

    // 设置类型转换
    onResolved = typeof onResolved === 'function' ? onResolved : noop;
    onRejected = typeof onRejected === 'function' ? onRejected : noop;

    // 根据实例的状态不同,共分三种情况:
    // 1. resolved
    if (this.status === RESOLVED) {
      // 状态变更为resolved后执行onResolved方法,并返回新Promise实例
      return nextPromise = new MyPromise((resolve, reject) => {
        try {
          const returns = onResolved(that.value); // 获取onResolved的返回值

          if (returns instanceof MyPromise) { // 如果返回值是一个Promise实例,则将resolve作为onResolved传入.then方法中,递归调用;直至获取到非Promise实例为止
            returns.then(resolve, reject);
          }

          resolve(returns);

        } catch (e) {
          reject(e);
        }
      })
    }

    // 2. rejected
    if (this.status === REJECTED) {
      // 与 前一个if基本相同,只是获取onRejected的返回值
      return nextPromise = new MyPromise((resolve, reject) => {
        try {
          const returns = onRejected(that.reason);
          if (returns instanceof MyPromise) {
            returns.then(resolve, reject);
          }

          resolve(returns);

        } catch (e) {
          reject(e);
        }
      })
    }

    // 3. pending
    if (this.status === PENDING) {
      // 如果当前实例状态还处于pending状态(eg: 执行器函数中状态异步变更情境下),我们并不能确定调用onResolved还是onRejected
      // 只能等到Promise的状态确定后,才能确定如何实现
      // 所以此时我们需要把我们上述两种情况下的处理逻辑存入到对应的回调数组中去,等待 状态的变更(即resolve或reject方法的执行)
      return nextPromise = new MyPromise((resolve, reject) => {
        that.resolvedCallbackList.push((value) => {
          try {
            const returns = onResolved(value);
            if (returns instanceof MyPromise) {
              returns.then(resolve, reject);
            }
            
            resolve(returns);
            
          } catch (e) {
            reject(e);
          }
        })

        that.rejectedCallbackList.push((reason) => {
          try {
            const returns = onRejected(reason);
            if (returns instanceof MyPromise) {
              returns.then(resolve, reject);
            }
            
            resolve(returns);
          	
          } catch (e) {
            reject(e);
          }
       })
    })
  }
}
```

至于`catch`方法，本质上也只是`then`方法的一个语法糖，如下：

```js
catch(onRejected) {
    return this.then(null, onRejected);
}
```



ok，这时候我们的Promise大致已经可以正常使用了(可以试一下哦)

但是，仍有一些细节点需要优化的：

1. `Promise`的穿透特性未能实现：

   ```js
   new Promise((resolve) => {
     resolve('seki')
   })
   	.then()
   	.catch()
   	.then((value) => {
     	console.log(value); // 此处输出'seki',而非undefined
   	})
   
   // 即,上述未传参的then与catch方法期望与下面的方法等价:
   new Promise((resolve)=>{
     resolve(8)
   })
     .then(function(value){
       return value
     })
     .catch(function(reason){
       throw reason
     })
     .then(function(value) {
       console.log(value);
     })
   ```

2. 不光是我们自己封装的`Promise`，还有其他人封装的`Promise`以及原生`Promise`；我们如果想要交替/组合使用它们，那`returns instanceof MyPromise`这样的判断条件便稍显简陋，需要一个更完善的解决方案

3. 如果已经测试过上述代码的小伙伴一定发现了一个小(?)问题，`then/catch`方法中的`onResolved`与`onRejected`是**同步**执行的，这就会导致下面的情况发生：

   ```js
   const p = new MyPromise((resolve) => resolve('seki-1'));
   
   p.then(() => {
     console.log('我是最后输出的');
   })
   
   console.log('我应该紧跟在seki-1后面输出!');
   
   // 原生Promise(理想)打印顺序:
   // 1)seki-1
   // 2)我应该紧跟在seki-1后面输出!
   // 3)我是最后输出的
   
   // 但MyPromise打印顺序:
   // 1)seki-1
   // 2)我是最后输出的
   // 3)我应该紧跟在seki-1后面输出!
   ```



问题还挺多，那就一个一个的解决吧!



### 值的穿透

### 不同`Promise`交互

### `then`异步执行
