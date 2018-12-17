import log from '../common/log';
import EventHandler from '../common/event';
import Utils from '../common/utils';

const LOGTAG = "区域管理";

/**
 *  作者：张传辉
 *  功能名称：页面区域管理 **内部**
 *  描述信息：
 *      内置全局观察者模式，提供注册和触发，不提供卸载（卸载不符合全局观察者理念）。
 *      主要功能：提供区域的注册、销毁及页面区域的视图装载
*/
class RegionItem extends EventHandler {
    /**
     * 构造函数
     * @param region 区域参考Region类 <Class>
     * @param name 区域名称 <String>
     * @param selector 区域选择器 <jQuery Selector>
    */
    constructor(region, name, selector) {
        super();
        /**区域操作把柄 */
        this.region = region;
        /**Application操作把柄 */
        this.app = region.app;
        /**区域容器 */
        this.selector = selector;
        /**区域名称 */
        this.name = name;
        /**区域内装载的视图组件 */
        this.view = undefined;
        /**生成唯一标识，作为延迟矫正依据 */
        this._tempId = undefined;
    }
    /**
     * 装载视图
     * @param view 视图组件
     * @param viewData 视图数据
    */
    show(view, viewData) {
        //若当前区域装载视图，先执行视图卸载
        if (this.view) {
            this.app.view.teardown(this.view);
            log.info(LOGTAG, `${this.name}：区域视图卸载完毕`);
        }

        log.info(LOGTAG, `${this.name}：区域准备装载`);

        this._beforeInit({
            view: view,
            viewData: viewData
        });

        this._tempId = Utils.guid();

        if (typeof view === "string") {
            let self = this;

            (function (viewPath, tempId) {
                import('~/' + viewPath)
                    .then(viewHandler => {
                        if (self && self._tempId === tempId) {
                            view = viewHandler.default.call(viewHandler.default);

                            self._afterInit(view, viewData);
                        }
                        else {
                            self._breakInit();
                        }
                    })
                    .catch(e => {
                        log.error(LOGTAG, `视图文件请求失败`, e);
                        self._breakInit();
                    });
            })(view, this._tempId);
        }
        else {
            this._afterInit(view, viewData);
        }
    }
    /**
     * 卸载当前区域
    */
    teardown() {
        this.clearListening();

        if (this.view) {
            this.view._teardown();
            this.view = undefined;
        }

        log.info(LOGTAG, `${this.name}：区域已完成卸载`);
    }
    //初始化之前
    _beforeInit(params) {
        this.region.trigger("before:init", params);
        this.trigger("before:init", params);
    }
    //初始化之后
    _afterInit(view, viewData) {
        if (view) {
            this.view = view;
            this.app.view.initView(this.selector, this.view, viewData);
        }

        this.region.trigger("after:init", view);
        this.trigger("after:init", view);
        log.info(LOGTAG, `${this.name}：区域已装载完毕`);
    }
    //初始化中断
    _breakInit() {
        log.warn(LOGTAG, `${this ? this.name : '未知'}：区域已卸载或已装载其他组件，取消本次装载`);

        this.region.trigger("break:init");
        this.trigger("break:init");
    }
}

/**
 *  作者：张传辉
 *  功能名称：页面区域管理类
 *  描述信息：
*/
class Region extends EventHandler {
    constructor(app) {
        super();
        /**Application 操作把柄 */
        this.app = app;
        /**当前所有在运行中的区域*/
        this.regions = this.app.regions = {};
        /**全局观察者数据源，不予event合并，独立管理 */
        this.listener = {};
        /**挂载initRegion方法到app，方便外部调用*/
        this.app.initRegions = Utils.bind(this.initRegions, this);
    }
    /**
     * 初始化页面视图区域，通常只在Layout中进行设置
     * @param templete HTML模板 <String>
     * @param selectors 区域规划方案 详见Layout布局方案 <Object>
    */
    initRegions(templete, selectors = {}) {
        this.app.option.containerSelector.html(templete);

        this.trigger("before:initRegions");

        for (let name in selectors) {
            this.regions[name] = new RegionItem(this, name, $(selectors[name]));
        }

        this.app.regions = this.regions;
        this.trigger("after:initRegions");
    }
    /**
     * 卸载所有区域
    */
    teardownAll() {
        log.info(LOGTAG, "准备卸载所有页面区域");
        this.trigger("before:teardownAll");

        for (let name in this.regions) {
            let region = this.regions[name];

            if (region && region.teardown) {
                region.teardown();
                log.info(LOGTAG, `${region.name}：区域已完成卸载。`);
            }
        }

        this.app.option.containerSelector.empty();

        this.regions = this.app.regions = {};
        this.listener = {};

        this.trigger("after:teardownAll");
    }
    /**
     * 注册全局观察者，不对外使用，由view触发
     * @param view 视图脚本 <Object> 参考View类
     * @param eventName 事件名称 <String>
     * @param callBack 事件处理方法 <Function>
     * @param isOnce 是否只执行一次 <Boolean>
    */
    registerGlobalEvent(view, eventName, callBack, isOnce) {
        if (Utils.isStrEmpty(view._viewId)
            || Utils.isStrEmpty(eventName)
            || !callBack) {
            log.error(LOGTAG, "注册全局观察者失败，存在不完整的配置参数");
            return;
        }

        this.listener[view._viewId] = this.listener[view._viewId] || {
            events: {},
            view: view
        };

        this.listener[view._viewId].events[eventName] =
            this.listener[view._viewId].events[eventName] || [];

        this.listener[view._viewId].events[eventName].push({
            isOnce: !!isOnce,
            callBack: callBack
        });
    }
    /**
     * 触发全局观察者事件，通常由view触发，也可手动触发
     * @param eventName 事件名称 <String>
     * @param params 事件参数 <Any>
     * @param fromView 执行事件来源视图 <Object> 参考View类
    */
    triggerGlobalEvent(eventName, params, fromView) {
        let existEvent = false,
            time = 0,
            isBreak = false;

        for (var viewId in this.listener) {
            let i = 0,
                delegates = this.listener[viewId].events[eventName] || [],
                view = this.listener[viewId].view;

            while (delegates[i]) {
                existEvent = true;
                let item = delegates[i];

                var result = item.callBack.call(view, {
                    target: fromView,
                    stopPropagation: () => {
                        isBreak = true;
                    },
                    time: time++
                }, params);

                if (item.isOnce) {
                    delegates = Utils.without(delegates, item);
                }
                else {
                    i++;
                }

                if (isBreak || result === false) return false;
            }
        }
    }
    /**
     * 按viewId移除全局观察者模式
     * @param viewId 视图ID <String>
    */
    removeGlobalEventByViewId(viewId) {
        delete this.listener[viewId];
    }
}

export default Region;