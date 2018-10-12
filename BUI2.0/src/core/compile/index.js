import _ from "../common/utils";
import EventHandler from '../common/event';
import log from '../common/log';
import observer from '../property/observer';
import $ from '../common/selector';
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

/**
 *  作者：张传辉
 *  功能名称：页面渲染指令集管理
 *  描述信息：
*/
var CompileOrder11 = {

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