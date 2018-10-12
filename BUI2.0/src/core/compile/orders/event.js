import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "event",
    exc: function (option, nv, ov) {
        let eventFn = option.view[option.exp];
        if (eventFn && option.param) {
            option.$node.on({
                [option.param]: _.bind(eventFn, option.view)
            });
        }
    }
});