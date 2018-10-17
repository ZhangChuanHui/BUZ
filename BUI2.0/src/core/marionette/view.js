/**
 *  作者：张传辉
 *  功能名称：视图组件基类、视图组件操作类
 *  描述信息：
 *      1.视图组件基类： 负责全局视图组件管理
 *      2.视图组件操作类：负责规范视图组件，并提供对外操作把柄
*/

import log from '../common/log';
import EventHandler from '../common/event';
import Compile from '../compile/index';
import _ from '../common/utils';
import observer from '../property/observer';
import Utils from '../common/utils';
const LOGTAG = "视图组件";

function bmSet(target, key, value) {
    if (Utils.hasOwn(target, _.toStr(key))) {
        target[key] = value;
        new observer.Observer(target[key]);
        debugger;
        notifyChange(target);
    }
    else {
        log.error(LOGTAG, `Bui.set传入Key值不在target中，请确认`);
    }
}

function bmDelete(target, key) {

}

function notifyChange(target) {
    target.__ob__
        && target.__ob__.dep
        && target.__ob__.dep.notify();
}

/**
 *  作者：张传辉
 *  功能名称：视图组件基类，用于Application中集体控制
 *  描述信息：
*/
class BaseView extends EventHandler {
    constructor(app) {
        super();
        this.app = app;
    }
    /**
     * 初始化视图组件
     * @param selector 选择器 <jQuery Selector>
     * @param view 视图组件 <View类>
     * @param pageParam 视图参数 <Any>
    */
    async initView(selector, view, pageParam) {
        this.trigger("before:initView", {
            selector: selector,
            view: view
        });

        view.$container = selector;
        view.pageParam = pageParam;
        view.data = view.data || {};

        //克隆一个基础版本，用于视图组件独立reload
        view.__baseView = Object.assign({}, view);

        view._viewId = _.guid();
        view._app = this.app;

        view.$el = view.noTemplete ? view.$container
            : this.renderTemplete(view);

        if (_.isFunction(view.onRender)) {
            await view.onRender.call(view);
        }

        if (view.noTemplete === false) {
            selector.empty();
            selector.append(view.$el);
        }

        if (view.noCompile != true) {
            new observer.Observer(view.data);
            new Compile(view.$el.nodeList[0], view, view.data);
        }

        if (_.isFunction(view.onShow)) {
            await view.onShow();
        }

        this.trigger("after:initView", {
            selector: selector,
            view: view
        });
    }
    /**
     * 渲染模板操作，可在外部通过原型链重写
     * @param view 视图组件 <View类>
    */
    renderTemplete(view) {
        return $(`
            <div class="app-page ${view.pageClassName}">
            ${view.templete}
            </div>`);
    }
    /**
     * 初始化子视图
     * @param parentView 父视图组件 <View类>
     * @param selector 选择器 <jQuerySelector>
     * @param name 子视图名称 <String>
     * @param View 子视图组件 <View类>
     * @param pageParam 视图参数 <Any>
    */
    initChildrenView(parentView, selector, name, view, pageParam) {
        view.parent = parentView;
        view.__viewName = name;

        this.initView(selector, view, pageParam);
        parentView.childrens[name] = view;

        selector.attr("data-view-name", name);
        log.info(LOGTAG, `${name}子视图装载成功`);
    }
    /**
     * 卸载视图组件
     * @param view 视图组件 <View类>
    */
    teardown(view) {
        this.trigger("before:teardown", view);
        view.trigger("before:teardown");

        view.$el.remove();
        //移除观察者模式监听
        this.app.region.removeGlobalEventByViewId(view._viewId);

        let self = this;
        view.childrens.forEach(item => {
            self.teardown(item);
        });

        view.childrens = [];

        if (_.isFunction(view.onTeardown)) {
            view.onTeardown();
        }

        this.trigger("after:teardown", view);
        view.trigger("after:teardown");

        view.clearListening();
    }
}

/**
 *  作者：张传辉
 *  功能名称：视图调用把柄
 *  描述信息：
*/
function ViewHandler(option, ...args) {
    if (args && args.length) {
        args.forEach(item => {
            option = Object.assign(option, item);
        });
    }

    return (pageParam) => {
        return new View(option, pageParam);
    }
}

class View {
    constructor(option, pageParam) {
        /**页面样式名称，配置后追加app-page之后*/
        this.pageClassName = "";
        /**页面模板 */
        this.templete = "";
        /**是否不适用模板， 默认为false*/
        this.noTemplete = false;
        /**
         * 页面渲染时触发，在此方法内可以做DOM操作避免DOM挂载造成的内存占用问题
         * 注意此方法内不允许使用异步，异步请放入onShow中执行
         */
        this.onRender = undefined;
        /**页面呈现后触发*/
        this.onShow = undefined;
        /**当页面卸载时触发*/
        this.onTeardown = undefined;
        /**子视图集合*/
        this.childrens = [];

        //合并视图配置信息
        Object.assign(this, option);
        /**视图参数 */
        this.pageParam = pageParam;
    }
    /**
     * 主动监听属性变化
     * @param path 属性地址
     * @param callBack 回调处理事件
    */
    $watch(path, callBack) {
        new observer.Watcher(this.data, path, Utils.bind(callBack, this));
    }
    /**
     * 注册全局观察者模式
     * @param eventName 事件名称 <String>
     * @param callBack 回调事件 <Function>
     * @param isOnce 是否只执行一次 <Boolean>
    */
    onGlobal(eventName, callBack, isOnce) {
        this._app.region.registerGlobalEvent(this, eventName, callBack, !!isOnce);
    }
    /**
     * 触发全局观察者事件
     * @param eventName 事件名称 <String>
     * @param params 事件参数 <Any>
    */
    triggerGlobal(eventName, params) {
        this._app.region.triggerGlobalEvent(eventName, params, this);
    }
    /**
     * 选择器，作用在于只在this.$el中查询
     * @param selector jQuery Selector <String>
    */
    $(selector) {
        return this.$el.find(selector);
    }
    /**
     * 视图重载
     * 返回baseView，方便对其新功能操作交替转换
     */
    reload() {
        log.info(LOGTAG, "视图组件开始执行reload方法");

        this._app.view.teardown(this);

        var baseView = this.__baseView;

        //若为子视图则执行父视图的attachChild
        if (baseView.parent) {
            baseView.parent.attachChild(baseView.$container,
                baseView.__viewName, baseView, baseView.pageParam);
        }
        else {
            this._app.baseView.initView(baseView.$container, baseView.pageParam);
        }

        //返回baseView，方便对其新功能操作交替转换
        return baseView;
    }
    /**
     * 添加子视图
     * @param selector 选择器 <jQuerySelector,String>
     * @param name 子视图名称 <String>
     * @param view 视图组件 <View类>
     * @param pageParam 视图参数 <Any>
    */
    attachChild(selector, name, view, pageParam) {
        if (this.childrens[name]) {
            this.teardownChild(name);
            log.info(LOGTAG, `${name}:完成子视图卸载`);
        }

        selector = _.$(selector);

        if (selector.length === 0) {
            log.error(LOGTAG, `${name}:子视图加载失败，选择器为空`);
            return;
        }

        if (typeof view === "string") {
            let self = this;

            import('~/' + view)
                .then(ViewHandler => {
                    //判断选择符是否仍挂载DOM中
                    if (selector.parent().length) {
                        self._app.view.initChildrenView(
                            self, selector, name, new ViewHandler(), pageParam);
                    }
                    else {
                        log.warn(LOGTAG, `${name}: 子视图元素被卸载，终止异步加载子视图`);
                    }
                })
                .catch(e => {
                    log.error(LOGTAG, `子视图脚本加载失败`, e);
                });
        }
        else {
            this._app.view.initChildrenView(this, selector, name, view, pageParam);
        }
    }
    /**
     * 卸载子视图
     * @param name 子视图名称
    */
    teardownChild(name) {
        var children = this.childrens[name];
        if (children) {
            this._app.view.teardown(children);
            this.childrens = _.without(this.childrens, children);
        }
    }
}

export {
    View,
    BaseView,
    ViewHandler,
    bmSet,
    bmDelete,
    notifyChange
}