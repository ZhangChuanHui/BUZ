import Base from './base';
import LogHandler from '../../common/log';
import { LOGTAG } from '..';

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