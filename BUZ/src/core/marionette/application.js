import log from '../common/log';
import EventHandler from '../common/event';
import Router from './router';
import { BaseController } from './controller';
import Region from './region';
import { BaseView } from './view';
import Storage from "../storage/index";

const LOGTAG = "应用管理";
/**
 *  作者：张传辉
 *  功能名称：应用管理器
 *      一个项目只有一个应用管理器
 *      一个项目只会初始化一次
 *      初始化后应按照个性化需求处理后执行start方法，开启应用池
 *      对外输出App，如不指定对外输出物，则默认生成App
*/
class Application extends EventHandler {
    constructor(config) {
        super();
        /**App配置信息*/
        this.option = Object.assign({
            /**主容器选择器*/
            containerSelector: "#layout",
            /**主页地址（锚点）*/
            indexPath: "Home",
            /**默认布局方案*/
            defaultLayout: "DefaultLayout"
        }, config);

        this.option.containerSelector = $(this.option.containerSelector);

        if (this.option.containerSelector.length === 0) {
            log.error(LOGTAG, `应用池初始化错误，未找到containerSelector`);
            return;
        }

        /**路由管理操作把柄 */
        this.router = new Router(this);
        /**控制器基类操作把柄 */
        this.controller = new BaseController();
        /**区域管理操作把柄 */
        this.region = new Region(this);
        /**视图管理操作把柄 */
        this.view = new BaseView(this);
        /**缓存管理器 */
        this.storage = new Storage(this);
        window.App = this;
        return this;
    }
    /**
     * App开始方法
    */
    start() {
        this.router.start();
        return this;
    }
    /**
     * 跳转
     * @param hashPath 目标Hash值 
     *     注意：开始位置不需要带'#'或'/'
    */
    go(hashPath) {
        if (hashPath === this.router.fragmentUrl) {
            this.reload();
        }
        else {
            location.hash = hashPath;
        }
    }
    /**
     * 重载当前Hash
    */
    reload() {
        this.router.trigger("reload");
    }
    /**
     * 跳转首页地址
     * 首页地址：option.indexPath
    */
    goIndex() {
        this.go(this.option.indexPath);
    }
}

export default Application;