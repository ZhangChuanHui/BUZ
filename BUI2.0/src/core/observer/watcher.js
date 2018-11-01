import Utils from '../common/utils';
import Dep from './dep';
/**
 *  作者：张传辉
 *  功能名称：属性观察者,订阅者
 *  描述信息：
*/
export class Watcher {
    constructor(data, expOrFn, callBack, token) {
        this.data = data;
        this.expOrFn = expOrFn;
        this.token = token;
        this.deps = [];
        this.depIds = [];
        this.newDeps = [];
        this.newDepIds = [];

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
        const id = dep.id;
        if (this.newDepIds.indexOf(id) === -1) {
            this.newDepIds.push(id);
            this.newDeps.push(dep);

            if (this.depIds.indexOf(id) === -1) {
                dep.addSub(this);
            }
        }
    }
    get() {
        Dep.target = this;
        let value = this.getter.call(this.data, this.data);
        Dep.target = undefined;

        this.clearnDeps();
        return value;
    }
    clearnDeps() {
        let i = this.deps.length;

        while (i--) {
            const dep = this.deps[i];

            if (this.newDepIds.indexOf(dep.id) === -1) {
                dep.removeSub(this);
            }
        }

        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.length = 0;
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp
        this.newDeps.length = 0;
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
