let id = 0;
class Dep {
  constructor() {
    this.id = id++; // 属性的dep
    this.subs = []; // 存储watcher数组
  }
  depend() {
    //需要去重
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach(item => {
      item.update();
    });
  }
}

Dep.target = null;


let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}

export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;