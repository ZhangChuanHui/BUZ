import CompileOrder from '../order';
import { compileNodes } from '../index';

function getParent(option) {
    if (option.$token.parent === undefined)
        //优先选择父级，如果父级没有则用自己作为依据（cloneNode模式），不可污染其他节点
        option.$token.parent = option.node.parentNode || option.node;
    return option.$token.parent;
}

function ExecResultFlow(parent, option) {
    if (parent.conditionElseOption) {
        CompileOrder.orderList.else.exec(
            parent.conditionElseOption);
    }
}

/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "if",
    weight: 400,
    exec: function (target, value) {
        let parentNode = getParent(target);
        let token = target.$token;
        parentNode.conditionResult = false;
        target.node.conditionResult = !!value;

        //清空监听
        this.clearWatchers(token);

        if (value) {
            if (token.after) {
                let afterTag = $(token.after);
                afterTag.before(target.$node);
                afterTag.remove();
                token.after = undefined;
                this.addWatchers(compileNodes(target.node, target));
            }

            parentNode.conditionResult = true;
        }
        else if (target.node.parentNode) {
            token.after = target.$node.after(document.createTextNode(""), true);
            target.$node.remove();
        }

        ExecResultFlow(parentNode, target);
    }
});

CompileOrder.addOrder({
    name: "else-if",
    weight: 400,
    exec: function (target, value) {
        let parentNode = getParent(target);
        let token = target.$token;
        target.node.conditionResult = !!value;

        //清空监听
        this.clearWatchers(token);

        if (!parentNode.conditionResult && value) {
            if (token.after) {
                let afterTag = $(token.after);
                afterTag.before(target.$node);
                afterTag.remove();
                token.after = undefined;
                this.addWatchers(compileNodes(target.node, target));
            }

            parentNode.conditionResult = true;
        }
        else if (target.node.parentNode) {
            token.after = target.$node.after(document.createTextNode(""), true);
            target.$node.remove();
        }

        ExecResultFlow(parentNode, target);
    }
});

CompileOrder.addOrder({
    name: "else",
    weight: 400,
    exec: function (target, value) {
        let parentNode = getParent(target);
        let token = target.$token;
        parentNode.conditionElseOption = target;
        target.node.conditionResult = !!value;

        //清空监听
        this.clearWatchers(token);

        if (!parentNode.conditionResult) {
            if (token.after) {
                let afterTag = $(token.after);
                afterTag.before(target.$node);
                afterTag.remove();
                token.after = undefined;
                this.addWatchers(compileNodes(target.node, target));
            }
        }
        else if (target.node.parentNode) {
            token.after = target.$node.after(document.createTextNode(""), true);
            target.$node.remove();
        }
    }
});