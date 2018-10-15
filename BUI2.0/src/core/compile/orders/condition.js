import CompileOrder from '../order';

function getParent(option) {
    if (option.token.parent === undefined)
        option.token.parent = option.node.parentNode;
    return option.token.parent;
}

function ExecResultFlow(parent, option) {
    if (parent.conditionElseOption) {
        CompileOrder.orderList.else.exec(
            parent.conditionElseOption);
    }
}

CompileOrder.addOrder({
    name: "if",
    exec: function (option, value) {
        let parentNode = getParent(option);
        parentNode.conditionResult = false;

        if (value) {
            if (option.token.after) {
                let afterTag = $(option.token.after);
                afterTag.before(option.$node);
                afterTag.remove();
                option.token.after = undefined;
            }
            parentNode.conditionResult = true;
        }
        else if (option.node.parentNode) {
            option.token.after = option.$node.after(document.createTextNode(""), true);
            option.$node.remove();
        }

        ExecResultFlow(parentNode, option);
    }
});

CompileOrder.addOrder({
    name: "else-if",
    exec: function (option, value) {
        let parentNode = getParent(option);

        if (!parentNode.conditionResult && value) {
            if (option.token.after) {
                let afterTag = $(option.token.after);
                afterTag.before(option.$node);
                afterTag.remove();
                option.token.after = undefined;
            }
            parentNode.conditionResult = true;
        }
        else if (option.node.parentNode) {
            option.token.after = option.$node.after(document.createTextNode(""), true);
            option.$node.remove();
        }

        ExecResultFlow(parentNode, option);
    }
});

CompileOrder.addOrder({
    name: "else",
    exec: function (option, value) {
        let parentNode = getParent(option);
        parentNode.conditionElseOption = option;

        if (!parentNode.conditionResult) {
            if (option.token.after) {
                let afterTag = $(option.token.after);
                afterTag.before(option.$node);
                afterTag.remove();
                option.token.after = undefined;
            }
        }
        else if (option.node.parentNode) {
            option.token.after = option.$node.after(document.createTextNode(""), true);
            option.$node.remove();
        }
    }
});