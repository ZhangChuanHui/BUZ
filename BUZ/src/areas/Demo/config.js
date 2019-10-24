import demoCss from "~/areas/Demo/resource/demo.less"
import SideBar from "./component/SideBar";

export default {
    layout: "DefaultLayout",
    defaultPath: "index",
    styles: [demoCss],
    onLayoutShow: () => {
        //模板加载完毕后执行，可以处理一些当前模块公共事件
        App.regions.sideBar.show(new SideBar());
    },
    routers: {
        "index": () => import( /* webpackChunkName: "areas/Demo/index/router" */ './index/router')
    }
}