import LogHandler from "../common/log";
import { LOGTAG } from "./index";
import Utils from "../common/utils";

const allowedKeywords =
    'Math,Date,this,true,false,null,undefined,Infinity,NaN,' +
    'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' +
    'encodeURIComponent,parseInt,parseFloat'
const allowedKeywordsRE =
    new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');


const improperKeywords =
    'break,case,class,catch,const,continue,debugger,default,' +
    'delete,do,else,export,extends,finally,for,function,if,' +
    'import,in,instanceof,let,return,super,switch,throw,try,' +
    'var,while,with,yield,enum,await,implements,package,' +
    'protected,static,interface,private,public'
const improperKeywordsRE =
    new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

const wsRE = /\s/g;
const newlineRE = /\n/g;
const saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
const restoreRE = /"(\d+)"/g;
const pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
const literalValueRE = /^(?:true|false|null|undefined|Infinity|NaN)$/;

var saved = [];

function save(str, isString) {
    var i = saved.length
    saved[i] = isString
        ? str.replace(newlineRE, '\\n')
        : str
    return '"' + i + '"'
}


function rewrite(raw) {
    // 保留第一个字符是因为identRE的匹配到的第一个字符是非变量字符,这个字符为前一个运算符当中的部分或者是空格
    // 比如' result=a+b' 那么raw就会匹配上' result' 和' =a' 和' +b',所以要保留第一个=和+,
    // 然后将结果加上'scope.' 变成'scope.result=scope.a+scope.b'
    var c = raw.charAt(0)
    var path = raw.slice(1)
    if (allowedKeywordsRE.test(path)) {
        return raw
    } else {
        // 如果是字符串 那就不加
        // 不过按理说只有raw.charAt(0)可能会是引号,path里不会匹配到引号啊
        path = path.indexOf('"') > -1
            ? path.replace(restoreRE, restore)
            : path
        return c + 'viewData.' + path
    }
}


function restore(str, i) {
    return saved[i]
}


function compileGetter(exp) {
    if (improperKeywordsRE.test(exp)) {
        LogHandler.error(LOGTAG, "表达式中不得出现关键字");
    }

    saved.length = 0

    var body = exp
        .replace(saveRE, save)
        .replace(wsRE, '')

    body = (' ' + body)
        .replace(identRE, rewrite)
        .replace(restoreRE, restore);

    return makeGetterFn(body)
}


function makeGetterFn(body) {
    try {
        return new Function('viewData', 'return ' + body + ';')
    } catch (e) {
        LogHandler.error(LOGTAG, "表达式构建方法运行失败");
        return Utils.noop;
    }
}


export default function (exp) {
    exp = exp.trim()
  
    return compileGetter(exp);
}

