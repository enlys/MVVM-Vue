import { isSameVnode } from ".";

function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, oldProps = {}, props = {}) {
  // 老的属性中有新的没有，要删除老的
  let oldStyles = oldProps.style;
  let newStyles = props.style;
  for(let key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = '';
    }
  }
  for (const key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }
  for (let key in props) {
    if (key === "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

export function patch(oldVNode, vnode) {
  // 是否是真实DOM
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode;
    const parentElm = elm.parentNode; // 查找父元素
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling); // 插入新元素
    parentElm.removeChild(elm); //删除老节点
    return newElm;
  } else {
    // diff
    // 1.两个节点不同直接替换
    // 2.两个节点是同一个节点（判断节点tag和key） 比较两个节点的属性
    // 3.节点比较完成比较孩子节点
    return patchVnode(oldVNode, vnode);
  }
}

function patchVnode(oldVNode, vnode) {
  if (!isSameVnode(oldVNode, vnode)) {
    return oldVNode.el.parentNode.replaceChild(createElm(vnode), oldVNode.el);
  }
  // 文本的情况
  let el = (vnode.el = oldVNode.el);
  if (!oldVNode.tag) {
    // 是文本
    if (oldVNode.text !== vnode.text) {
      el.textContent = vnode.text; // 用新的文本覆盖
    }
  }
  // 是标签
  patchProps(el,  oldVNode.data, vnode.data);
  // 比较儿子节点
  // 1.一方有儿子一方没儿子
  // 2.两方都有儿子
  let oldChildren = oldVNode.children || [];
  let newChildren = vnode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff
    updateChildren(el ,oldChildren, newChildren);
  } else if (newChildren.length > 0) { //没有老的
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    unmountChildren(el, oldChildren);
  }
  return el;
}


function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i];
    el.appendChild(createElm(child));
  }
}

function unmountChildren(el, oldChildren) {
  // el.innerHTML = '';
  for (let i = 0; i < oldChildren.length; i++) {
    const child = oldChildren[i];
    el.removeChild(child.el);
  }
}

function updateChildren(el, oldChildren, newChildren) {
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[key] = index;
    });
    return map;
  }

  let map = makeIndexByKey(oldChildren); // 映射

  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) { // 有任何一个不满足条件则终止
    
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) { // 比较开头节点
      patchVnode(oldStartVnode, newStartVnode); // 如果是相同节点则递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) { // 比较结尾节点
      patchVnode(oldEndVnode, newEndVnode); // 如果是相同节点则递归比较子节点
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) { // 交叉比对 尾头相比
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) { // 交叉比对 头尾相比
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++newStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else { // 遍历比较
      // 根据老的做一个映射关系，找到则复用移动位置否则就添加
      let moveIndex = map[newStartVnode.key]; // 查找是否有
      if (moveIndex) {
        let child = oldChildren[moveIndex];
        el.insertBefore(child.el, oldStartVnode.el);
        oldChildren[moveIndex]= undefined; // 标识这个节点已经移动
        patchVnode(child, newStartVnode);
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }

  }
 
  if (newStartIndex <= newEndIndex) { // 新的多余的插入进去
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let child = createElm(newChildren[i]);
      // 可能向后追加，还可能向前追加
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // 获取下个元素
      el.insertBefore(child, anchor); // anchor为null,表现和appendchild一致
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        el.removeChild(oldChildren[i].el);
      }
    }
  }
}