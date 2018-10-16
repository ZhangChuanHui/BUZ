import Base from './base';
export const TAGREGEXP = /\{\{((?:.|\n)+?)\}\}/g;

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
            let match, index,
                params = [],
                lastIndex = TAGREGEXP.lastIndex = 0;

            while (match = TAGREGEXP.exec(content)) {
        
                index = match.index;

                if (index > lastIndex) {
                    params.push({
                        tag: "text",
                        content: content.slice(lastIndex, index)
                    });
                }

                let exp = match[1].trim();

                params.push({
                    tag: "exp",
                    content: exp
                });

                lastIndex = index + match[0].length;
                
            }
            if (lastIndex < content.length) {
                params.push({
                    tag: "text",
                    content: content.slice(lastIndex)
                });
            }

            this.result.push({
                exp: content,
                cause: content,
                order: "text",
                param: params
            });
        }
    }
}