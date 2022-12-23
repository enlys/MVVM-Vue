import { compileToFunction } from "./compile";
import { mergeOptions } from "./utils";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = mergeOptions(vm.constructor.options, options);
    callHook(vm , 'beforeCreate');
    // 初始化状态
    initState(vm);
    callHook(vm, 'created');
    if (options.el) {
      vm.$mount(options.el); //挂载
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let opts = vm.$options;
    if (!opts.render) {
      let template;
      if (!opts.template && el) {
        template = el.outerHTML;
      } else {
        if (el) {
          template = opts.template;
        }
      }
      if (template) {
        // 编译模板
        const render = compileToFunction(template);
        opts.render = render;
      }
      console.log(opts.render);
    }
    mountComponent(vm, el);
  }
}


// Vue流程
// 1.创造响应式数据
// 2.模板转换为AST语法树
// 3.将AST语法树转换为render函数
// 4.后续数据更新只执行render函数