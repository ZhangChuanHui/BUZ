let _guidNum = 0;
let _toString = Object.prototype.toString;

/**
 *  作者：张传辉
 *  功能名称：工具库
 *  描述信息：
 */
class Utils {
    /**
     * 从列表中移除某一项
     * @param  list 数据源 <Array>
     * @param value 值 <Any,Function> 值；若为Function 则根据true/false作为依据
     */
    static without(list = [], value) {
        let newList = [];

        if (this.isFunction(value)) {
            for (let i = 0; i < list.length; i++) {
                var item = list[i];
                if (value(item) !== true) {
                    newList.push(item);
                }
            }
        } else {
            for (let i = 0; i < list.length; i++) {
                var item = list[i];
                if (list[i] === value) {
                    newList.push(item);
                }
            }
        }
        return newList;
    }
    static toStr(value) {
        return value.toString();
    }
    /**
     * 数组去重
     * @param list 数组
     */
    static distinct(list = []) {
        let result = [];

        for (var item of Array.from(list)) {
            if (result.indexOf(item) === -1) {
                result.push(item);
            }
        }

        return result;
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
    static isObjEmpty(value) {
        return this.isStrEmpty(value) || (typeof value === "object" && Object.keys(value).length === 0);
    }
    /**
     * 插入样式文件
     * @param styles 样式文件路径 <Array>
     *      注意地址是根据index.html做相对路径设置
     */
    static insertStyle(styles = []) {
        styles.forEach((item) => {
            item.use();
        });
    }
    /**
     * 移除样式文件
     * @param styles 样式文件路径 <Array>
     */
    static removeStyle(styles = []) {
        styles.forEach((item) => {
            item.unuse();
        });
    }
    /**
     *生成唯一ID
     */
    static guid() {
        return "guid_" + (_guidNum++) + new Date().getTime() + Math.ceil(Math.random() * 1000);
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
    /**
     * DOM加载完毕
     * @param callBack 回调 <Function>
     */
    static docReady(callBack) {
        document.addEventListener("DOMContentLoaded", function () {
            callBack();
        });
    }
    /**
     * 去除前后空格
     * @param str 字符串 <String>
     */
    static trim(str = "") {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    /**
     * 判断是否已指定字符串开始
     * @param str 字符串 <String>
     * @param key 关键字 <String>
     */
    static startWith(str = "", key) {
        return str.indexOf(key) === 0;
    }
    /**
     * 判断是否已指定字符串结尾
     * @param str 字符串 <String>
     * @param key 关键字 <String>
     */
    static endWith(str = "", key = "") {
        return str.lastIndexOf(key) == str.length - key.length;
    }
    /**
     * 判断是否已包含指定字符串
     * @param str 字符串 <String>
     * @param key 关键字 <String>
     */
    static contains(str = "", key) {
        return str.indexOf(key) > -1;
    }
    /**
     * 是否是数组
     */
    static isArray(value) {
        return typeof value === "object" && Array.isArray(value);
    }
    /**
     * 是否是对象
     */
    static isObject(object) {
        return object !== null && typeof object === 'object'
    }
    /**
     * 是否具有原型链
     */
    static hasProto(value) {
        return !!value.__proto__;
    }
    /**
     * 设置属性值
     */
    static def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        });
    }
    /**
     * 对象自身属性中是否具有指定的属性，支持属性索引
     */
    static hasOwn(obj, key = "") {
        let paths = key.split('.');
        let tempObj = obj;
        paths.forEach((path) => {
            Object.prototype.hasOwnProperty.call(tempObj, path) &&
                (tempObj = tempObj[path]);
        });

        return true;
    }
    /**
     * 判断指定参数是否是一个纯粹的对象
     */
    static isPlainObject(obj) {
        return _toString.call(obj) === '[object Object]'
    }
    static getType(obj) {
        return _toString.call(obj);
    }
    /**
     * 获取对象所有属性地址
     */
    static getObjectAllRefPath(obj, array = [], parentRef = "") {
        if (this.isObject(obj)) {
            obj.forEach((key) => {
                let refPath = `${parentRef}.${key}`;
                array.push(refPath);

                this.getObjectAllRefPath(obj[key], array, refPath);
            });
        }

        return array;
    }
    static noop() { }
}

export default Utils;