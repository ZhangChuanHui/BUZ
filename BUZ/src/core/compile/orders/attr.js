import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "attr",
    exec: function (target, value) {
        target.$node.attr({ [target.param]: value });
    }
})