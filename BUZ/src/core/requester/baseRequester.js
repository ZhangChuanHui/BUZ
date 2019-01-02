/**
 *  作者：张传辉
 *  功能名称：请求接口类，用于规范底层处理类
 *  描述信息：所有方法必须进行实现
 *      对外不输出Promise对象，统一由Requester统一创建并管理Promise
*/
class BaseRequester {
    /**
     * 参数转换方法
     * @param {Object} option 参数
     */
    transformData(url, option = {}) { return option; }
    /** 请求发起者 --必须重写
     *  @param {Object} config 配置参数-请参考当前项目请求器参数说明 
     *  @param {Function} callBack 回调处理集 
     *  @return {Function} Cancel取消处理
     */
    send(config, callBack) { }
}

export default BaseRequester;