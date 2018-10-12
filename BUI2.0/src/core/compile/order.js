export default {
    orderList: {},
    addOrder: function (param = {
        name: undefined,
        exc: undefined
    }) {
        param
            && param.name
            && param.exc
            && (this.orderList[param.name] = param.exc);
    },
    /**
     * 执行指令
     * @param node 节点 <Element>
     * @param tokens 特征标记集 <Object> 
     * @param option 执行配置信息 <Object>
    */
    exec: function (node, tokens, option = {
        view: undefined,
        data: undefined,
        refNode: undefined
    }) {
        for (let token of tokens) {
            debugger;
        }
    }
}