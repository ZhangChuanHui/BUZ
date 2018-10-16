import CompileOrder from '../order';
import LogHandler from '../../common/log';
import { LOGTAG, compileNodes } from '../index';
import Utils from '../../common/utils';

CompileOrder.addOrder({
    name: "for",
    isSkipChildren: true,
    enableOrderData: true,
    exec: function (option, nv, ov) {
        if (option.token.forContent) {
            option.token.forContent.remove();
        }
        option.token.forContent = nv;
        nv && option.forTag.after(nv);
    },
    breforeExec: function (token, option) {
        token.forTag = token.$node.after(document.createTextNode(""), true);

        token.$node.remove();
    },
    runExpress: function (token, refs, option) {
        if (token.exp.indexOf("in") === -1) {
            LogHandler.error(LOGTAG, `for指令错误，缺少in关键字`);
            return;
        }

        let params = token.exp.split(' in ');
        if (params.length !== 2) {
            LogHandler.error(LOGTAG, `for指令解析错误`);
            return;
        }

        let forParam = params[0].trim();
        let runParam = this.transformForParam(forParam);

        if (Utils.isStrEmpty(runParam.value)) {
            LogHandler.error(LOGTAG, `for指令解析错误=>${forParam}`);
            return;
        }

        let exp = params[1].trim();
        let viewData = this.tryRun(exp, refs, option) || "";

        let result = $();
        if (Utils.isArray(viewData)) {
            viewData.forEach((value, index) => {
                let orderData = {};

                orderData[runParam.value] = value;

                if (runParam.key) orderData[runParam.key] = index;
                if (runParam.index) orderData[runParam.index] = index;

                this.setOrderData(token, option, orderData);

                let newTemplete = token.node.cloneNode(true);

                compileNodes(newTemplete, option);
                result.add(newTemplete);
            });
        }
        else if (Utils.isObject(viewData)) {
            let index = 0;
            for (let key in viewData) {

                let orderData = {};

                orderData[runParam.value] = viewData[key];

                if (runParam.key) orderData[runParam.key] = key;
                if (runParam.index) orderData[runParam.index] = index;

                this.setOrderData(token, option, orderData);

                let newTemplete = token.node.cloneNode(true);

                compileNodes(newTemplete, option);
                result.add(newTemplete);

                index++;
            }
        }
        else {
            LogHandler.error(LOGTAG, 'for指令非法数据，无法解析');
        }

        return result;
    },
    transformForParam: function (forParam) {
        const MULTIPARAMREG = /\(((?:.|\n)+?)\)/;
        let result = {
            value: forParam,
            key: undefined,
            index: undefined
        };

        if (MULTIPARAMREG.test(forParam)) {
            let content = MULTIPARAMREG.exec(forParam)[1];
            let arrayParam = content.split(',');

            result.value = (arrayParam[0] || "").trim();

            result.key = arrayParam[1]
                ? arrayParam[1].trim()
                : undefined;

            result.index = arrayParam[2]
                ? arrayParam[2].trim()
                : undefined;

        }
        return result;
    }
});