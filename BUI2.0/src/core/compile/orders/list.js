import CompileOrder from '../order';
import LogHandler from '../../common/log';
import { LOGTAG, compileNodes } from '../index';
import Utils from '../../common/utils';
import { defineReactive } from '../../property/observer';

const FORRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
const FORITERATORRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const STRIPPARENTSRE = /^\(|\)$/g;

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
    runExpress: function (token, option, scope) {
        const inMatch = token.exp.match(FORRE);
        if (!inMatch) {
            LogHandler.error(LOGTAG, `for指令错误，缺少in关键字`);
            return;
        }

        let runParam = this.transformForParam(inMatch[1].trim());
        let viewData = this.tryRun(inMatch[2].trim(), scope) || "";

        let result = $();
        let index = 0; 
        for (let key in viewData) {
            let value = viewData[key];
            let orderData = {};
            let newTemplete = token.node.cloneNode(true);
            let $scope = Object.create(scope);

            $scope.$parentScope = scope;

            defineReactive($scope, runParam.tagName , value);

            if (runParam.key) defineReactive($scope, runParam.key, key); 
            if (runParam.index) defineReactive($scope, runParam.index, index);  

            compileNodes(newTemplete, option, $scope);
           
            result.add(newTemplete);

            index++;
        }

        return result;
    },
    transformForParam: function (forParam) {

        let result = {
            tagName: forParam,
            key: undefined,
            index: undefined
        };

        const alias = forParam.replace(STRIPPARENTSRE, '');
        const iteratorMatch = alias.match(FORITERATORRE);
        if (iteratorMatch) {
            result.tagName = alias.replace(FORITERATORRE, '')
            result.key = iteratorMatch[1].trim()
            if (iteratorMatch[2]) {
                result.index = iteratorMatch[2].trim()
            }
        } else {
            result.tagName = alias
        }

        return result;
    }
});