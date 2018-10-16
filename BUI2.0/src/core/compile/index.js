import log from '../common/log';
import parser from './parser/index';
import orders from './orders/index';
import CompileOrder from './order';

export const LOGTAG = "页面渲染";

/**
 * 节点渲染
 * @param el 节点
 * @param option 配置信息
*/
export function compileNodes(el, option, refMaps = []) {
    let tokens = new parser(el);
    let map = {
        el: el,
        tokens: tokens,
        childs: []
    };

    CompileOrder.exec(el, tokens, option);

    let childNodes = el.childNodes;
    if (childNodes && childNodes.length) {
        childNodes.forEach((node) => {
            compileNodes(node, option, map.childs);
        });
    }
    refMaps.push(map);
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
                refNode: this.el,
                //级联式指令数据存放处
                orderDatas: {}
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