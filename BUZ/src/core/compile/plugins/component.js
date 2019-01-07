import CompileOrder from '../order';
import Utils from '../../common/utils';
import LogHandler from '../../common/log';
import { LOGTAG } from '..';
/**
 *  作者：张传辉
 *  功能名称：组件核心处理
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "component",
    //权重 
    weight: -1000,
    exec: function (target, nv, ov) {
        let token = target.$token;

        let childrenView = this.initChildrenView(token.component.parser);

        if (target.view) {
            target.view.attachChild(token.after, token.componentId, new childrenView(), undefined, true);
        }
        else {
            LogHandler.error(LOGTAG, '装载组件时，未找到视图组件');
        }
    },
    breforeExec: (token, option, scope) => {
        token.componentId = token.component.name + '_' + Utils.guid();
        token.after = token.$node.after(document.createTextNode(""), true);
        token.$node.remove();
    },
    initChildrenView: (parser) => {
        return Buz.View({
            isComponent: true,
            noContainer: true
        }, parser);
    }
})