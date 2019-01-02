import EventHander from '../common/event';
import Storage from '../storage/index';
import Utils from '../common/utils';
import RequestByAjax from './requestByAjax';
import LogHandler from '../common/log';

const LOGTAG = '请求管理';

/**
 *  作者：张传辉
 *  功能名称：请求管理类
 *  描述信息：
*/
class Requester extends EventHander {
    constructor(app, config) {
        super();

        this.app = app;

        this.config = Object.assign({
            /**自定义statusMessage */
            statusDict: {},
            /**自定义获取请求触发器 {Funtion} */
            getHandler: undefined,
            /**自定义结果转换方法 {Function} */
            resultTrasnform: function (response, resolve, reject) { resolve(response); }
        }, config);

        this.handlers = [];

        //Request 缓存仓库，用于保存请求缓存
        this.storage = new Storage(app, 'BUZRequestCache');

        /**请求队列 */
        this.requestList = [];

        //注入默认触发器
        this.addHandler(RequestByAjax);

        //注册基础事件
        this._initHandler(app);

        return this;
    }
    /**
     * 添加请求触发器
     * @param {BaseRequester} handler 请求器
     */
    addHandler(handler) {
        this.handlers.push(new handler());
    }
    /**
     * 请求执行方法
     * @param {string} url 请求地址
     * @param {object} option 配置信息
     * @param {View} view 触发视图
     */
    request(url, option = {}, view) {
        //全局自定义参数转换
        let settings = Object.assign({
            url: url,
            //请求类型
            method: 'post',
            //请求数据
            data: {},
            //是否开启缓存，只有请求成功才会记录缓存数据
            cache: false,
            //缓存标识ID，若启用缓存则按照 url+cacheId作为缓存标识查询
            cacheId: '',
            //路由跳转时是否取消请求
            cancelWhenRouting: true,
            //触发视图
            view: view
        }, option);

        //获取请求触发器
        let handler = this._getHandler(settings);

        //请求触发器参数转换
        settings = handler.transformData(url, settings);

        //触发事件
        this.trigger("before", settings);

        return new Promise((resolve, reject) => {
            let cacheData = this.storage.get(`${settings.url}|${settings.cacheId}`);
            if (cacheData) {
                LogHandler.info(LOGTAG, `来自缓存：${settings.url}|${settings.cacheId}`)
                resolve(cacheData);
                //触发事件
                this.trigger("after", settings);
                return;
            }

            let process = handler.send(settings, (status, content) => {

                this.requestList = Utils.without(this.requestList, process);

                this._onRequestComplete(status, content, resolve, reject, settings);

                //触发事件
                this.trigger("after", settings);
            });

            process.settings = settings;
            this.requestList.push(process);
        });
    }
    /** 
     * 取消所有请求的回调函数,目前有两种情况
     * 1.主动调用
     * 2.页面跳转时, 只取消settings.cancelWhenRouting为true的
     */
    cancelRequests(forceCancelAll) {

        for (var i = 0; i < this.requestList.length; i++) {
            var process = this.requestList[i];
            if (process && (forceCancelAll || process.settings.cancelWhenRouting)) {
                process();
            }
        }

        if (this.requestList.length)
            log.warn("业务请求", "执行请求终止操作，共终止了" + this.requestList.length + "条未完成请求");
    }
    /**
     * 获取请求触发器（内部）
     * @param {string} url 请求地址
     * @param {Object} settings 请求参数配置
     */
    _getHandler(settings) {
        if (Utils.isFunction(this.config.getHandler)) {
            return this.config.getHandler(settings, ...this.handlers) || this.handlers[0];
        }

        return this.handlers[0];
    }
    /**注册基础事件 */
    _initHandler(app) {
        //路由跳转时清除所有未完成请求
        app.router.on('before', () => {
            this.cancelRequests(false);
        });
    }
    _onRequestComplete(status, content, resolve, reject, settings) {
        if (status === 'canceled') {
            LogHandler.info(LOGTAG, `请求：${settings.url},请求被取消。`)
            return;
        }

        if (status === 'error') {
            this._onError(status, '', content, settings, reject);
            return;
        }

        if (Utils.isFunction(this.config.resultTrasnform)) {
            this.config.resultTrasnform(content,
                (data) => {
                    resolve(data);

                    if (settings.cache) {
                        this.storage.set(settings.url + settings.cacheId, data);
                    }
                },
                (code, message) => {
                    this._onError(code, message, content, settings, reject);
                }
            )
        }
        else {
            LogHandler.error(LOGTAG, '缺少结果转换方法，无法完成后续操作。')
        }
    }
    _onError(status, message, content, settings, reject) {
        let error = {
            code: content || status,
            settings: settings,
            message: message || this.config.statusDict[content || ''] || '请求资源异常'
        }

        //触发事件
        if (this.trigger("error", error) !== false) {
            reject(error);
        }
    }
}

export default Requester;