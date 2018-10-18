import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "event",
    runExpress: function (token, option, scope) {
        return this.tryRun(token.exp, scope) || token.exp;
    },
    exec: function (option, nv, ov) {
        if (option.token.eventFun && option.param) {
            option.$node.off(option.param, option.token.eventFun);
        }

        let eventFn = option.view[nv];
        if (eventFn && option.param) {
            option.token.eventFun = _.bind(eventFn, option.view);
            option.$node.on({
                [option.param]: option.token.eventFun
            });
        }
    }
});