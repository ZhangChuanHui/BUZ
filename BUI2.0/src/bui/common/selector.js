import _ from './utils';

/**
 *  作者：张传辉
 *  功能名称：内置选择器
 *  描述信息：
*/
function Selector(strOrElement) {
    return BET(strOrElement);
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
    each(callBack) {
        for (let index = 0; index < this.nodeList.length; i++) {
            var elem = this.nodeList[index];
            if (callBack(elem, index) === false) break;
        }
        return this;
    }
    add(elemOrBETItem) {
        switch (typeof strOrElement) {
            case "string":
                this.nodeList = document.querySelectorAll(strOrElement);
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
    find(strFilter) {
        let result = new BET();

        this.each(function (item) {
            result.add(item.querySelectorAll(strFilter));
        });

        return result;
    }
    on(events, delegate) {
        if (_.isObjEmpty(events)) return this;

        this.each(function (elem) {
            for (let name in events) {
                let callBack = events[name];

                if (_.isFunction(callBack) === false) continue;

                elem.addEventListener(name, function (e) {

                    if (_.isStrEmpty(delegate) === false) {
                        if (elem.querySelectorAll(delegate).indexOf(e.target) === -1) {
                            return;
                        }
                    }

                    if (callBack(e) === false) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                }, false);
            }
        });

        return this;
    }
}