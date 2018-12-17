import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/

CompileOrder.addOrder({
    name: "show",
    exec: function (option, value) {
        value ? option.$node.addClass("hide") : option.$node.removeClass("hide");
    }
});

CompileOrder.addOrder({
    name: "hide",
    exec: function (option, value) {
        value ? option.$node.removeClass("hide") : option.$node.addClass("hide");
    }
});