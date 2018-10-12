import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "html",
    exec: function (option,value) {
        option.node.innerHTML = _.isStrEmpty(value) ? "" : value;
    }
})