import templete from './templetes/index2.html';
import '../../../ui/form/form';
import '../../../ui/form/formCtrls';
import '../../../ui/form/ctrls/textBox';

export default Buz.View({
    templete: templete,
    data: {
        listData: [1, 2],
        users: [{
            name: "张1",
            age: 10
        },
        {
            name: "李四",
            age: 16
        }],
        selectIndex: -1,
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
    },
    click4: function (e) {
        alert(this.data.demoStr);
    },
    trClick: function (e, item, index) {
        alert(index);
    },
    userClick: function (e, item, index) {
        this.data.selectIndex = index;
    },
    onFormSubmit: function () {
    }
});