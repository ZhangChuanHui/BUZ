import _ from "../common/utils";
import EventHandler from '../common/event';
import log from '../common/log';
import observer from '../property/observer';
import $ from '../common/selector';
import parser from './parser/index';
import orders from './orders/index';

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
    }
};

export default Compile;

export var  CompileOrder = {
    orderList: {},
    addOrder: function (orderName, exec) {
        this.orderList[orderName] = exec;
    }
}