import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "if",
    exec: function (option, value) {
        if (value) {
           var tag =  document.createTextNode("<!---->");
        }
        else {
            option.$node.after($.parseHTML(nv), true);
        }
    }
})

