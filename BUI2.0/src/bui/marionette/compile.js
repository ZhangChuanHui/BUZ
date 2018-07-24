import _ from "../common/utils";
import EventHandler from '../common/event';
import log from '../common/log';
import observer from '../property/observer';

const LOGTAG = "页面渲染";

/**
 *  作者：张传辉
 *  功能名称：页面渲染
 *  描述信息：
*/
class Compile {
    constructor(el, data) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
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
            if (this.isElementNode(node)) {
                this.compile(node);
            }
            else if (this.isTextNode(node)) {
                let textReg = /\{\{(.*)\}\}/;
                let htmlReg = /\{\{\{(.*)\}\}\}/;
                if (htmlReg.test(node.textContent)) {
                    let exp = htmlReg.exec(node.textContent)[1];
                    CompileOrder.exec("html", node, this.data, exp);
                }
                else if (textReg.test(node.textContent)) {
                    let exp = textReg.exec(node.textContent)[1];
                    CompileOrder.exec("text", node, this.data, exp);
                }
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
            let attrName = attr.name;

            if (_.startWith(attrName, "b-")) {
                let value = attr.value;
                let order = attrName.substring(2);

                if (_.startWith(order, "on")) {

                }
                else {
                    CompileOrder.exec(order, node, this.data, value);
                }

                node.removeAttribute(attrName);
            }
        });
    }
}

/**
 *  作者：张传辉
 *  功能名称：页面渲染指令集管理
 *  描述信息：
*/
class CompileOrder extends EventHandler {
    constructor() {
        super();
        /** 指令集 */
        this.orders = {
            text: (node, data, exp) => {
                this.bind(node, data, exp, "text");
            },
            html: (node, data, exp) => {
                this.bind(node, data, exp, "html");
            },
            class: (node, data, exp) => {
                this.bind(node, data, exp, "class");
            }
        };
    }
    /**
     * 执行指令
     * @param orderName 指令名称 <String>
     * @param node 节点 <Element>
     * @param data 数据 <Object>
     * @param exp 表达式 <String> 
    */
    static exec(orderName, node, data, exp) {
        let order = this.orders[orderName];
        //TODO:缺少 exp表达式处理
        if (order) {
            order(node, data, exp);
        }
        else {
            log.error(LOGTAG, `未找到${orderName}指令名`);
        }
    }
    /**
     * 绑定视图数据
     * @param node 节点 <Element>
     * @param data 数据 <Any>
     * @param exp 表达式 <String>
     * @param type 更新类型 <String>
    */
    bind(node, data, exp, type) {
        let updater = this[`${type}Updater`];

        if (updater) {
            let modelValue = this.getModelValue(data, exp);
            updater(node, modelValue);

            new observer.Watcher(data, value, (value, oldValue) => {
                updater(node, modelValue, oldValue);
            });
        }
        else {
            log.warn(LOGTAG, `找不到指定的${type}更新器`);
        }
    }
    getModelValue(data, exp = "") {
        let result = data;

        exp = exp.split('.');
        exp.forEach((key) => {
            result = result[key];
        });

        return result;
    }
    /**
     * 文本更新
     * @param node 节点 <Element>
     * @param value 值 <Any>
    */
    textUpdater(node, value) {
        node.textContent = _.isStrEmpty(value) ? "" : value;
    }
    /**
     * 节点DOM更新
     * @param node 节点 <Element>
     * @param value 值 <Any>
    */
    htmlUpdater(node, value) {
        node.innerHTML = _.isStrEmpty(value) ? "" : value;
    }
    /**
     * 更新Class
     * @param node 节点 <Element>
     * @param value 值 <String>
     * @param oldValue 旧值 <String>
    */
    classUpdater(node, value, oldValue) {
        let className = node.className;

        className = className.replace(oldValue, "")
            .replace(/\s$/, "");

        var space = className
            && _.isStrEmpty(value) ? "" : " ";

        node.className = className + space + value;
    }
};