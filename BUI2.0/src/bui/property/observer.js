import _ from '../common/utils';

/**
 *  作者：张传辉
 *  功能名称：属性检测，属性拦截
 *  描述信息：
*/
class Observer {
    constructor(data) {
        if (!data || typeof data !== "object")
            return;

        this.data = data;
        this.start();
        return this;
    }
    start() {
        let self = this;

        Object.keys(this.data).forEach((key) => {
            self.bindReactive(key, this.data[key]);
        });
    }
    bindReactive(key, value) {
        let dep = new Dep();
        //遍历子集
        new Observer(value);

        Object.defineProperty(this.data, key, {
            //可枚举
            enumerable: true,
            //不可再定义
            configurable: false,
            get: () => {
                //如果有人进行此属性访问，则开启订阅列队
                dep.depend();

                return value;
            },
            set: (newVal) => {
                if (newVal === value) return;

                value = newVal;

                //遍历子集
                new Observer(value);

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
        //如果有代理目标则插入订阅者
        Dep.target && Dep.target.addSub(this);
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
        //若值发生改变时触发订阅
        if (value != oldValue) {
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