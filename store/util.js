export function foreach(obj, cb) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      cb(i, obj[i]);
    }
  } else {
    for (let key in obj) {
      cb(key, obj[key]);
    }
  }
}