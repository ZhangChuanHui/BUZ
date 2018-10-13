import elemParser from './elem-parser';
import textParser from './text-parser';
import htmlParser from './html-parser';


export default class Parser {
    constructor(node) {
        /*Element 优先*/
        let elemParsers = new elemParser(node);
        /*Html 转换，如果有混合则强制替换*/
        let htmlParsers = new htmlParser(node) 
        /*Text 转换*/
        let textParsers = htmlParsers.length ? [] : new textParser(node);

        let tokens = [].concat(elemParsers, htmlParsers, textParsers);
        
        return tokens;
    }
}