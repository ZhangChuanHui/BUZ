import Buz from './core/buz';
import baseCss from './commonWeb/resource/base.less';
import demoButton from './commonWeb/components/demo-button';

baseCss.use();

_.docReady(() => {
    Buz.log.info("核心组件", "开始初始化Application");

    new Buz.Application({
        indexPath: "Demo"
    }).start();

    Buz.component('demo-button', demoButton);
});