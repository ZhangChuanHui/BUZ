import templete from './templetes/index2.html';

export default Bui.View({
    templete: templete,
    data: {
        listData: [1, 2],
        demoStr: "123213"
    },
    click1: function () {
        this.data.listData.push("xx");
    },
    click2: function () {
        this.data.listData.splice(this.data.listData.length - 1, 1);
    },
    click3: function () {
        this.data.demoStr = _.guid();
    }
});