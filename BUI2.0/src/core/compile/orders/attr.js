import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "attr",
    exec: function (option, value) {
        option.$node.attr({ [option.param]: value });
    }
})