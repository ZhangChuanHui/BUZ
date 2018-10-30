import _ from './utils';

/**
*  作者：张传辉
*  功能名称：内部事件处理机制
*  描述信息：内部非DOM事件处理机制。
        模仿DOM事件处理机制，提供常用的方法和传值方式。
*/
class EventHandler {
    constructor() {
        /**事件源*/
        this._eventDatas = {};
    }
    /**
     * 注册事件
     * @param name 事件名称 <String>
     * @param callBack 回调函数 <Function>
     *      其中callBack中传递两个参数：
     *      1.event ：{
     *            target <Any> 触发事件对象
     *            stopPropagation <Function> 终止事件传播
     *            timer <Int> 触发次数
     *        }
     *      2.param <Any> 事件传递参数
     *  注意：callBack中的stopPropagation可以终止事件传播，或者使用
     *      return false；也可以实现终止传播。
     */
    on(name, callBack) {
        this._eventDatas[name] = this._eventDatas[name] || [];

        this._eventDatas[name].push({
            isOnce: false,
            callBack: callBack
        });
    }
    /**
    * 注册事件（只触发一次）
    * @param name 事件名称 <String>
    * @param callBack 回调函数 <Function>
    */
    once(name, callBack) {
        this._eventDatas[name] = this._eventDatas[name] || [];

        this._eventDatas[name].push({
            isOnce: true,
            callBack: callBack
        });
    }
    /**
    * 卸载事件
    * @param name 事件名称 <String>
    * @param callBack 回调函数 <underfind/Function>
    *     若不传递callBack则直接卸载所有事件。
    */
    off(name, callBack) {
        if (callBack) {
            this._eventDatas[name] = _.without(this._eventDatas[name], callBack);
        }
        else {
            delete this._eventDatas[name];
        }
    }
    /**
    * 触发事件
    * @param name  事件名称 <String>
    * @param param 事件传递参数 <Any>
    */
    trigger(name, param) {
        var delegates = this._eventDatas[name];
        if (delegates) {
            var i = 0, time = 0, isBreak = false;

            while (delegates[i]) {
                var item = delegates[i];
                var result = item.callBack.call(this, {
                    target: this,
                    stopPropagation: function () {
                        isBreak = true;
                    },
                    time: time
                }, param);

                time++;

                if (item.isOnce) {
                    delegates = _.without(delegates, item);
                }
                else {
                    i++;
                }

                if (result === false || isBreak)
                    return false;
            }
        }
    }
    /**
    * 重置事件监听
    */
    clearListening() {
        this._eventDatas = [];
    }
}

export default EventHandler;