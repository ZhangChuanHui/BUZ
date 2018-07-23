/**
 *  作者：张传辉
 *  功能名称：页面渲染
 *  描述信息：
*/
class Compile {
    constructor(el) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);

        if (this.el) {
            this.fragment = this.nodeFragment(this.el);
            this.compileNodes(this.fragment);

            this.el.appendChild(this.fragment);
        }
    }
    compileNodes(el) {
        let childNodes = el.childNodes;

        childNodes.forEach((node) => {
            if (this.isElementNode(node)) {

            }
            else if (this.isTextNode(node)) {
                /\{\{(.*)\}\}/.test(node.textContent)
                && 1==1
            }

            if (node.childNodes && node.childNodes.length) {
                this.compileNodes(node);
            }
        });
    }
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isTextNode(node) {
        return node.nodeType === 3;
    }
    nodeFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;

        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    }
    compile(node) {
        let nodeAttrs = node.attributes;

        nodeAttrs.forEach((attr) => {

        });
    }
}