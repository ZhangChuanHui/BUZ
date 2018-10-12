import CompileOrder from '../order';

CompileOrder.addOrder({
    name: "text",
    exec: function (option, value) {
        option.node.textContent = value;
    },
    runExpress(token, refs, option) {
        var result = [];

        for (let item of token.param) {
            if (item.tag === "text") result.push(item.content);
            else {
                result.push(this.tryRun(item.content, refs, option.data));
            }
        }

        return result.join('');
    }
});
