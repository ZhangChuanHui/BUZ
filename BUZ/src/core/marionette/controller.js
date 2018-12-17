/**
 *  作者：张传辉
 *  功能名称：控制器管理
 *  描述信息：此脚本包含两个返回值
 *    1.控制器基类： 用于Application初始化，并操作全局过滤器和事件
 *    2.控制器操作类： 用于规范Controller（router.js）数据规范。
*/
import log from '../common/log';
import EventHandler from '../common/event';
import Utils from '../common/utils';

const LOGTAG = "控制管理";

/**
 *  作者：张传辉
 *  功能名称：控制器基类，挂载Application中初始化。
 *  描述信息：在控制器基类中可实现全局过来等操作。
*/
class BaseController extends EventHandler {
    /**
     * 控制器匹配程序
     * @param handler 参考defaultController <Object>
     * @param fragment 参考router中的碎片 <Object>
    */
    match(handler, fragment) {
        //对外输出克隆后的fragment防止篡改碎片信息
        let _fragment = Object.assign({}, fragment);

        if (this._beforeMatch(handler, _fragment) === false) {
            this._afterMatch(handler, _fragment, true);
            return;
        }

        var action = handler.actions[_fragment.params.action || ""];

        if (action) {
            var actionFunc = this._getAction(handler.actions, action);

            if (actionFunc) {
                log.info(LOGTAG, `匹配成功，执行action方法${action}`);

                actionFunc.apply(handler, _fragment.params);
                this._afterMatch(handler, _fragment);
            }
            else {
                log.error(LOGTAG, "控制器匹配失败，为找到Function类型的执行程序");
                this._afterMatch(handler, _fragment, true);
            }
        }
        else {
            log.error(LOGTAG, `没有找到action：${_fragment.params.action || ""}`);
            this._afterMatch(handler, _fragment, true);
        }

    }
    //前置匹配事件
    _beforeMatch(handler, fragment) {
        return this.trigger("before:match", {
            fragment: fragment,
            handler: handler
        });
    }
    //后置匹配事件
    _afterMatch(handler, fragment, isBreak) {
        return this.trigger("after:match", {
            fragment: fragment,
            handler: handler,
            /**是否是被终止*/
            isBreak: isBreak
        });
    }
    //获取actionn
    _getAction(handler, action) {
        let result;

        switch (typeof action) {
            case "function":
                result = action;
                break;
            case "string":
                result = handler[action];
                break;
            default: break;
        }

        //只可返回function，过滤其他类型
        if (Utils.isFunction(result)) {
            return result;
        }
    }
}


/**
 *  作者：张传辉 
 *  功能名称：控制器操作类，挂载Buz中，用于各路由返回统一的Controller格式数据。
 *  @param handler Controller配置信息 <Object>
       {

            actions: {}
       }
*/
function Controller(handler) {
    return Object.assign({
        actions: {}
    }, handler);
}

export {
    Controller,
    BaseController
}