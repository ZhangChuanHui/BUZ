import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "html",
    exec: function (option, nv, ov) {
        //置空
        option.node.textContent = "";
        if (option.$token.after) {
            option.$token.after.remove();
        }

        if (nv) {
            option.$token.after =
                option.$node.after($.parseHTML(nv), true);
        }
    }
})