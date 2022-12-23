import { def } from "../util/lang";
import { arrayMethods } from "./array";
import Dep from "./dep";

class Observe {
  constructor(data) {
    // 给每个对象都增加收集功能
    this.dep = new Dep();
    def(data, '__ob__', this); // 不可枚举避免重复循环
    data.__ob__ = this; //给数据加标识，如果有表明已被代理过
    if (Array.isArray(data)) {
      data.__proto__ = arrayMethods;
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    data.forEach((element) => {
      observe(element);
    });
  }
}

function dependArray(value) {
  for (let index = 0; index < value.length; index++) {
    const element = value[index];
    element.__ob__ && element.__ob__.dep.depend();
    if (Array.isArray(element)) {
      dependArray(element);
    }
  }
}

//闭包、属性劫持
export function defineReactive(target, key, value) {
  let childOb = observe(value); // 对所有的对象进行数据劫持 childOb.dep 收集依赖
  let dep = new Dep(); //每个属性都有
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend(); //收集watcher
        if (childOb)  {
          childOb.dep.depend(); // 数组和对象本身也收集依赖
          if (Array,isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      value = newValue;
      dep.notify(); // 通知更新
    },
  });
}

export function observe(data) {
  if (typeof data !== "object" || data == null) {
    return;
  }
  if (data.__ob__ instanceof Observe) {
    // 对象已被代理过
    return data.__ob__;
  }
  return new Observe(data);
}
