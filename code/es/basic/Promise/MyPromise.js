const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";

/**
 * 根据returns的值来决定nextPromise的状态的函数
 * @param {Promise} nextPromise
 * @param {any} returns
 * @param {function} resolve
 * @param {function} reject
 */
function resolvePromise(nextPromise, returns, resolve, reject) {
  let called = false;

  if (nextPromise === returns) {
    // 如果是相同对象,则抛出错误
    return reject(new TypeError("Chaining cycle detected for promise!"));
  }

  if (
    (returns !== null && typeof returns === "object") ||
    typeof returns === "function"
  ) {
    // returns是对象/函数时
    try {
      // 注意点: 这里把 returns.then的值赋给then并不是可选的写法,而是有意义的
      // 根据 Promise/A+规范2.3.3.1所描述的: 因为returns.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // typeof returns.then 读取一次, returns.then.call()又读取一次;两次读取可能会导致其值发生变化
      let then = returns.then;
      if (typeof then === "function") {
        // 执行thenable对象下的then方法,兼容了所有类Promise结构
        then.call(
          returns,
          function rs(y) {
            if (called) return;
            called = true;
            resolvePromise(nextPromise, y, resolve, reject); // 没有直接resolve,是因为y的值仍然需要校验
          },
          function rj(r) {
            if (called) return;
            called = true;
            reject(r); // 状态变更为失败则无需校验,直接处理结果
          }
        );
      } else {
        resolve(returns); // 不是 thenable对象,则直接将returns作为结果
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 其他情况下,直接将returns的值作为最终的值
    resolve(returns);
  }
}

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
      if (this.status === PENDING) {
        // promise实例的状态一旦变更,便不会再次变化
        this.status = RESOLVED;
        this.value = value;
        for (let i = 0; i < this.resolvedCallbackList.length; i++) {
          this.resolvedCallbackList[i](value);
        }
      }
    };

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        for (let i = 0; i < this.resolvedCallbackList.length; i++) {
          this.rejectedCallbackList[i](reason);
        }
      }
    };

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
    onResolved =
      typeof onResolved === "function" ? onResolved : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 根据实例的状态不同,共分三种情况:
    // 1. resolved
    if (this.status === RESOLVED) {
      // 状态变更为resolved后执行onResolved方法
      return (nextPromise = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            const returns = onResolved(that.value); // 获取onResolved的返回值

            resolvePromise(nextPromise, returns, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }));
    }

    // 2. rejected
    if (this.status === REJECTED) {
      // 与 前一个if基本相同
      return (nextPromise = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            const returns = onRejected(that.reason);

            resolvePromise(nextPromise, returns, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }));
    }

    // 3. pending
    if (this.status === PENDING) {
      // 如果当前实例状态还处于pending状态(eg: 执行器函数中状态异步变更情境下),我们并不能确定调用onResolved还是onRejected
      // 只能等到Promise的状态确定后,才能确定如何实现
      // 所以此时我们需要把我们上述两种情况下的处理逻辑存入到对应的回调数组中去,等待 状态的变更(即resolve或reject方法的执行)
      return (nextPromise = new MyPromise((resolve, reject) => {
        that.resolvedCallbackList.push((value) => {
          setTimeout(() => {
            try {
              const returns = onResolved(value);

              resolvePromise(nextPromise, returns, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        that.rejectedCallbackList.push((reason) => {
          setTimeout(() => {
            try {
              const returns = onRejected(reason);

              resolvePromise(nextPromise, returns, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }));
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onStatusChanged) {
    return this.then((value) => {
      onStatusChanged();
      return value;
    }, (reason) => {
      onStatusChanged();
      throw reason;
    })
  }
}

// ------------------ test -------------------------
const p = new MyPromise((resolve, reject) => {
  console.log("init");
  // resolve("success");
  setTimeout(() => {
    console.log("state change");
    // resolve("success");
    reject("fail");
  }, 1000);
});

p.then(
  (value) => {
    console.log("then1", value);
    return 1;
  },
  (reason) => {
    console.log(reason);
  }
)
  .then()
  .catch()
  .then((value) => {
    console.log("then2", value);
    return Promise.resolve(123);
  })
  .then((value) => {
    console.log("then3", value);
    return {
      then(rs, rj) {
        rs("thenable");
      },
    };
  })
  .then((value) => {
    console.log("then4", value);
    throw 123;
  })
  .finally(() => {
    console.log('finally');
  })
console.log("run");
