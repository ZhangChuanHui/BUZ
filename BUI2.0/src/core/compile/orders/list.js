import CompileOrder from '../order';
import LogHandler from '../../common/log';
import { LOGTAG, compileNodes } from '../index';
import Utils from '../../common/utils';
import { defineReactive } from '../../observer';

const FORRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
const FORITERATORRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const STRIPPARENTSRE = /^\(|\)$/g;

CompileOrder.addOrder({
    name: "for",
    isSkipChildren: true,
    weight: 200,
    exec: function (option, nv, ov) {
        var token = option.$token;

        if (token.forContent) {
            token.forContent.remove();
        }

        token.forContent = nv;

        //清空监听
        this.clearWatchers(token);

        if (nv) {
            option.forTag.after(nv);

            nv.each((node) => {
                let $scope = node.forScope;
                this.addWatchers(compileNodes(node, option.$option, $scope));
            });
        }
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

        token.forCloneNode =
            token.forCloneNode || token.node.cloneNode(true);

        this.forDatas(viewData, function (key, index, value) {
            //再次clone防止污染
            let newTemplete = token.forCloneNode.cloneNode(true);
            let $scope = Object.create(scope);

            $scope.$parentScope = scope;

            defineReactive($scope, runParam.tagName, value);

            if (runParam.key) defineReactive($scope, runParam.key, key);
            if (runParam.index) defineReactive($scope, runParam.index, index);

            newTemplete.forScope = $scope;
            result.add(newTemplete);
        });

        return result;
    },
    forDatas: function (datas, callBack) {
        if (Utils.isObject) {
            let index = 0;
            for (let key in datas) {
                callBack(key, index, datas[key]);
                index++;
            }
        }
        else if (typeof datas === "string") {
            for (let i = 0; i < datas.length; i++) {
                callBack(i, i, datas.charAt[i]);
            }
        }
        else if (typeof datas === "number") {
            for (let i = 0; i < datas; i++) {
                callBack(i, i, i);
            }
        }
        else {
            LogHandler.warn(LOGTAG, "for循环未识别此类型数据");
        }

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