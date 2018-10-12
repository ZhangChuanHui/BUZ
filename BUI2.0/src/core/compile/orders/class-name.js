import { CompileOrder } from '../index';

CompileOrder.addOrder({
    name: "class",
    exc: function (option, nv, ov) {
        let className = option.node.className;

        className = className.replace(ov, "")
            .replace(/\s$/, "");

        let space = className
            && _.isStrEmpty(nv) ? "" : " ";

        option.node.className = className + space + nv;
    }
})