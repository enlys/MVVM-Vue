export let Vue;

// 根实例挂载$store
export const install = function (_Vue) {
  Vue = _Vue;
  // 混入实例
  Vue.mixin({
    beforeCreate() {
      var options = this.$options;
      // store injection
      if (options.store) {
        this.$store =
          typeof options.store === "function" ? options.store() : options.store;
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store;
      }
    },
  });
};
