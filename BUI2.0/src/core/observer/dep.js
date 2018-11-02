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
            if (sub.active)
                sub.update();
        });
    }
}

/** 定义目标对象，为触发者进行临时存储 */
Dep.target = null;

export default Dep;