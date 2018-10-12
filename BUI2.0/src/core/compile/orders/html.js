import { CompileOrder } from '../index';

CompileOrder.addOrder({
    name: "attr",
    exc: function (option, nv, ov) {
        option.node.innerHTML = _.isStrEmpty(nv) ? "" : nv;
    }
})