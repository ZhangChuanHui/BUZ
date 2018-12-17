import CompileOrder from '../order';
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "class",
    exec: function (option, nv, ov) {
        let className = option.node.className;

        className = className.replace(ov, "")
            .replace(/\s$/, "");

        let space = className
            && _.isStrEmpty(nv) ? "" : " ";

        option.node.className = className + space + nv;
    }
})