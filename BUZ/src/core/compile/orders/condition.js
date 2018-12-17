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
    weight: 100,
    exec: function (option, value) {
        let parentNode = getParent(option);
        let token = option.$token;
        parentNode.conditionResult = false;
        option.node.conditionResult = !!value;

        //清空监听
        this.clearWatchers(token);

        if (value) {
            if (token.after) {
                let afterTag = $(token.after);
                afterTag.before(option.$node);
                afterTag.remove();
                token.after = undefined;
                this.addWatchers(compileNodes(option.node, option));
            }

            parentNode.conditionResult = true;
        }
        else if (option.node.parentNode) {
            token.after = option.$node.after(document.createTextNode(""), true);
            option.$node.remove();
        }

        ExecResultFlow(parentNode, option);
    }
});

CompileOrder.addOrder({
    name: "else-if",
    weight: 100,
    exec: function (option, value) {
        let parentNode = getParent(option);
        let token = option.$token;
        option.node.conditionResult = !!value;

        //清空监听
        this.clearWatchers(token);

        if (!parentNode.conditionResult && value) {
            if (token.after) {
                let afterTag = $(token.after);
                afterTag.before(option.$node);
                afterTag.remove();
                token.after = undefined;
                this.addWatchers(compileNodes(option.node, option));
            }

            parentNode.conditionResult = true;
        }
        else if (option.node.parentNode) {
            token.after = option.$node.after(document.createTextNode(""), true);
            option.$node.remove();
        }

        ExecResultFlow(parentNode, option);
    }
});

CompileOrder.addOrder({
    name: "else",
    weight: 100,
    exec: function (option, value) {
        let parentNode = getParent(option);
        let token = option.$token;
        parentNode.conditionElseOption = option;
        option.node.conditionResult = !!value;

        //清空监听
        this.clearWatchers(token);

        if (!parentNode.conditionResult) {
            if (token.after) {
                let afterTag = $(token.after);
                afterTag.before(option.$node);
                afterTag.remove();
                token.after = undefined;
                this.addWatchers(compileNodes(option.node, option));
            }
        }
        else if (option.node.parentNode) {
            token.after = option.$node.after(document.createTextNode(""), true);
            option.$node.remove();
        }
    }
});