const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);
const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methodsToPatch.forEach(function (method) {
  arrayMethods[method] = function (...args) {
    const result = arrayProto[method].call(this, ...args);
    const ob = this.__ob__;
    let inserted;
    switch(method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice': // arr.splice(0, 1, {a:1}, {a: 2}) 第三个参数是具体新增的项目
        inserted = args.slice(2);
      default:
         break;

    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    // 触发视图更新
    ob.dep.notify();
    return result;
  };
});
