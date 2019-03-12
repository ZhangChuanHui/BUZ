import Base from './base';
import LogHandler from '../../common/log';
import { LOGTAG } from '..';
import $ from '../../common/selector';

/**
 * 组件转换数据处理中心
 */
export let ComponentParser = {
    parsers: {},
    add: function (name, parser, group) {
        if (name) {
            this.parsers[name] = {
                parser: parser,
                group: group,
                name: name
            }
        }
        else {
            LogHandler.error(LOGTAG, '注册组件name值为空，来自：组件转换数据处理中心。');
        }
    },
    remove: function (name) {
        delete this.parsers[name];
    },
    findComponent: function (container) {
        let result = [];
        $(container).each((elem) => {
            if (elem.nodeType === 3 && elem.componentView) {
                result.push(elem.componentView);
            }
            else if (elem.childNodes && elem.childNodes.length) {
                result = result.concat(this.findComponent(elem.childNodes));
            }
        });

        return result;
    },
    findComponentByGourp: function (container, groupName) {
        let components = this.findComponent(container);
        let result = [];

        components.forEach((item) => {
            if (item.componentGroup === groupName) {
                result.push(item);
            }
        });

        return result;
    }

}


/**
 *  作者：张传辉
 *  功能名称：文本节点模板渲染处理类
 *  描述信息：
*/
export default class Handler extends Base {
    check() {
        if (this.node.nodeType !== 1) return false;

        let tagName = this.node.tagName.toLocaleLowerCase();

        this.component = (ComponentParser.parsers[tagName]
            || (this.option.view && this.option.view.components && this.option.view.components[tagName]));


        return this.component;
    }
    parser() {
        this.result.push({
            exp: this.node.tagName,
            cause: this.node,
            order: "component",
            component: this.component
        });
    }
}