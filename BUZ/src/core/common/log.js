var LogOption = {
    /**日志权重*/
    levels: ["info", "warn", "error"],
    /**
    * 作用：写日志公共方法
    * 参数：
    *   日志类型 <info,error,warn,groupCollapsed,groupEnd>
    *   日志标志 <String>
    *   日志内容 <String，Object，Int，Boolean>
    */
    writeLog: function (type, tag, content, error) {
        if (window.console && window.console[type]) {

            //若是分组标签等级保持和info平级
            var leve = this.levels.indexOf(type);
            if (leve === -1 && type.indexOf('group') === 0) leve = 0;

            //判断日志输出等级
            if (leve < this.levels[process.logLevel]) return;

            content = this.transformContent(content);
            var timer = this._getTimer();
            tag = " ----" + tag + "---- ";

            console[type](timer + tag + content);
            if (error) console.error(error);
        }
    },
    /**
    * 作用：内容转换
    * 参数：
    *   日志内容 <String,Object,Int,Boolean,Function>
    * 输出：<String>
    */
    transformContent: function (content) {
        if (typeof content === "object") {
            return JSON.stringify(content);
        }

        if (content === undefined || content === null) {
            return "";
        }

        return content;
    },
    _getTimer: function () {
        var date = new Date();

        return [
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ].join(':');
    }
};

/**
**  作者：张传辉
**  名称：前端日志管理
**  描述： 
*/
class LogHandler {
    /**
    * 输出普通日志信息
    * @param {String} tag 日志标志
    * @param {Any} content 日志内容 
    */
    static info(tag, content) {
        LogOption.writeLog("info", tag, content);
    }
    /**
    * 输出错误日志信息
    * @param {String} tag 日志标志
    * @param {Any} content 日志内容
    * @param {Error} error 错误堆栈
    */
    static error(tag, content, error) {
        LogOption.writeLog("error", tag, content, error);
    }
    /**
    * 输出警告日志信息
    * @param {String} tag 日志标志
    * @param {Any} content 日志内容
    */
    static warn(tag, content) {
        LogOption.writeLog("warn", tag, content);
    }
    /**
    * 组合日志信息开始
    * @param {String} tag 日志标志
    * @param {Any} content 日志内容
    */
    static groupStart(tag, content) {
        LogOption.writeLog("groupCollapsed", tag, content);
    }
    /**
    * 组合日志信息结束
    * @param {String} tag 日志标志
    * @param {any} content 日志内容
    */
    static groupEnd(tag, content) {
        LogOption.writeLog("groupEnd", tag);
    }
};

export default LogHandler;