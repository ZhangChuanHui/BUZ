import templete from './templetes/index.html';

export default Bui.View({
    templete: templete,
    data: {
        demoText: 1,
        demoTip: "我是固定提示",
        eventName: "click1",
        htmlcard: ""
    },
    clickFun: function () {
        this.data.demoText++;
    },
    click1: function () {
        alert(`我是方法1`);
    },
    click2: function () {
        alert(`我是方法2`);
    },
    click3: function () {
        this.data.htmlcard =
            `<a href="javascript:void(0)">哈哈哈哈3</a>
             <div>哈哈我是div3</div>`;
    },
    click4: function () {
        this.data.htmlcard =
            `<a href="javascript:void(0)">哈哈哈哈4</a>
            <div>哈哈我是div4</div>`;;
    }
});