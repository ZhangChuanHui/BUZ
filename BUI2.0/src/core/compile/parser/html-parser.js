import Base from './base';
export const TAGREGEXP = /\{\{\{((?:.|\n)+?)\}\}\}/g;

/**
 *  作者：张传辉
 *  功能名称：文本节点模板渲染处理类
 *  描述信息：
*/
export default class Handler extends Base {
    check() {
        return this.node.nodeType === 3;
    }
    parser() {
        let content = this.node.textContent;

        if (TAGREGEXP.test(content)) {
            let exp = TAGREGEXP.exec(content)[1];

            this.result.push({
                exp: exps,
                cause: content,
                order: "html"
            });
        }
    }
}