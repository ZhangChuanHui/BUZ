import elemParser from './elem-parser';
import textParser from './text-parser';
import htmlParser from './html-parser';
import componentParser from './component-parser';

/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
export default class Parser {
    constructor(node, option) {
        /*Element 优先*/
        let elemParsers = new elemParser(node, option);
        /*Html 转换，如果有混合则强制替换*/
        let htmlParsers = new htmlParser(node, option)
        /*Text 转换*/
        let textParsers = htmlParsers.length ? [] : new textParser(node, option);

        /*component 组件转换 入口*/
        let componentParsers = new componentParser(node, option)

        let tokens = [].concat(elemParsers, htmlParsers, textParsers, componentParsers);

        return tokens;
    }
}