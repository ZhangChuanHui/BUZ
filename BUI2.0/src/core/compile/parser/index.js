import elemParser from './elem-parser';
import textParser from './text-parser';
import htmlParser from './html-parser';


export default class Parser {
    constructor(node) {
        let tokens = [].concat(
            /*Element 优先*/
            new elemParser(node),  
            /*Text 转换*/
            new textParser(node),
            /*Html 转换，如果有混合则强制替换*/
            new htmlParser(node)
        );

        return tokens;
    }
}