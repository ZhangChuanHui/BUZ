import { CompileOrder } from '../index';

CompileOrder.addOrder({
    name: "attr",
    exc: function (option, nv, ov) {
        option.$node.attr(option.param, nv);
    }
})