import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "show",
    exec: function (option, value) {
        value ? option.$node.addClass("hide") : option.$node.removeClass("hide");
    }
});

CompileOrder.addOrder({
    name: "hide",
    exec: function (option, value) {
        value ? option.$node.removeClass("hide") : option.$node.addClass("hide");
    }
});