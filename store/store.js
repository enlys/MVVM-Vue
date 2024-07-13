import { foreach } from "./util";
import { Vue } from './mixin';
export class Store {
  constructor(options) {
      // getter 类似计算属性(缓存) 用户{属性：方法} 使用{对象：值}
      let getter = options.getters;
      this.getters = {};
      let computed = {};
      foreach(getter, (key, fn) => {
        computed[key] = () => {
          return fn(this.state);
        };
        Object.defineProperty(this.getters, key, {
          get: () => {
            return this._vm[key];
          },
        });
      });
      let mutations = options.mutations;
      this.mutations = {};
      foreach(options.mutations, (key, fn) => {
        this.mutations[key] = (payload) => {
          fn(this.state, payload);
        };
      });
      let actions = options.actions;
      this.actions = {};
      foreach(options.actions, (key, fn) => {
        this.actions[key] = (payload) => {
          fn(this, payload);
        };
      });
      // Object.keys(getter).forEach(key => {
      //   Object.defineProperty(this.getters, key, {
      //     get: () => {
      //       return getter[key](this.state);
      //     },
      //   });
      // });
      // 响应式
      this._vm = new Vue({
        data: {
          $$state: options.state,
        },
        computed,
      });
  }
  get state() {
    return this._vm._data.$$state;
  }
  commit = (type, payload) => {
    this.mutations[type](payload);
  }
  dispatch = (type, payload) => {
    this.actions[type](payload);
  }
}
