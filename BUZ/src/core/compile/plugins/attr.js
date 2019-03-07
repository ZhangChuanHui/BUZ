import CompileOrder from '../order';
import Utils from '../../common/utils';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "attr",
    exec: function (target, value) {
        target.$node.attr({
            [target.param]:
                typeof value === "string" ? value : ""
        });
    },
    runExpress: function (token, option, scope) {
        let value = this.tryRun(token.exp, scope, option);

        //在组件扩展时，可能会传入视图内的方法参数
        if (value === undefined && Utils.isFunction(option.view[token.exp])) {
            value = option.view[token.exp];
        }
        return value;
    },
})