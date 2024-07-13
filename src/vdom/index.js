// h() _c()
const isReserveTag = (tag) => {
  return ['a', 'div', 'ul', 'span', 'p', 'li'].includes(tag);
}

export function createElementVNode(vm, tag, data = {}, ...children){
  if (data == null) {
    data = {}
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  if (isReserveTag(tag)) {
    return vnode(vm, tag, key, data, children);
  } else {
    let Ctor = vm.options.components[tag]; // 组件的构造函数
    // ctor 可能为Sub类也可能为组件选项options
    return createComponentVnode(vm, tag, key, data, children, Ctor);
  }
}

function createComponentVnode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === 'object') {
    Ctor = vm.$options._base.extent(Ctor);
  }
  data.hook = {
    init(vnode) { // 创造真实节点调用
     let instance = vnode.componentInstance = new vnode.componentOptions.Ctor;
     instance.$mount();
    }
  };
  return vnode(vm, tag, key, data, children, null, {Ctor});
}

// _v()
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}


function vnode(vm, tag, key, data, children, text, componentOptions){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  }
} 


export function isSameVnode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}