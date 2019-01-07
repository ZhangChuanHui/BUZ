/**
 *  作者：张传辉
 *  功能名称：模板渲染处理类基类
 *  描述信息：
 *      1.务必在子类中return super()
 *      2.务必实现接口方法
*/
export default class BaseParser {
    constructor(node, option) {
        this.node = node;
        this.option = option;
        this.result = [];

        if (this.check()) {
            this.parser();
        }

        return this.result;
    }
    check() { return false; }
    parser() { }
}