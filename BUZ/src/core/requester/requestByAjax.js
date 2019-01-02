import BaseRequester from './baseRequester';
import axios from 'axios';
import LogHandler from '../common/log';

const LOGTAG = '请求管理';
/**
 *  作者：张传辉
 *  功能名称：默认Ajax请求器
 *  描述信息：核心axios
*/
class RequestByAjax extends BaseRequester {
    /** 请求发起者
     *  @param {Object} config 配置参数-请参考当前项目请求器参数说明 
     *  @param {Function} callBack 回调处理集
     *  @return {Function} Cancel取消处理
     */
    send(config, callBack) {

        let cancel, uncare = false;

        //创建cancel，强行覆盖，不可自定义
        config.cancelToken = new axios.CancelToken(function executor(exec) {
            // exec 函数接收一个 cancel 函数作为参数
            cancel = exec;
        });

        axios(config)
            .then(function (response) {
                callBack('connect', response.data);
            })
            .catch(function (error) {
                if (axios.isCancel(error)) {
                    callBack('canceled');
                    return;
                }

                if (error.response) {
                    // 发送请求后，服务端返回的响应码不是 2xx   
                    callBack('error', error.response.status);

                }
                else {
                    callBack('error');
                }

                LogHandler.error(LOGTAG, '请求失败', error);
            });


        return function () {
            cancel('canceled by the user');
        }
    }
}

export default RequestByAjax;