import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {},
};

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(this) : data;
  vm._data = data;
  observe(data);
  for (const key in data) {
    proxy(vm, `_data`, key);
  }
}

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatcher = {});
  for (let key in computed) {
    let userDef = computed[key];
    // const getter = typeof userDef == 'function' ? userDef : userDef.get;
    // const setter = userDef.set || () => {};
    let fn = typeof userDef == "function" ? userDef : userDef.get;
    // 根据lazy控制不立即执行get取值
    watchers[key] = new Watcher(vm, fn, { lazy: true });
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const getter = typeof userDef == "function" ? userDef : userDef.get;
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatcher[key]; //获取计算属性的watcher
    if (watcher.dirty) {  // dirty为真标识需要重新执行用户传递的方法
      watcher.evaluate();
    }
    if (Dep.target) {
      // 计算属性出栈后，还要渲染watcher,让计算属性watcher里的属性继续收集上层watcher
      watcher.depend();
    }
    return watcher.value;
  };
}

function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let index = 0; index < handler.length; index++) {
        createWatch(vm, key, handler[index]);
      }
    } else {
      createWatch(vm, key, handler);
    }
  }
}

function createWatch(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;
  // watch最终实现
  Vue.prototype.$watch = function (exprOrFn, cb) {
    new Watcher(
      this,
      exprOrFn,
      {
        user: true,
      },
      cb
    );
  };
}
