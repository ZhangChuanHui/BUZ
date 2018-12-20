import CompileOrder from '../order';

/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "text",
    exec: function (option, value) {
        option.node.textContent = value;
    },
    runExpress(token, option, scope) {
        var result = [];

        for (let item of token.param) {
            if (item.tag === "text") result.push(item.content);
            else {
                result.push(this.tryRun(item.content, scope, option));
            }
        }

        return result.join('');
    }
});
