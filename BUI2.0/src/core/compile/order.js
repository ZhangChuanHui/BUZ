import log from "../common/log";
import observer from '../property/observer';
import { LOGTAG } from './index';
import Utils from "../common/utils";
import expression from './expression';


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
                //是否跳过子集
                isSkipChildren: false,
                //是否开启指令数据
                enableOrderData: false,
                breforeExec: function (token, option) { },
                initOrderData: function (token, option) {
                    token.dataId = Utils.guid();
                    option.orderDatas[token.dataId] = {
                        datas: {},
                        token: token
                    };
                },
                clearOrderData: function (token, option) {
                    option.orderDatas[token.dataId].datas = {};
                },
                setOrderData: function (token, option, value) {
                    option.orderDatas[token.dataId].datas = value;
                },
                runExpress: function (token, option) {
                    this.tryRun(token.exp, option.data);
                },
                tryRun: function (exp, option) {
                    try {
                        let paramNames = [].concat(Object.keys(option.data));
                        let orderDataValues = [];

                        for (let tokenId in option.orderDatas) {
                            for (let key in option.orderDatas[tokenId].datas) {
                                if (paramNames.indexOf(key) === -1) {
                                    paramNames.push(key);
                                    orderDataValues.push(option.orderDatas[tokenId].datas[key]);
                                }
                            }
                        }

                        let fun = new Function(...paramNames, ` return (${exp});`);

                        let params = [];
                        for (let ref of Object.keys(option.data)) {
                            params.push(option.data[ref]);
                        }

                        for (let value of orderDataValues) {
                            params.push(value);
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
        let isSkipChildren = false;

        for (let token of tokens) {
            let order = this.orderList[token.order];

            if (order.isSkipChildren) isSkipChildren = true;

            if (node.parentNode && order) {
                token.node = node;
                token.$node = $(node);

                if (order.enableOrderData) order.initOrderData(token, option);

                //before Exec
                order.breforeExec(token, option);

                new observer.Watcher(option.data,
                    function () {
                        order.runExpress(token, option);
                    },
                    function (nv, ov) {

                        if (nv === token.oldValue) return;

                        order.exec(Object.assign({
                            //保留token把柄作为后期oder存放依据
                            token: token,
                            watch: {
                                ref: ref,
                                nv: nv,
                                ov: ov
                            }
                        }, token, option, othen), nv, token.oldValue);

                        token.oldValue = nv;

                        if (order.enableOrderData) order.clearOrderData(token, option);
                    });
            }
            else {
                log.error(LOGTAG, `未找到${token.order}指令名`);
            }
        }

        return isSkipChildren;
    }
}