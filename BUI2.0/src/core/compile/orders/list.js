import CompileOrder from '../order';
import LogHandler from '../../common/log';
import { LOGTAG, compileNodes } from '../index';
import Utils from '../../common/utils';

CompileOrder.addOrder({
    name: "for",
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

        //todo:for时终止其他token
        token.forId = Utils.guid();
        option.orderDatas[token.forId] = {
            datas: {},
            token: token
        }
    },
    runExpress: function (token, refs, option) {
        if (token.exp.indexOf("in") === -1) {
            LogHandler.error(LOGTAG, `for指令错误，缺少in关键字`);
            return;
        }

        let params = token.exp.split('in');
        if (params.length !== 2) {
            LogHandler.error(LOGTAG, `for指令解析错误`);
            return;
        }

        let forParam = params[0].trim();
        let exp = params[1].trim();
        let viewData = this.tryRun(exp, refs, option) || "";

        let result = $();
        if (Utils.isArray(viewData)) {
            viewData.forEach((value, index) => {
                option.orderDatas[token.forId].datas[forParam] = value;
                option.orderDatas[token.forId].datas.index = index;

                let newTemplete = token.node.cloneNode(true);

                compileNodes(newTemplete, option);
                result.add(newTemplete);
            });
        }


        return result;


    }
});