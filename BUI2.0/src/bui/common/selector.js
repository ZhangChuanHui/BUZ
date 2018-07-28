import _ from './utils';
import log from '../common/log';
/**
 *  作者：张传辉
 *  功能名称：内置选择器
 *  描述信息：
*/
function Selector(strOrElement) {
    return new BET(strOrElement);
}


Selector.parseXML = function (data) {
    if (data && typeof data === "string") {
        var xml;
        // Support: IE 9 - 11 only
        try {
            xml = (new window.DOMParser()).parseFromString(data, "text/xml");
        } catch (e) { }

        if (xml && xml.getElementsByTagName("parsererror").length === 0) {
            return xml.children[0];
        }
    }

    log.error("选择工具", "错误的HTML片段，造成转换DOM失败");
    return [];
}

/**
 *  作者：张传辉
 *  功能名称：BUI内置选择器 DOM类型
 *  描述信息：
*/
class BET {
    constructor(strOrElement) {
        this.nodeList = [];

        this.add(strOrElement);

        return this;
    }
    /**
     * 遍历选择器
     * @param callBack 回调 <Function> 传入Element
    */
    each(callBack) {
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];
            if (callBack(elem, index) === false) break;
        }
        return this;
    }
    /**
     * 追加Element
     * @param strOrElement 追加对象 <Element/BETItem>
    */
    add(strOrElement) {
        switch (typeof strOrElement) {
            case "string":
                if (strOrElement.indexOf("<") > -1) {
                    this.nodeList = this.nodeList.concat(Selector.parseXML(strOrElement));
                }
                else {
                    this.nodeList = document.querySelectorAll(strOrElement);
                }
                break;
            case "object":
                if (strOrElement.toString() === NodeList.prototype.toString()) {
                    this.nodeList = this.nodeList.concat(strOrElement);
                    break;
                }
                else if (strOrElement.nodeList) {
                    this.nodeList = this.nodeList.concat(strOrElement.nodeList);
                    break;
                }
                else if (strOrElement.nodeType !== undefined) {
                    this.nodeList.push(strOrElement);
                    break;
                }
            default:
                break;

        }

        this.nodeList = _.distinct(this.nodeList);

        this.length = this.nodeList.length;

        return this;
    }
    /**
     * 在选择器下查找指定对象
     * @param strFilter 筛选条件 <String>
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
     * @param events 事件集 <Object>
     * @param delegate 委托处理 <Function> 返回true则触发事件机制
    */
    on(events, delegate) {
        if (_.isObjEmpty(events)) return this;

        this.each(function (elem) {
            for (let name in events) {
                let callBack = events[name];

                if (_.isFunction(callBack) === false) continue;

                elem.addEventListener(name, function (e) {

                    if (_.isFunction(delegate) === false) {
                        if (delegate(e.target) !== true) return;
                    }

                    if (callBack.call(elem, e) === false) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                }, false);
            }
        });

        return this;
    }
    /**
     * 移除事件
     * @param eventName 事件名称 <String>
     * @param func  指定事件处理把柄 <Function> 可选
    */
    off(eventName, func) {
        if (_.isStrEmpty(eventName)) return this;

        this.each(function (elem) {
            elem.removeEventListener(eventName, func);
        });

        return this;
    }
    /**
     * 触发事件
     * @param eventName 事件名称 <String>
     * @param params 事件参数 <...Array>
    */
    trigger(eventName, ...params) {
        if (_.isStrEmpty(eventName)) return this;

        this.each(function (elem) {
            if (_.isFunction(elem[eventName])) {
                elem[eventName].call(elem, params);
            }
        });

        return this;
    }
    /**
     * 添加Class样式
     * @param cssName 样式名称
    */
    addClass(cssName) {
        this.each(function (elem) {
            elem.classList.add(cssName);
        });
        return this;
    }
    /**
     * 移除Class样式
     * @param cssName 样式名称
    */
    removeClass(cssName) {
        this.each(function (elem) {
            elem.classList.remove(cssName);
        });
        return this;
    }
    /**
     * 设置或读取DOM属性
     * @param strOrObject 字符串时读取属性，对象设置属性<String/Object>
    */
    attr(strOrObject) {
        for (let index = 0; index < this.nodeList.length; i++) {
            let elem = this.nodeList[index];

            if (typeof strOrObject === "string") {
                return elem.getAttribute(strOrObject);
            }
            else if (typeof strOrObject === "object") {
                for (let name in strOrObject) {
                    elem.setAttribute(name, strOrObject[name]);
                }
            }
        }

        return this;
    }
    /**
     * 追加子集元素
     * @param param 追加内容 <String/Element/BET>
    */
    append(param) {
        let $el;

        this.each(function (elem) {
            if (typeof param === "string") {
                //追加文本
                elem.innerHTML += param;
            }
            else {
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
     * @param param 移除内容 参考BET <String,Element,BET>
    */
    remove(param) {
        let $el = new BET(param);

        this.each(function (elem) {
            $el.each((rItem) => {
                elem.parentNode && elem.parentNode.removeChild(rItem);
            });
        });

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
     * @param content 可选-内容 <String>
     * @param isText 是否读取文本 <Boolean> 默认False
    */
    html(content, isText) {
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];

            if (typeof content === "string") {
                elem.innerHTML = content;
            }
            else if (content === undefined) {
                return isText ? elem.textContent : elem.innerHTML;
            }
        }

        return this;
    }
    /**
     * 读取/设置HTML文本
     * @param content 可选-内容 <String>
    */
    text(content) {
        return this.html(content, true);
    }
    /**
     * 读取/设置值 -针对控件
     * @param value 可选-值 <Any>
    */
    val(value) {
        var special = ["checkbox", "radio"];
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];
            let isSpecial = special.indexOf(elem.type) > -1;

            if (typeof content === "string") {
                isSpecial ? elem.checked = !!value : elem.value = value;
            }
            else {
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
     * @param value 值
    */
    width(value) {
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];

            if (typeof value === undefined) {
                return parseFloat(window.getComputedStyle(elem).width);
            }
            else {
                elem.style.width = typeof value === "number" ? value + "px" : value;
            }
        }
        return this;
    }
    /**
     * 设置/读取高度
     * @param value 值
    */
    height(value) {
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];

            if (typeof value === undefined) {
                return parseFloat(window.getComputedStyle(elem).height);
            }
            else {
                elem.style.height = typeof value === "number" ? value + "px" : value;
            }
        }
        return this;
    }
    /**
     * 读取整体高度 默认：height+padding+border
     * @param containMargin 是否包含外边距 <Boolean>
    */
    outerHeight(containMargin) {
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];
            let computeStyle = window.getComputedStyle(elem)
            return parseFloat(elem.offsetHeight) +
                (containMargin ? parseFloat(computeStyle.marginTop) + parseFloat(computeStyle.marginBottom) : 0);
        }
    }
    /**
     * 读取整体宽度 默认：width+padding+border
     * @param containMargin 是否包含外边距 <Boolean>
    */
    outerWidth(containMargin) {
        for (let index = 0; index < this.nodeList.length; index++) {
            let elem = this.nodeList[index];
            let computeStyle = window.getComputedStyle(elem)
            return parseFloat(elem.offsetWidth) +
                (containMargin ? parseFloat(computeStyle.marginLeft) + parseFloat(computeStyle.marginRight) : 0);
        }
    }
}

export default Selector;