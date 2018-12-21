import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/

CompileOrder.addOrder({
    name: "show",
    exec: function (target, value) {
        value ? target.$node.addClass("hide") : target.$node.removeClass("hide");
    }
});

CompileOrder.addOrder({
    name: "hide",
    exec: function (target, value) {
        value ? target.$node.removeClass("hide") : target.$node.addClass("hide");
    }
});