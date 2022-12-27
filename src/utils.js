const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
  "activated",
  "deactivated",
  "errorCaptured",
  "serverPrefetch",
];

const starts = {};
LIFECYCLE_HOOKS.forEach((hook) => {
  starts[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return [c];
      }
    } else {
      return p;
    }
  };
});

starts.components = function(parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for(let key in childVal) {
      res[key] = childVal[key]; // 优先使用自己的
    }
  }
  return res;
}

export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    if (starts[key]) {
      options[key] = starts[hook](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key]; // 优先采用儿子的，再采用父亲的
    }
  }
  return options;
}
