import { CompileOrder } from '../index';

CompileOrder.addOrder({
    name: "event",
    exc: function (option, nv, ov) {
        let oldEvent = ov && option.view[ov];

        if (oldEvent && option.param) {
            option.$node.off(option.param, oldEvent);
        }

        let eventFn = option.view[option.exp];
        if (eventFn && option.param) {
            option.$node.on({
                [option.param]: _.bind(eventFn, option.view)
            });
        }
    }
});