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
          this.rejectedCallbackList[i](value);
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
}


// ------------------ test -------------------------
const p = new MyPromise((resolve, reject) => {
  resolve("seki");
})