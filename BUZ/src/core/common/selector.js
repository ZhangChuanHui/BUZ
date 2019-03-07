import Utils from './utils';
import log from '../common/log';
/**
 *  作者：张传辉
 *  功能名称：内置选择器
 *  描述信息：
 */
function Selector(strOrElement) {
    return new BET(strOrElement);
}


Selector.parseHTML = function (data) {
    if (data && typeof data === "string") {
        try {
            var tempContainer = document.createElement("div");

            tempContainer.innerHTML = data;
            return tempContainer.children;
        } catch (e) { }
    }

    log.error("选择工具", "错误的HTML片段，造成转换DOM失败");
    return [];
}

/**
 *  作者：张传辉
 *  功能名称：BUZ内置选择器 DOM类型
 *  描述信息：
 */
class BET extends Array {
    constructor(strOrElement) {
        super();

        this.add(strOrElement);

        return this;
    }
    /**
     * 遍历选择器
     * @param {Function} callBack 回调 传入Element
     */
    each(callBack, desc) {
        if (desc) {
            for (let index = this.length - 1; index >= 0; index--) {
                let elem = this[index];
                if (callBack(elem, index) === false) break;
            }
        } else {
            for (let index = 0; index < this.length; index++) {
                let elem = this[index];
                if (callBack(elem, index) === false) break;
            }
        }
        return this;
    }
    /**
     * 追加Element
     * @param {Element|BET} strOrElement 追加对象
     */
    add(strOrElement) {
        let addItems;
        switch (typeof strOrElement) {
            case "string":
                if (strOrElement.indexOf("<") > -1) {
                    addItems = Array.from(Selector.parseHTML(strOrElement));
                } else {
                    addItems = Array.from(document.querySelectorAll(strOrElement));
                }
                break;
            case "object":
                let elemType = Utils.getType(strOrElement);
                if (elemType === "[object NodeList]" || elemType === "[object HTMLCollection]") {
                    addItems = Array.from(strOrElement);
                }
                else if (strOrElement.nodeType !== undefined) {
                    addItems = [strOrElement];
                }
                else if (strOrElement.length !== undefined) {
                    addItems = strOrElement;
                }
                break;
            default:
                break;

        }

        (addItems || []).forEach((item) => {
            if (this.indexOf(item) === -1) {
                this.push(item);
            }
        });


        return this;
    }
    /**
     * 在选择器下查找指定对象
     * @param {string} strFilter 筛选条件
     */
    find(strFilter) {
        let result = new BET();

        this.each(function (item) {
            result.add(item.querySelectorAll(strFilter));
        });

        return result;
    }
    /**
     * 注册事件
     * @param {Object} events 事件集
     * @param {string} agent 代理/委托 注意如果设置代理则事件被
     * 重写，无法手动移除（off）,对于大范围的委托建议手动判断e.target
     */
    on(events, agent) {
        if (Utils.isObjEmpty(events)) return this;

        this.each(function (elem) {
            elem._buzEvents = elem._buzEvents || [];
            for (let name in events) {
                let callBack = events[name];

                if (Utils.isFunction(callBack) === false) continue;

                let _callBack = callBack;

                if (agent) {
                    _callBack = function (e) {
                        var range = elem.querySelectorAll(agent);
                        if (Array.from(range).indexOf(e.target) > -1) {
                            callBack(e);
                        }
                    }
                }

                elem._buzEvents.push({
                    callBack: callBack,
                    agent: _callBack
                });

                elem.addEventListener(name, _callBack, false);
            }
        });

        return this;
    }
    /**
     * 移除事件
     * @param {string} eventName 事件名称
     * @param {Function} func  指定事件处理把柄 可选
     */
    off(eventName, func) {
        if (Utils.isStrEmpty(eventName)) return this;

        this.each(function (elem) {
            elem._buzEvents = elem._buzEvents || [];

            if (func) {
                let findCallBack = [];
                elem._buzEvents.forEach((item) => {
                    if (item.callBack === func) {
                        elem.removeEventListener(eventName, item.agent);
                        findCallBack.push(item);
                    }
                });

                findCallBack.forEach((item) => {
                    elem._buzEvents = Utils.without(elem._buzEvents, item);
                });

                if (findCallBack.length === 0) {
                    elem.removeEventListener(eventName, func);
                }

            }
            else
                elem.removeEventListener(eventName);
        });

        return this;
    }
    /**
     * 触发事件
     * @param {string} eventName 事件名称
     * @param {...Array} params 事件参数
     */
    trigger(eventName, params) {
        if (Utils.isStrEmpty(eventName)) return this;

        this.each(function (elem) {
            let event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, false, false);
            event.data = params;
            elem.dispatchEvent(event, params);
        });

        return this;
    }
    /**
     * 添加Class样式
     * @param {string} cssName 样式名称
     */
    addClass(cssName) {
        this.each(function (elem) {
            elem.classList.add(cssName);
        });
        return this;
    }
    /**
     * 移除Class样式
     * @param {string} cssName 样式名称
     */
    removeClass(cssName) {
        this.each(function (elem) {
            elem.classList.remove(cssName);
        });
        return this;
    }
    /**
     * 设置或读取DOM属性
     * @param {string/Object} strOrObject 字符串时读取属性，对象设置属性
     */
    attr(strOrObject) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];

            if (typeof strOrObject === "string") {
                return elem.getAttribute(strOrObject);
            } else if (typeof strOrObject === "object") {
                for (let name in strOrObject) {
                    elem.setAttribute(name, strOrObject[name]);
                }
            }
        }

        return this;
    }
    /**
     * 追加子集元素
     * @param  {string/Element/BET} param 追加内容
     */
    append(param) {
        let $el;

        this.each(function (elem) {
            if (typeof param === "string") {
                //追加文本
                elem.innerHTML += param;
            } else {
                if ($el === undefined) {
                    $el = new BET(param);
                }

                $el.each((newItem) => {
                    elem.appendChild(newItem);
                });
            }
        });
        return this;
    }
    /**
     * 移除元素
     * @param {string/Element/BET} param 移除内容 参考BET
     */
    remove(param) {
        if (param) {
            let $el = new BET(param);

            this.each(function (elem) {
                $el.each((rItem) => {
                    elem.parentNode && elem.parentNode.removeChild(rItem);
                });
            });
        } else {
            this.each(function (elem) {
                elem.parentNode && elem.parentNode.removeChild(elem);
            });
        }

        return this;
    }
    /**
     * 获取父级元素
     */
    parent() {
        let result = new BET();

        this.each(function (elem) {
            result.add(elem.parentNode);
        });

        return result;
    }
    /**
     * 向前插入内容
     */
    before(content, returnInsert) {
        let insertElem = new BET(content);
        this.each(function (elem) {
            let parent = elem.parentNode;
            if (parent) {
                insertElem.each((item) => {
                    parent.insertBefore(item, elem);
                }, true);
            }
        });
        return returnInsert ? insertElem : this;
    }
    /**
     * 向后插入内容
     */
    after(content, returnInsert) {
        let insertElem = new BET(content);
        this.each(function (elem) {
            let parent = elem.parentNode;
            if (parent) {
                insertElem.each((item) => {
                    parent.insertBefore(item, elem.nextSibling);
                }, true);
            }
        });

        return returnInsert ? insertElem : this;
    }
    /**
     * 获取下一个元素
     */
    next() {
        let result = new BET();

        this.each(function (elem) {
            result.add(elem.nextElementSibling);
        });

        return result;
    }
    /**
     * 获取上一个元素
     */
    prev() {
        let result = new BET();

        this.each(function (elem) {
            result.add(elem.previousElementSibling);
        });

        return result;
    }
    children() {
        var result = new BET();

        this.each((elem) => {
            result.add(elem.children);
        });

        return result;
    }
    /**
     * 清空子集
     */
    empty() {
        this.each(function (elem) {
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        });
        return this;
    }
    /**
     * 克隆元素
     */
    clone() {
        let result = new BET();

        this.each(function (elem) {
            result.add(elem.cloneNode(true));
        });

        return result;
    }
    /**
     * 读取/设置HTML内容
     * @param {string} content 可选-内容
     */
    html(content) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];

            if (arguments.length > 0) {
                elem.innerHTML = content;
            }
            else {
                return elem.innerHTML;
            }
        }

        return this;
    }
    /**
     * 读取/设置HTML文本
     * @param {string} content 可选-内容
     */
    text(content) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];

            if (arguments.length > 0) {
                elem.textContent = content;
            }
            else {
                return elem.textContent;
            }
        }
    }
    /**
     * 读取/设置值 -针对控件
     * @param {*} value 可选-值
     */
    val(value) {
        var special = ["checkbox", "radio"];
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];
            let isSpecial = special.indexOf(elem.type) > -1;

            if (arguments.length > 0) {
                isSpecial ? elem.checked = !!value : elem.value = value;
            } else {
                return isSpecial ? !!elem.checked : elem.value;
            }
        }

        return this;
    }
    /**
     * 显示元素
     */
    show() {
        this.each(function (elem) {
            elem.style.display = "";
        });
        return this;
    }
    /**
     * 隐藏元素
     */
    hide() {
        this.each(function (elem) {
            elem.style.display = "none";
        });
        return this;
    }
    /**
     * 设置/读取宽度
     * @param {number|string} value 值
     */
    width(value) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];

            if (typeof value === undefined) {
                return parseFloat(window.getComputedStyle(elem).width);
            } else {
                elem.style.width = typeof value === "number" ? value + "px" : value;
            }
        }
        return this;
    }
    /**
     * 设置/读取高度
     * @param {number|string} value 值
     */
    height(value) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];

            if (typeof value === undefined) {
                return parseFloat(window.getComputedStyle(elem).height);
            } else {
                elem.style.height = typeof value === "number" ? value + "px" : value;
            }
        }
        return this;
    }
    /**
     * 读取整体高度 默认：height+padding+border
     * @param {Boolean} containMargin 是否包含外边距
     */
    outerHeight(containMargin) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];
            let computeStyle = window.getComputedStyle(elem)
            return parseFloat(elem.offsetHeight) +
                (containMargin ? parseFloat(computeStyle.marginTop) + parseFloat(computeStyle.marginBottom) : 0);
        }
    }
    /**
     * 读取整体宽度 默认：width+padding+border
     * @param {Boolean} containMargin 是否包含外边距
     */
    outerWidth(containMargin) {
        for (let index = 0; index < this.length; index++) {
            let elem = this[index];
            let computeStyle = window.getComputedStyle(elem)
            return parseFloat(elem.offsetWidth) +
                (containMargin ? parseFloat(computeStyle.marginLeft) + parseFloat(computeStyle.marginRight) : 0);
        }
    }
}

export default Selector;