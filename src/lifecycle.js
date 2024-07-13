import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom"
import { patch } from "./vdom/patch";



export function initLifecycle(Vue) {
  Vue.prototype._update = function(vnode) {
    const vm = this;
    const el = vm.$el;
    const preVnode = vm._vnode;
    vm._vnode = vnode;
    // patch初始化功能和更新
    if (preVnode) {
      vm.$el = patch(preVnode, vnode);
    } else {
      vm.$el = patch(el, vnode);
    }
    
  }
  Vue.prototype._c = function() {
    return createElementVNode(this, ...arguments);
  }
  Vue.prototype._v = function() {
    return createTextVNode(this, ...arguments);
  }
  Vue.prototype._s = function(value) {
    console.log('_s:', value);
    if (typeof value === 'object') {
      return value;
    }
    return JSON.stringify(value);
  }
  Vue.prototype._render = function() {
    const vm = this;
    return vm.$options.render.call(vm); 
  }
}





export function mountComponent(vm, el) {
  vm.$el = el;
 // 1.调用render产生虚拟节点
 const updateComponent = () => {
  vm._update(vm._render());
 };
 new Watcher(vm, updateComponent, true);
 // 2.根据虚拟dom产生真实DOM
 // 3. 插入到el元素中
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach(handlers => handlers.call(vm));
  }
}