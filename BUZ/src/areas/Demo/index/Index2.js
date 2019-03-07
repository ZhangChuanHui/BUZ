import templete from './templetes/index2.html';
import '../../../ui/form/form';
import '../../../ui/form/formCtrls';
import '../../../ui/form/ctrls/textBox';

export default Buz.View({
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
    },
    click4: function (e) {
        debugger;
        alert(this.data.demoStr);
    },
    onFormSubmit: function (e) {
        return "1";
    }
});