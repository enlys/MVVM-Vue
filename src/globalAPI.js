import { mergeOptions } from "./utils";


export function initGlobalAPI(Vue) {
  // 静态方法
  Vue.options = {
    _base: Vue
  };
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
  };
  Vue.extend = function(options = {}) {
    function Sub(options = {}) {
      this._init(options);
    }
    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;
    // 将用户的参数和全局的参数合并
    Sub.options = mergeOptions(Vue.options, options);
    return Sub;
  }
  Vue.options.components = {};
  Vue.component = function(id, definition) {
    definition = typeof definition === 'function' ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  }
}
