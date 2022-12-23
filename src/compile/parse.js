import { unicodeRegExp } from "../util/lang"
// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

export function parseHTML(html) {

  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; // 存放元素
  let currentParent; // 指向的是栈中的最后一个
  let root;

  // 最终需要转化成的一个抽象语法树
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs);
    if (!root) { // 看当前是否是空树
      root = node; // 如果为空则当前node为根节点
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node;
  }
  // 文本放到当前指向的节点
  function chars(text) {
    text = text.replace(/\s/g, '');
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    });
  }
  // 弹出栈
  function end(tag) {
    let node = stack.pop(); // 弹出最后一个
    currentParent = stack[stack.length -1];
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],  // 标签名
        attrs: []
      };
      advance(start[0].length);
      let attr, end;
      // 开始标签没结束就一直循环
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        });
      }
      if (end) {
        advance(end[0].length); 
      }
      return match;
    }
    return false;
  }
  while(html) {
    let textEnd = html.indexOf('<');
    if (textEnd == 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
      // break;
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd);
      if (text) {
        chars(text);
        advance(text.length);
      }
      // break;
    }
  }
  console.log(root);
  return root;
}