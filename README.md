<p align="center"><img width="60" src="docs/images/logo.png" alt="Vue logo" /></p>

# BUZ1.0 停止更新，BUZ-NEXT可视化框架封闭开发中，敬请期待

# BUZ1.0

BUZ是一套整体前端实施框架，它包含了页面生命管理、模板引擎、表单控件、请求管理等。
我们建议使用此框架来搭建整体前端框架，当然我们也支持自底向上逐层应用。
BUZ的核心是`marionette（牵引线）`，主要负责页面生命周期管理，你可以再此基础上
和任意第三方控件进行集成使用。

## 了解BUZ
* BUZ提供常用控件及Application，Application在项目启动时会被初始化，并保存到App全局变量中，作为开发常用的应用操作把柄 其中Application中包括`牵引线`、`Request(请求)`、`Storage(缓存)`等

* 牵引线作为框架的特色功能存在，他提供了`Layout(模板区域管理)`、`Router(路由管理)`、`View(视图控件)`等， 通过以上控件来控制整个页面的卸载、装载、观察者事件注册及销毁等全生命周期，而开发人员只需要遵循 各控件的开发规范编写路由、视图即可，无须关注复杂的页面生命周期。

* Router中可以控制每个`Controller/Action`的前置操作、后置操作，区域展示等一系列操作，而View只 需要关注业务流程及页面展示，并提供常用的接口及观察者模式，方便开发人员快速开发，也规范了开发规范。

* 整个页面的生命周期交由牵引线独立管理，可以实现数据统计、页面加载等待效果、卸载残留事件等一系列操作，以达到框架的可扩展性、 可维护性。

### Browser Compatibility

BUZ supports all browsers that are ES5-compliant (IE8 and below are not supported).

## 帮助文档

[帮助文档](https://zhangchuanhui.github.io/BUZ/docs/index.html)

## BraveOS专用UI

[BraveOS](https://github.com/ZhangChuanHui/BraveOS)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018 张传辉
