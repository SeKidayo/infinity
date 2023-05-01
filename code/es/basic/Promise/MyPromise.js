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

    const resolve = (value) => {
      // TODO
    }

    const reject = (reason) => {
      //  TODO
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


// ------------------ test -------------------------
const p = new MyPromise((resolve, reject) => {
  resolve("seki");
})