const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';
const noop = () => {};

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

  then(onResolved, onRejected) {

    const that = this;

    let nextPromise;

    // 设置类型转换
    onResolved = typeof onResolved === 'function' ? onResolved : noop;
    onRejected = typeof onRejected === 'function' ? onRejected : noop;

    // 根据实例的状态不同,共分三种情况:
    // 1. resolved
    if (this.status === RESOLVED) {
      // 状态变更为resolved后执行onResolved方法
      return nextPromise = new MyPromise((resolve, reject) => {
        try {
          const returns = onResolved(that.value); // 获取onResolved的返回值

          if (returns instanceof MyPromise) { // 如果返回值是一个Promise实例,则将resolve作为onResolved传入.then方法中,递归调用;直至非Promise实例为止
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
      // 与 前一个if基本相同
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

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}


// ------------------ test -------------------------
const p = new MyPromise((resolve, reject) => {
  console.log('init');
  resolve("success");
  setTimeout(() => {
    console.log('state change');
    resolve("success");
    // reject('fail');
  }, 1000)
})

p
.then((value) => {
  console.log('then1', value);
  return 1;
}, (reason) => {
  console.log(reason);
})
.then((value) => {
  console.log('then2', value);
})
console.log('run');