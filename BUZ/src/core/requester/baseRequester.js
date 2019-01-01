/**
 *  作者：张传辉
 *  功能名称：请求接口类，用于规范底层处理类
 *  描述信息：所有方法必须进行实现
 *      依赖原生的 ES6 Promise 实现而被支持.
*/
class BaseRequester {
    /** 初始化请求器，只初始化一次
     *  @param {Any} globalConfig 配置参数 
     */
    init(globalConfig) { }
    /** 请求发起者
     *  @param {Object} config 配置参数-请参考当前项目请求器参数说明 
     *  @param {Object} callBacks 回调处理集 { success:Function,error:Function,complete:Function }
     *  @return Promise
     */
    send(config, callBacks) { }
    /**
     * 取消当前请求
     * @param {RequestReturn} request 请求处理后返回操作把柄
     */
    cancel(request) { }
}