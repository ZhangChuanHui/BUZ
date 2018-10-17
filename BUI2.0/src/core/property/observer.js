import _ from '../common/utils';
import Utils from '../common/utils';
import obArray from './array';

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

/**
 *  作者：张传辉
 *  功能名称：属性检测，属性拦截
 *  描述信息：
*/
class Observer {
    constructor(data) {
        if (!data || typeof data !== "object")
            return undefined;

        this.data = data;
        this.start();
        return this;
    }
    start() {
        let self = this;

        //生成主DEP，为其他驱动做操作依据
        this.dep = new Dep();
        Utils.def(this.data, '__ob__', this);

        if (Utils.isArray(this.data)) {
            obArray(this.data);
            this.observeArray(this.data);
        }
        else {
            Object.keys(this.data).forEach((key) => {
                self.bindReactive(this.data, key);
            });
        }
    }
    dependArray(value) {
        for (let i = 0; i < value.length; i++) {
            let item = value[i];

            item && item.__ob__ && item.__ob__.dep.depend();

            if (Utils.isArray(item)) this.dependArray(item);
        }
    }
    observeArray(array) {
        for (let i = 0; i < array.length; i++) {
            observer(array[i]);
        }
    }
    bindReactive(obj, key) {
        let dep = new Dep();
        let val;

        const property = Object.getOwnPropertyDescriptor(obj, key)
        if (property && property.configurable === false) return;

        const getter = property && property.get;
        const setter = property && property.set;
        if (!getter || !setter) {
            val = obj[key];
        }

        //遍历子集
        let childrenOb = observer(val);

        Object.defineProperty(this.data, key, {
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
                        this.dependArray(value);
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
                childrenOb = new Observer(value);

                dep.notify();
            }
        });
    }
}

/**
 *  作者：张传辉
 *  功能名称：观察者依赖管理。订阅列队管理
 *  描述信息：内部依赖不对外
*/
class Dep {
    constructor() {
        this.id = _.guid();
        this.subs = [];
    }
    depend() {
        //如果有代理目标则插入订阅者,建立关系
        Dep.target && Dep.target.addDep(this);
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    removeSub(sub) {
        //不借用utils中的without，减少遍历
        let index = this.subs.indexOf(sub);

        if (index != -1) {
            this.subs.splice(index, 1);
        }
    }
    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        });
    }
}

/** 定义目标对象，为触发者进行临时存储 */
Dep.target = null;


/**
 *  作者：张传辉
 *  功能名称：属性观察者,订阅者
 *  描述信息：
*/
class Watcher {
    constructor(data, expOrFn, callBack) {
        this.data = data;
        this.expOrFn = expOrFn;
        this.deps = {};
        this.callBack = callBack;

        if (typeof expOrFn === "function") {
            this.getter = expOrFn;
        }
        else {
            this.getter = this.transformGetter(expOrFn);
        }

        this.value = this.get();
    }
    update() {
        let value = this.get()
        let oldValue = this.value;
        //不可判断值相等，对于引用类型值始终相等
        if (
            value !== oldValue ||
            Utils.isObject(value)
        ) {
            this.value = value;
            this.callBack(value, oldValue);
        }
    }
    addDep(dep) {
        if (!this.deps[dep.id]) {
            dep.addSub(this);
            this.deps[dep.id] = dep;
        }
    }
    get() {
        Dep.target = this;
        let value = this.getter.call(this.data, this.data);
        Dep.target = undefined;
        return value;
    }
    transformGetter(exp) {
        //过滤非正常属性
        if (/[^\w.$]/.test(exp)) return;

        let exps = exp.split('.');

        return function (data) {
            let result = data;
            exps.forEach((key) => {
                if (!result) return;

                result = result[key];
            });

            return result;
        }
    }
}

export default {
    Observer,
    Watcher
}