import LogHandler from "../common/log";
import { LOGTAG } from "./index";
import Utils from "../common/utils";
import CompileOrder from "./order";
/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/

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
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
const execFunction = /^(.+?)\(([^]*?)\)$/;

var saved = [];

function save(str, isString) {
    var i = saved.length
    saved[i] = isString
        ? str.replace(newlineRE, '\\n')
        : str
    return '"' + i + '"'
}


function rewrite(raw) {

    var c = raw.charAt(0);
    var path = raw.slice(1);
    if (allowedKeywordsRE.test(path)) {
        return raw
    } else {

        path = path.indexOf('"') > -1
            ? path.replace(restoreRE, restore)
            : path;
        return c + 'viewData.' + path
    }
}


function restore(str, i) {
    return saved[i];
}


function compileGetter(exp) {
    let body = getFnBody(exp);
    return makeGetterFn(body);
}

function getFnBody(exp) {
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

    return body;
}

function makeGetterFn(body) {
    try {
        return new Function('viewData', 'return ' + body + ';')
    } catch (e) {
        LogHandler.error(LOGTAG, "表达式构建方法运行失败");
        return Utils.noop;
    }
}


export default function (exp, scope, option) {
    exp = exp.trim();

    if (Utils.isStrEmpty(exp)) {
        return "";
    }

    let funcTarget = option.view || scope;
    let execMatch = exp.match(execFunction);

    if (execMatch && execMatch.length === 3) {

        let funcName = execMatch[1].trim();
        let param = execMatch[2].trim();
        let func;
        if (option.view && Utils.isFunction(option.view[funcName])) {
            func = option.view[funcName];
        }
        else if (Utils.isFunction(CompileOrder.helps[funcName])) {
            func = CompileOrder.helps[funcName];
        }

        if (func) {
            if (Utils.isStrEmpty(param)) {
                return func.call(funcTarget, scope);
            }
            else {
                let params = compileGetter(`[${param}]`).call(funcTarget, scope);
                return func.call(funcTarget, ...params);
            }
        }
    }

    if (Utils.isFunction(CompileOrder.helps[exp])) {
        return CompileOrder.helps[exp].call(funcTarget, scope);
    }
    return compileGetter(exp).call(funcTarget, scope);
}

