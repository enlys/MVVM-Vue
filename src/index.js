import { initMixin } from "./init";
import { initLifecycle } from './lifecycle';
import { initGlobalAPI } from './globalAPI';
import { initStateMixin } from "./state";

function Vue(options) {
  this._init(options);
}


initMixin(Vue); // 扩展init
initLifecycle(Vue); // 
initGlobalAPI(Vue); // 全局api
initStateMixin(Vue); // 实现nextTick $watch


export default Vue;
