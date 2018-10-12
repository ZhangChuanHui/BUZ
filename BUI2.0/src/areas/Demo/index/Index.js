import templete from './templetes/index.html';

export default Bui.View({
    templete: templete,
    data: {
        demoText: 1,
        demoTip:"我是固定提示"
    },
    clickFun: function () {
        this.data.demoText++;
    }
});