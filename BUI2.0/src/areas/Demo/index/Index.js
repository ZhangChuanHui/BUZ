import templete from './templetes/index.html';
import { setTimeout } from 'timers';

export default Bui.View({
    templete: templete,
    data: {
        demoText: 1,
        demoText2:"等待输入内容"
    },
    clickFun: function () {
        this.data.demoText++;
    }
});