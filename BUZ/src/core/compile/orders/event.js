import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "event",
    runExpress: function (token, option, scope) {
        return this.tryRun(token.exp, scope, option) || token.exp;
    },
    exec: function (option, nv, ov) {
        let token = option.$token;
        if (token.eventFun && option.param) {
            option.$node.off(option.param, token.eventFun);
        }

        let eventFn = option.view[nv];
        if (eventFn && option.param) {
            token.eventFun = _.bind(eventFn, option.view);
            option.$node.on({
                [option.param]: token.eventFun
            });
        }
    }
});