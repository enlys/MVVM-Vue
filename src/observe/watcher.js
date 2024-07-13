import Dep, { popTarget, pushTarget } from "./dep";

// 1.创建渲染watcher时我们会把当前的watcher实例挂载到Dep.target上
// 2.调用_render()函数就会走到属性的get方法上

let id = 0;
class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.id = id++;
    this.renderWatcher = options; //是一个渲染watcher
    if (typeof exprOrFn == 'string') {
      this.getter = function() {
        return vm[exprOrFn];
      }
    } else {
      this.getter = exprOrFn; //调用发生取值
    }
    
    this.deps = []; //实现计算属性及清理工作
    this.depsId = new Set();
    this.lazy = options.lazy; //标识是否为计算属性
    this.cb = cb;
    this.dirty = this.lazy; // 缓存值 取值的时候标识是否执行
    this.vm = vm;
    this.user = options.user;
    this.value = this.lazy ? undefined : this.get();
  }
  get() {
    pushTarget(this); // 静态属性
    let value = this.getter.call(this.vm); // 去VM上取值
    popTarget();
    return value;
  }
  depend() { // 用于计算属性 
    let i = this.deps.length;
    while(i--) {
      this.deps[i].depend();
    }
  }
  addDep(dep) { // 需要去重
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
  evaluate() {
    this.value = this.get(); // 获取到用户函数的取值，标识为脏
    this.dirty = false;
  }
  update() {
    if (this.lazy) { // 依赖的值发生变化，标识还原
      this.dirty = true;
    }
    // this.get();
    queueWatcher(this);
  }
  run() {
    const oldValue = this.value;
    const value = this.get();
    if (this.user) { // watch 监听器
      this.cb.call(this.vm, value, oldValue);
    }
  }
}

let queue = [];
let has = {};
let pending = false; // 防抖

function flushScheduleQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  for (let i = 0; i < flushQueue.length; i++) {
    const element = flushQueue[i];
    element.run();
  }
}

function queueWatcher(watcher) {
  let id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    // 不管update执行多少次，最终只执行一轮刷新操作
    if (!pending) {
      setTimeout(flushScheduleQueue, 0);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;

function flushCallbacks() {
  let cbs = callbacks.slice(0);
  callbacks = [];
  waiting = false;
  cbs.forEach(cb => cb());
}


let timerFunc

if (Promise) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
  }
} else if (MutationObserver) {
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb) { // 通过队列按照顺序执行
  callbacks.push(cb);
  if (!waiting) {
    timerFunc();
    waiting = true;
  }
}

  

// 给每个属性增加一个dep, 目的就是收集watcher



export default Watcher;