import Bui from './core/bui';
import baseCss from './commonWeb/resource/base.less';
baseCss.use();

_.docReady(() => {
    Bui.log.info("核心组件", "开始初始化Application");

    new Bui.Application({
        indexPath: "Demo"
    }).start();
});