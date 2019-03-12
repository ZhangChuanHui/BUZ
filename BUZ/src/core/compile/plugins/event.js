import CompileOrder from '../order';
import LogHandler from '../../common/log';
import { LOGTAG } from '..';

const EVENTPARAM = /([^]*?)\(([^]*?)\)/;

/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addOrder({
    name: "event",
    runExpress: function (token, target, scope) {
        const inMatch = token.exp.match(EVENTPARAM);
        let exp = token.exp;

        if (inMatch) {
            token.eventParam = inMatch[2] ? this.tryRun(`[${inMatch[2]}]`, scope, target) : [];
            exp = inMatch[1];
        }

        if (exp.indexOf('(') > -1) {
            LogHandler.warn(LOGTAG, `${exp}事件处理中疑似可触发方法/计算属性，请仔细核对`);
        }
        return this.tryRun(exp, scope, target) || exp;
    },
    exec: function (target, nv, ov) {
        let token = target.$token;
        if (token.eventFun && target.param) {
            target.$node.off(target.param, token.eventFun);
        }

        let eventFn = target.view[nv];
        if (eventFn && target.param) {
            token.eventFun = function (e) {
                eventFn.call(target.view, e, ...(target.eventParam || []));
            };
            target.$node.on({
                [target.param]: token.eventFun
            });
        }
    }
});