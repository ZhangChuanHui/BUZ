import _ from '../common/utils';
import Utils from '../common/utils';
import obArray from './array';
import Dep from './dep';

function observer(value) {
    if (Utils.isObject(value) === false) return;

    let ob;
    if (Utils.hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    }
    else if ((Utils.isArray(value) || Utils.isPlainObject(value))
        && Object.isExtensible(value)) {
        ob = new Observer(value);
    }
    return ob;
}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let item = value[i];

        item && item.__ob__ && item.__ob__.dep.depend();

        if (Utils.isArray(item)) dependArray(item);
    }
}
export function observeArray(array) {
    for (let i = 0; i < array.length; i++) {
        observer(array[i]);
    }
}

export function defineReactive(obj, key, val) {
    let dep = new Dep();

    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) return;

    const getter = property && property.get;
    const setter = property && property.set;

    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key];
    }

    //遍历子集
    let childrenOb = observer(val);

    Object.defineProperty(obj, key, {
        //可枚举
        enumerable: true,
        //不可再定义
        configurable: true,
        get: () => {
            const value = getter ? getter.call(obj) : val;
            //如果有人进行此属性访问，则开启订阅列队
            dep.depend();

            if (childrenOb && childrenOb.dep) {
                childrenOb.dep.depend();

                if (Utils.isArray(value)) {
                    dependArray(value);
                }
            }
            return value;
        },
        set: (newVal) => {
            const value = getter ? getter.call(obj) : val;

            if (newVal === value || (newVal !== newVal && value !== value)) {
                return;
            }

            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal;
            }

            //遍历子集
            childrenOb = new Observer(newVal);

            dep.notify();
        }
    });
}

/**
 *  作者：张传辉
 *  功能名称：属性检测，属性拦截
 *  描述信息：
*/
export class Observer {
    constructor(data) {
        if (!data || typeof data !== "object")
            return undefined;

        this.data = data;
        this.start();
        return this;
    }
    start() {
        //生成主DEP，为其他驱动做操作依据
        this.dep = new Dep();
        Utils.def(this.data, '__ob__', this);

        if (Utils.isArray(this.data)) {
            obArray(this.data);
            observeArray(this.data);
        }
        else {
            Object.keys(this.data).forEach((key) => {
                defineReactive(this.data, key);
            });
        }
    }

}

/** 设置响应数据值*/
export function setData(target, key, value) {
    if (Utils.hasOwn(target, Utils.toStr(key))) {
        target[key] = value;
        new Observer(target[key]);

        notifyChange(target);
    }
    else {
        log.error(LOGTAG, `Buz.setData传入Key值不在target中，请确认`);
    }
}
/** 删除相应数据值*/
export function deleteData(target, key) {
    if (Utils.isPlainObject(target)) {
        delete target[key];
        notifyChange(target);
    }
    else {
        log.error(LOGTAG, `Buz.deleteData传入Key值不在target中或不被识别`);
    }
    notifyChange(target);
}
/** 通知响应值改变*/
export function notifyDataChange(target) {
    target.__ob__
        && target.__ob__.dep
        && target.__ob__.dep.notify();
}

export * from './watcher';