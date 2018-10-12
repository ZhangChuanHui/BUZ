import log from "../common/log";
import observer from '../property/observer';

const LOGTAG = "页面渲染";

/**
 *  作者：张传辉
 *  功能名称：指令处理
 *  描述信息：
*/
export default {
    orderList: {},
    addOrder: function (param = {
        name: undefined,
        exec: undefined
    }) {
        param
            && param.name
            && param.exec
            && (this.orderList[param.name] = Object.assign({
                runExpress: function (token, refs, option) {
                    return this.tryRun(token.exp, refs, option.data);
                },
                tryRun: function (exp, refs, data) {
                    try {
                        let fun = new Function(...refs, ` return (${exp});`);

                        let params = [];
                        for (let ref of refs) {
                            params.push(data[ref]);
                        }

                        return fun(...params);
                    }
                    catch (ex) { return exp; }
                }
            }, param));
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
            let order = this.orderList[token.order];


            if (order) {
                let refs = this.checkRef(token, option.data);
                // transform express
                let value = order.runExpress(token, refs, option);

                let _exec = (nv, othen, ov) => {
                    order.exec(Object.assign({
                        node: node,
                        $node: $(node)
                    }, token, option, othen), nv);
                }

                _exec(value);

                refs.forEach((ref) => {
                    new observer.Watcher(option.data, ref, (nv, ov) => {
                        value = order.runExpress(token, refs, option);

                        _exec(value, {
                            watch: {
                                ref: ref,
                                nv: nv,
                                ov: ov
                            },
                        }, ov);
                    });
                });
            }
            else {
                log.error(LOGTAG, `未找到${token.order}指令名`);
            }
        }
    },
    checkRef: function (token, data) {
        if (token.exp in data) {
            return [token.exp];
        }

        var refs = [];
        for (let pro of Object.keys(data)) {
            new RegExp(pro, "g").test(token.exp)
                && refs.push(pro);
        }

        return refs;
    }
}