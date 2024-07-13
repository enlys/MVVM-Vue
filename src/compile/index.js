import { parseHTML } from "./parse";

function genProps(attrs) {
  let str = ''; // {name,value}
  for (let index = 0; index < attrs.length; index++) {
    const element = attrs[index];
    if (element.name === 'style') { // color:red => {color: 'red'}
      let obj = {};
      element.value.split(';').forEach(item => {
        let [key, value] = item.split(':');
        obj[key] = value;
      });
      element.value = obj;
    }
    str+=`${element.name}:${JSON.stringify(element.value)},` // a:b, c:d, 
  }
  return `{${str.slice(0, -1)}}`; // 属性外层{}包裹
}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
function gen(node) {
  if (node.type === 1) {
    return codegen(node);
  } else {
    // 文本
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      let tokens = [];
      let match;
      let lastIndex = (defaultTagRE.lastIndex = 0);
      while(match = defaultTagRE.exec(text)) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(`${JSON.stringify(text.slice(lastIndex, index))}`);
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(`${JSON.stringify(text.slice(lastIndex))}`);
      }
      return `_v(${tokens.join('+')})`; 
    }
  }
}

function genChildren(el) {
  const children = el.children;
  if (children) {
    return children.map(child => gen(child)).join(',');
  }
}

function codegen(ast) {
  let children = genChildren(ast);
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
  }${
    ast.children.length ? `,${children}` : ''
  })`;
  return code;
}
 
export function compileToFunction(template) {
  // 1.转换为AST语法树
  const ast = parseHTML(template);
  // 2.生成render方法（返回虚拟DOM）
  let code = codegen(ast);
  console.log(code);
  code = `with(this){return ${code}}`;
  let render = new Function(code); // 根据代码生成render函数
  console.log('render:', render);
  return render;
} 