import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "event",
    exec: function (option, value) {
        let eventFn = option.view[value];
        if (eventFn && option.param) {
            option.$node.on({
                [option.param]: _.bind(eventFn, option.view)
            });
        }
    }
});