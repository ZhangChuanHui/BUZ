import CompileOrder from '../order';

/**
 *  作者：张传辉
 *  功能名称：
 *  描述信息：
*/
CompileOrder.addHelper("storage", function (path) {
    return App.storage.getByPath(path);
});
