import Utils from '../../core/common/utils';
import LogHandler from '../../core/common/log';
import { LOGTAG } from './form';
import BET from '../../core/common/selector';

/**
 *  作者：张传辉
 *  功能名称：表单校验
 *  描述信息：
 *      提供单独校验，和元素校验
*/
let ValidationPluginExtend = [
    {
        name: "required",
        flag: "data-role-required",
        params: [
            //message
            function (attrDatas) {
                return attrDatas["data-role-required"]
                    || attrDatas["placeholder"];
            }
        ],
        valudate: function (value, message = '此项必填') {
            if (Utils.isStrEmpty(Utils.trim(value)))
                return message;
        }
    },
    {
        name: "number",
        flag: "data-role-number",
        params: [
            //message
            function (attrDatas) {
                return attrDatas["data-role-number"];
            }
        ],
        validate: function (value, message = '请填写数字类型的值') {
            if (isNaN(value)) {
                return message;
            }
        }
    },
    {
        name: "int",
        flag: "data-role-int",
        params: [
            //message
            function (attrDatas) { return attrDatas["data-role-int"]; }
        ],
        validate: function (value, message = '请输入整数类型') {
            if (isNaN(value) && value.indexOf(".") !== -1) {
                return message;
            }
        }
    },
    {
        name: "regex",
        flag: "data-role-regex",
        params: [
            //pattrn
            function (attrDatas) { return attrDatas["data-role-regex"]; },
            //message
            function (attrDatas) { return attrDatas["data-role-regex-message"] }
        ],
        validate: function (value, pattrn, message = "正则匹配错误") {
            var clientRegex = new RegExp(pattrn);
            if (clientRegex.test(value) == false) {
                return message;
            }
        }
    },
    {
        name: "email",
        flag: "data-role-email",
        params: [
            //message
            function (attrDatas) { return attrDatas["data-role-email"] }
        ],
        validate: function (value, message = "邮箱地址错误") {
            if (!value) return;
            //@之前英文大小写、数字、_-.    @之后.之前部分匹配邮箱名，允许英文大小写数字_-.   .之后是顶级域名，允许英文大小写
            var clientRegex = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if (clientRegex.test(value) == false) {
                return message;
            }
        }
    }
];

function transformItemParam(attrDatas, item) {
    let result = [];
    item.params.forEach((func) => {
        result.push(func(attrDatas));
    });
    return result;
}

/**
 * 校验
 * @class Validation
 */
class Validation {
    static getItem(name) {
        ValidationPluginExtend.forEach((item) => {
            if (item.name === name) return item;
        });
    }
    static register(item) {
        if (item.name && item.flag) {
            let oldItem = this.getItem(item.name);
            if (oldItem) {
                LogHandler.warn(LOGTAG, `验证：${item.name}重复，执行替换，请仔细确认。`);
                Utils.without(ValidationPluginExtend, oldItem);
            }

            ValidationPluginExtend.push(Object.assign({
                name: "",
                flag: "",
                params: [],
                validate: function () { }
            }, item));

            ValidationPluginExtend = ValidationPluginExtend.sort((v1, v2) => {
                return (v1.weight || 0) > (v2.weight || 0);
            });
        }
        else {
            LogHandler.error(LOGTAG, "注册自定义表单验证失败，非法格式");
        }
    }
    static validate(name, value, ...param) {
        let item = this.getItem(name);
        if (item) {
            return item.validate(value, ...param);
        }
        else {
            LogHandler.warn(LOGTAG, `表单验证：${name}未找到`);
        }
    }
    static validateForElem(elem, value) {
        let domElem = (new BET(elem))[0];
        let attrDatas = domElem ? domElem.attributes : {};

        ValidationPluginExtend.forEach((item) => {
            if (attrDatas[item.flag]) {
                let params = transformItemParam(attrDatas);

                let message = item.validate(value, ...params);

                if (message) return message;
            }
        });
    }
}

export default Validation;