import parser from './parser/index';
import orders from './plugins/index';
import CompileOrder from './order';

export const LOGTAG = "页面渲染";

/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/

/**
 * 节点渲染
 * @param {Element|BET} el 节点
 * @param {Object} option 配置信息
*/
export function compileNodes(el, option, scope) {
    let tokens = new parser(el);

    let result = CompileOrder.exec(el, tokens, option, scope);

    let watchers = result.watchers;

    //若指令禁止子集渲染||条件指令为false时
    if (result.isSkipChildren || el.conditionResult === false) return watchers;

    let childNodes = el.childNodes;
    if (childNodes && childNodes.length) {
        [...childNodes].forEach((node) => {
            watchers = watchers.concat(compileNodes(node, option, scope));
        });
    }

    return watchers;
}

/**
 *  作者：张传辉
 *  功能名称：页面渲染
 *  描述信息：
*/
class Compile {
    constructor(el, view, data) {
        this.el = el;
        this.view = view;
        this.data = data;

        if (this.el) {
            this.fragment = this.nodeFragment(this.el);

            let option = {
                view: this.view,
                data: this.data,
                refNode: this.el
            };

            compileNodes(this.fragment, option);

            this.el.appendChild(this.fragment);
        }
    }
    nodeFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;

        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    }
}

export default Compile;