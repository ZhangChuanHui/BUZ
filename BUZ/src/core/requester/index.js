import EventHander from '../common/event';
import Storage from '../storage/index';

/**
 *  作者：张传辉
 *  功能名称：请求管理类
 *  描述信息：
*/
class Requester extends EventHander {
    constructor(app) {
        super();

        //Request 缓存仓库，用于保存请求缓存
        this.storage = new Storage(app, 'BUZRequestCache');

        /**请求队列 */
        this.requestList = [];

        //TODO:
    }
}