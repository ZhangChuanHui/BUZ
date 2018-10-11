import log from '../common/log';
import EventHandler from '../common/event';
import _ from '../common/utils';
import { error, debug } from 'util';

const LOGTAG = "路由管理";

/**默认路由映射*/
let defaultRouterMap = {
    /**路由规则*/
    role: "",
    /**执行规则*/
    exec: undefined,
    /**地址*/
    path: {}
}

/**
*  作者：张传辉
*  功能名称：路由管理类
*  描述信息：
*      1.此类负责监听和触发hash跳转
*      2.routerMaps 是整个应用池的跳转映射处理机制，按数组的先后顺序进行匹配，
*          匹配成功后进入处理方法，必须包含area区域信息。
*      3.{area}、{controller}、{action}必须被指定
*      4.地址碎片中必须包含area区域信息
*/
class Router extends EventHandler {
    constructor(application) {
        super();
        //绑定app
        this.app = application;
        /**区域配置文件*/
        this.areaConfig = {};
        /**当前路由碎片*/
        this.fragment = {};
        /**当前路由碎片地址*/
        this.fragmentUrl = {};
        /**路由映射处理表，只读，禁止直接操作*/
        this.routerMaps = [];
        //触发主逻辑
        this._main();
        //写入默认映射
        this.addRouterMap({
            role: "{area}/{controller}/{action}"
        });

        return this;
    }
    /**
     * 添加路由映射处理方法
     * @param map 参考defaultRouterMap <Object>
    */
    addRouterMap(map) {
        map = Object.assign({}, defaultRouterMap, map);
        if (map.role) {
            this.routerMaps = _.without(this.routerMaps, (item) => {
                return item.role === map.role;
            });

            this.routerMaps.splice(0, 0, map);
        }
        else {
            log.error(LOGTAG, "无效的路由映射关系，缺少role信息");
        }
    }
    /**
     * 移除路由映射处理方法
     * @param roleName 参考defaultRouterMap.role <String>
    */
    removeRouterMap(roleName) {
        this.routerMaps = _.without(this.routerMaps, (item) => {
            return item.role === roleName;
        });
    }
    /**
     * 初始化方法，注册监听事件，内部方法
    */
    _main() {
        let self = this;

        //监听onHashChange
        window.onhashchange = () => {
            self.hasChange(location.hash);
        }

        //实现点击相同地址不刷新问题。
        $(document).on({
            "click": (e) => {
                let href = $(this).attr("href");

                if (href === self.fragmentUrl) {
                    e.preventDefault();
                    self.hasChange(self.fragmentUrl);
                }
                return false;
            }
        }, function (target) {
            return target.attr("href").indexOf("#") === 0;
        });

        //监听路由重载
        this.on("reload", (event) => {
            self.hasChange(self.fragmentUrl);
        });
    }
    /**
     * hashChange方法，入口方法
     * @param hash hashValue <String>
    */
    hasChange(hash) {
        if (_.isStrEmpty(hash)) {
            this.app.goIndex();
            return;
        }

        hash = this._transformHashUrl(hash);
        log.info(LOGTAG, `检测到主动路由变化，地址为：${hash}`);
        let fragment = this._analysHash(hash);

        //地址碎片中必须包含area区域信息
        if (fragment && fragment.params.area) {
            if (this.trigger("before:change", {
                newFragment: fragment,
                newFragmentUrl: hash,
                oldFragment: this.fragment,
                oldFragmentUrl: this.fragmentUrl
            }) === false) {
                this.trigger("break");
                return;
            }

            this.fragment = fragment;
            this.fragmentUrl = hash;

            this._loadAreaConfig(fragment, hash);
        }
        else {
            log.error(LOGTAG, `路由${hash}未能匹配或返回的数据不完整，请参考routerMaps`);
        }
    }
    /**
     * 加载区域配置信息
     * @param fragment 地址碎片 <Object>
     * @param fragmentUrl 地址(Hash) <String>
    */
    _loadAreaConfig(fragment, fragmentUrl) {
        let self = this;
        let areaPath = this._getRoleParamPath(
            "area",
            fragment,
            `areas/${fragment.params.area || ""}/config`
        );

        log.info(LOGTAG, `准备装载区域配置文件：${areaPath}`);
        import('~/' + areaPath)
            .then(areaConfig => {
                if (fragment.params.area !== self.fragment.params.area) {
                    log.warn(LOGTAG, "检测到区域加载变更，终止加载");
                    return;
                }

                self._initArea(areaConfig.default, fragment, fragmentUrl);
            })
            .catch(e => {
                //延迟加载异常不阻塞，不进行反馈
                if (fragment.params.area !== self.fragment.params.area) return;

                log.error(LOGTAG, `区域配置文件未成功加载：${areaPath}`,e);
                self.trigger("break");

                //跳转首页，判断是否当前所在是否是首页，如果不是则跳转，防止死循环
                if (fragmentUrl !== self.app.indexPath) {
                    self.app.goIndex();
                }
            });
    }
    /**
     * 初始化区域
     * @param areaConfig 区域配置文件 <Object>
     * @param fragment 地址碎片 <Object>
     * @param fragmentUrl 地址(Hash)  <String>
    */
    _initArea(areaConfig, fragment, fragmentUrl) {
        let self = this;

        //重置布局方案
        areaConfig.layout = areaConfig.layout || this.app.option.defaultLayout;

        if (this.areaConfig !== areaConfig) {
            this.trigger("before:initArea");
            //卸载原有区域样式
            _.removeStyle(this.areaConfig.styles);
            //装载新区域样式
            _.insertStyle(areaConfig.styles);
            //执行区域自定义初始化方法，只触发一次
            if (_.isFunction(areaConfig.init)) {
                areaConfig.init();
            }
            this.trigger("after:initArea");
        }




        if (this.areaConfig.layout === areaConfig.layout) {
            this.areaConfig = areaConfig;
            log.info(LOGTAG, `${areaConfig.layout}模板未发生改变，执行路由加载`);
            self._startLoadRouter(fragment, fragmentUrl);
            return;
        }

        this.areaConfig = areaConfig;

        this.app.region.teardownAll();
        let layoutPath = this._getRoleParamPath(
            "layout",
            fragment,
            `commonWeb/layouts/${areaConfig.layout || ""}`
        );

        log.info(LOGTAG, `准备装载布局文件：${layoutPath}`);
        import('~/' + layoutPath)
            .then(Layout => {
                if (self.fragmentUrl !== fragmentUrl) {
                    log.warn(LOGTAG, "检测到地址变更，终止本次加载");
                    return;
                }

                if (_.isFunction(areaConfig.onLayoutShow)) {
                    areaConfig.onLayoutShow();
                }

                self._startLoadRouter(fragment, fragmentUrl);
            })
            .catch(e => {
                self.trigger("break");
                log.error(LOGTAG, `${areaConfig.layout}未能加载成功;`, e);
            });
    }
    /**
     * 开始执行路由加载，入口方法
     * @param fragment 地址碎片 <Object>
     * @param fragmentUrl 地址(hash) <String>
    */
    _startLoadRouter(fragment, fragmentUrl) {
        let self = this;

        this.off("continue:change");

        //若此区域需要等待前置操作，则暂停路由匹配，等待触发continue:change
        if (this.areaConfig.awit) {
            log.warn(LOGTAG, "发现当前区域配置了前置等待，需等待：continue:change 事件触发。");
            this.once("continue:change", () => {
                self._loadRouter(fragment, fragmentUrl);
            });
        }
        else {
            this._loadRouter(fragment, fragmentUrl);
        }
    }
    /**
     * 执行路由加载，主方法
     * @param fragment 地址碎片 <Object>
     * @param fragmentUrl 地址(hash) <String>
    */
    _loadRouter(fragment, fragmentUrl) {
        let self = this;

        //若控制器层为空则按照默认控制器执行跳转
        if (_.isStrEmpty(this.fragment.params.controller)) {
            let defaultPath = this.fragment.params.area + "/" +
                this.areaConfig.defaultPath;

            if (_.isStrEmpty(this.areaConfig.defaultPath) || fragmentUrl === defaultPath) {
                log.error(LOGTAG, `未解析正确的Contoller，地址为：${fragmentUrl}`);
            }
            else {
                this.app.go(defaultPath);
            }

            return;
        }

        let routerPath = this._getRoleParamPath(
            "router",
            fragment,
            `areas/${this.fragment.params.area}/${this.fragment.params.controller}/router`
        );

        log.info(LOGTAG, `准备装载路由文件：${routerPath}`);

        import('~/' + routerPath)
            .then(controller => {
                if (fragmentUrl !== self.fragmentUrl) {
                    log.warn(LOGTAG, "检测到地址变更，终止本次加载");
                    return;
                }

                log.info(LOGTAG, "路由加载完毕，准备进入action匹配");

                self.app.controller.match(controller.default, fragment);
                self.trigger("after:change", fragment);
            })
            .catch(e => {
                self.trigger("break");
                log.error(LOGTAG, `路由文件加载失败`,e);
            });
    }
    /**
     * 转换HashUrl
     * @param hash hashValue <String>
    */
    _transformHashUrl(hash = "") {
        if (hash.charAt(0) === "#") {
            hash = hash.substring(1);
        }

        let hashArray = hash.split('/');
        let result = [];

        hashArray.forEach((item) => {
            if (_.isStrEmpty(item) === false)
                result.push(item);
        });

        return result.join('/');
    }
    /**
     * 解析Hash
     * @param hash hashValue <String>
    */
    _analysHash(hash = "") {
        let hashArray = hash.split('/');

        for (let item of this.routerMaps) {
            let roleArray = (item.role || "").split('/'),
                roleParam = {
                    params: {},
                    routerMap: undefined
                },
                isMatch = true;

            for (let index = 0; index < roleArray.length; index++) {
                var roleItem = roleArray[index];
                if (_.isStrEmpty(roleItem)) continue;

                if (/^{\S+}$/.test(roleItem)) {
                    let roleName = roleItem.substring(1, roleItem.length - 1);
                    roleParam.params[roleName] = hashArray[index];
                }
                else if (role !== hashArray[index]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch === false) continue;

            roleParam.routerMap = item;
            if (_.isFunction(item.exec)) {
                return item.exec(roleParam) || roleParam;
            }
            else {
                return roleParam;
            }
        };
    }
    /**
     * 获取碎片中指定name的值，并判断是否取默认值
     * @param name param名称 <String>
     * @param fragment 地址碎片 <Object>
     * @param defaultPath 默认地址 <String>
    */
    _getRoleParamPath(name, fragment, defaultPath = "") {
        let routerMap = fragment.routerMap,
            path = routerMap.path[name],
            result = "";

        if (_.isFunction(path)) {
            result = path(fragment);
        }
        else {
            result = path;
        }

        return result || defaultPath;
    }
}

export default Router;