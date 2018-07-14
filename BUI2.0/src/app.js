import Bui from './bui/bui';

_.docReady(() => {
    Bui.log.info("核心组件", "开始初始化Application");

    var app = new Bui.Application({
        indexPath: "Demo"
    });

    app.start();
});
