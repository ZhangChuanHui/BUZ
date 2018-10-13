import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "attr",
    exec: function (option, value) {
        option.$node.attr({ [option.param]: value });
    }
})