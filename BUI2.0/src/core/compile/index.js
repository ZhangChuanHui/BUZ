import log from '../common/log';
import parser from './parser/index';
import orders from './orders/index';
import CompileOrder from './order';

const LOGTAG = "页面渲染";

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

            this.compileNodes(this.fragment);

            this.el.appendChild(this.fragment);
        }
    }
    compileNodes(el) {
        let childNodes = el.childNodes;

        childNodes.forEach((node) => {
            let tokens = new parser(node);

            CompileOrder.exec(node, tokens, {
                view: this.view,
                data: this.data,
                refNode: this.el
            });

            if (node.childNodes && node.childNodes.length) {
                this.compileNodes(node);
            }
        });
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