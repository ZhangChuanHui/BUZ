/**
*  作者：张传辉
*  功能名称：工具库
*  描述信息：
*/
class Utils {
    constructor() {
        /** 未guid做索引 */
        this._guidNum = 0;
    }
    /**
    * 从列表中移除某一项
    * @param  list 数据源 <Array>
    * @param value 值 <Any,Function> 值；若为Function 则根据true/false作为依据
    */
    static without(list, value) {
        var newList = [];
        list = list || [];

        if (this.isFunction(value)) {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (value(item) !== true) {
                    newList.push(item);
                }
            }
        }
        else {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (list[i] === value) {
                    newList.push(item);
                }
            }
        }
        return newList;
    }
    /**
    * 检查值是否是一个方法类型
    * 输出：Boolean
    * @param func 值 <Any>
    */
    static isFunction(func) {
        return func && typeof func === "function";
    }
    /**
     * 判断字符串是否为空
     * @param value 值
    */
    static isStrEmpty(value) {
        return value === undefined || value === "" || value === null;
    }
    /**
     * 插入样式文件
     * @param styles 样式文件路径 <Array>
     *      注意地址是根据index.html做相对路径设置
    */
    static insertStyle(styles = []) {
        styles.forEach((item) => {
            if ($(`link[data-url='${item}']`).length) return;

            $("head").append(`<link rel="stylesheet" href="${item}" data-url="${item}"></link>`);
        });
    }
    /**
     * 移除样式文件
     * @param styles 样式文件路径 <Array>
    */
    static removeStyle(styles = []) {
        styles.forEach((item) => {
            $(`link[data-url='${item}']`).remove();
        });
    }
    /**
     *生成唯一ID
    */
    static guid() {
        return "guid_" + (this._guidNum++) + new Date().getTime() + Math.ceil(Math.random() * 1000);
    }
    /**
     * 执行方法，并指定this
     * @param func 执行方法 <Function>
     * @param ref this引用 <Any>
    */
    static bind(fun, ref) {
        return function () {
            fun.apply(ref, arguments);
        }
    }
}

export default Utils;