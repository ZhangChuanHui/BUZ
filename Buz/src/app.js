import Buz from './core/buz';
import baseCss from './commonWeb/resource/base.less';
baseCss.use();

_.docReady(() => {
    Buz.log.info("核心组件", "开始初始化Application");

    new Buz.Application({
        indexPath: "Demo"
    }).start();
});