﻿import templete from './templetes/index.html';

export default Bui.View({
    templete: templete,
    data: {
        demoText: 1,
        demoTip: "我是固定提示",
        eventName: "click1",
        htmlcard: "",
        listData: [
            { name: "张1", age: 10 }
        ],
        demoObj: {
            name: "张1",
            age: 10,
            other:"山东"
        }
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
            <div>哈哈我是div4</div>`;
    },
    click5: function () {
        this.data.listData.push({
            name: "张2",
            age: 13
        });
    },
    click6: function () {
        this.data.listData = [
            { name: "李1", age: 12 },
            { name: "李2", age: 13 },
            { name: "李3", age: 14 },
            { name: "李4", age: 15 }
        ];
    }
});