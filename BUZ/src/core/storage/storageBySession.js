/**
 *  作者：张传辉
 *  功能名称：状态管理器-SessionStorage
 *  描述信息：
 *      对于支持sessionStorage，或非隐身模式下，启用临时会话存储
*/
class StorageBySession {
    constructor(name) {
        this.tagName = name;
        this.enable = this.check();
    }
    /**检测是否可以启动会话存储 */
    check() {
        try {
            if (window.sessionStorage) {
                sessionStorage[buz_temp_sessionStorage] = "temp";
                return true;
            }
        }
        catch (e) { }

        return false;
    }
    get() {
        return this.enable ? JSON.parse(sessionStorage[this.tagName] || {}) : {};
    }
    set(value) {
        this.enable && (sessionStorage[this.tagName] = JSON.stringify(value));
    }
    clear() {
        this.enable && sessionStorage.removeItem(this.tagName);
    }
}

export default StorageBySession;