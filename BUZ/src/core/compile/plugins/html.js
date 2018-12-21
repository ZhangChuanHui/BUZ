import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "html",
    exec: function (target, nv, ov) {
        //置空
        target.node.textContent = "";
        if (target.$token.after) {
            target.$token.after.remove();
        }

        if (nv) {
            target.$token.after =
                target.$node.after($.parseHTML(nv), true);
        }
    }
})