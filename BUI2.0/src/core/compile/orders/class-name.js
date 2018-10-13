import CompileOrder from '../order';

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