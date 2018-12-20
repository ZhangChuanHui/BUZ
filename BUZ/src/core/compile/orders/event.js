import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "event",
    runExpress: function (token, target, scope) {
        return this.tryRun(token.exp, scope, target) || token.exp;
    },
    exec: function (target, nv, ov) {
        let token = target.$token;
        if (token.eventFun && target.param) {
            target.$node.off(target.param, token.eventFun);
        }

        let eventFn = target.view[nv];
        if (eventFn && target.param) {
            token.eventFun = _.bind(eventFn, target.view);
            target.$node.on({
                [target.param]: token.eventFun
            });
        }
    }
});