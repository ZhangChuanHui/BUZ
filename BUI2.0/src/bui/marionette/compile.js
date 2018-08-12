import _ from "../common/utils";
import EventHandler from '../common/event';
import log from '../common/log';
import observer from '../property/observer';
import $ from '../common/selector';
import { debug } from "util";

const LOGTAG = "页面渲染";

/**
 *  作者：张传辉
 *  功能名称：页面渲染
 *  描述信息：
*/
class Compile {
    constructor(el, view, data) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
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
            if (this.isElementNode(node)) {
                this.compile(node);
            }
            else if (this.isTextNode(node)) {
                let textReg = /\{\{(.*)\}\}/;
                let htmlReg = /\{\{\{(.*)\}\}\}/;
                if (htmlReg.test(node.textContent)) {
                    let exp = htmlReg.exec(node.textContent)[1];
                    CompileOrder.exec("html", node, this.data, {
                        view: this.view,
                        exp: exp
                    });
                }
                else if (textReg.test(node.textContent)) {
                    let exp = textReg.exec(node.textContent)[1];
                    CompileOrder.exec("text", node, this.data, {
                        view: this.view,
                        exp: exp
                    });
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

        for (let attr of nodeAttrs) {
            let attrName = attr.name;
            let exp = attr.value;

            if (_.startWith(attrName, "b-")) {
                let order = attrName.substring(2);

                let compileOption = {
                    view: this.view,
                    exp: exp,
                    attName: order
                }

                if (_.startWith(order, "on:")) {
                    compileOption.attName = order.substring("on:".length);
                    CompileOrder.exec("event", node, this.data, compileOption);
                }
                else {
                    CompileOrder.exec(order, node, this.data, compileOption);
                }

                node.removeAttribute(attrName);
            }
            else if (_.startWith(attrName, ":")) {
                compileOption.attName = attrName.substring(1);
                CompileOrder.exec("attr", node, this.data, compileOption);
                node.removeAttribute(attrName);
            }
        }
    }
}

/**
 *  作者：张传辉
 *  功能名称：页面渲染指令集管理
 *  描述信息：
*/
var CompileOrder = {
    /** 指令集 */
    orders: {
        text: function (node, data, option) {
            this.bind(node, "text", data, option);
        },
        html: function (node, data, option) {
            this.bind(node, "html", data, option);
        },
        model: function (node, data, option) {
            this.bind(node, "model", data, option);

            let self = this;
            let value = this._getModelValue(data, option.exp);

            $(node).on({
                input: function (e) {
                    //{if($event.target.composing)return 
                    //el.addEventListener('compositionstart', onCompositionStart);
                    //el.addEventListener('compositionend', onCompositionEnd);
                    // Safari < 10.2 & UIWebView doesn't fire compositionend when
                    // switching focus before confirming composition choice
                    // this also fixes the issue where some browsers e.g. iOS Chrome
                    // fires "change" instead of "input" on autocomplete.
                    //el.addEventListener('change', onCompositionEnd);

                    var newValue = $(this).val();

                    if (newValue === value) return;

                    value = newValue;

                    self._setModelValue(data, option.exp, value);
                }
            });
        },
        class: function (node, data, option) {
            this.bind(node, "class", data, option);
        },
        event: function (node, data, option) {
            var eventFn = option.view[option.exp];

            if (option.attName && eventFn) {
                $(node).on({
                    [option.attName]: _.bind(eventFn, option.view)
                });
            }
        },
        attr: function (node, data, option) {
            this.bind(node, "attr", data, option);
        }
    },
    /**
     * 执行指令
     * @param orderName 指令名称 <String>
     * @param node 节点 <Element>
     * @param data 数据 <Object>
     * @param option 配置项 <Object> 
    */
    exec: function (orderName, node, data, option = {
        view: undefined,
        exp: undefined,
        attName: undefined
    }) {
        let order = this.orders[orderName];
        //TODO:缺少 exp表达式处理
        if (order) {
            order.call(this, node, data, option);
        }
        else {
            log.error(LOGTAG, `未找到${orderName}指令名`);
        }
    },
    /**
     * 绑定视图数据
     * @param node 节点 <Element>
     * @param type 更新类型 <String>
     * @param data 数据 <Any>
     * @param option 配置项 <Object> 参考exec option配置项
    */
    bind: function (node, type, data, option) {
        let updater = option.updater || this[`${type}Updater`];

        if (updater) {
            let modelValue = this._getModelValue(data, option.exp);
            updater(node, option, modelValue);

            new observer.Watcher(data, option.exp, (value, oldValue) => {
                updater(node, option, value, oldValue);
            });
        }
        else {
            log.warn(LOGTAG, `找不到指定的${type}更新器`);
        }
    },
    /**
     * 文本更新
     * @param node 节点 <Element>
     * @param option 配置项 <Object> 参考exec option配置项
     * @param value 值 <Any>
    */
    textUpdater: function (node, option, value) {
        node.textContent = _.isStrEmpty(value) ? "" : value;
    },
    /**
     * 节点DOM更新
     * @param node 节点 <Element>
     * @param option 配置项 <Object> 参考exec option配置项
     * @param value 值 <Any>
    */
    htmlUpdater: function (node, option, value) {
        node.innerHTML = _.isStrEmpty(value) ? "" : value;
    },
    modelUpdater: function (node, option, value) {
        $(node).val(value);
    },
    /**
     * 更新Class
     * @param node 节点 <Element>
     * @param option 配置项 <Object> 参考exec option配置项
     * @param value 值 <String>
     * @param oldValue 旧值 <String>
    */
    classUpdater: function (node, option, value, oldValue) {
        let className = node.className;

        className = className.replace(oldValue, "")
            .replace(/\s$/, "");

        var space = className
            && _.isStrEmpty(value) ? "" : " ";

        node.className = className + space + value;
    },
    /**
     * 更改节点属性
     * @param node 节点 <Element>
     * @param option 配置项 <Object> 参考exec option配置项
     * @param value 值 <String>
     * @param oldValue 旧值 <String>
    */
    attrUpdater: function (node, option, value) {
        node.attr(option.attName, value);
    },
    _getModelValue: function (data, exp = "") {
        let result = data;

        exp = exp.split('.');
        exp.forEach((key) => {
            result = result[key];
        });

        return result;
    },
    _setModelValue: function (data, exp = "", value) {
        let result = data;

        exp = exp.split('.');
        exp.forEach((key, i) => {
            //递归寻找最后一层属性
            if (i < exp.length - 1) {
                result = result[key];
            }
            else {
                result[key] = value;
            }
        });
    }
};

export default Compile;