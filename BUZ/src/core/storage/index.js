import EventHandler from '../common/event';
import StorageBySession from './storageBySession';
import Utils from '../common/utils';
import LogHandler from '../common/log';
import { Observer } from '../observer/index';
const LOGTAG = "状态管理";
const STORAGETAGNAME = "__BUZSTORAGEDATA__";

/**
 *  作者：张传辉
 *  功能名称：状态管理器
 *  描述信息：
*/
class Storage extends EventHandler {
    constructor(app, tagName = "") {
        super();

        this.app = app;
        this.tagName = STORAGETAGNAME + tagName;
        this.session = new StorageBySession(this.tagName);
        this._data = this.session.get();
        this.data = {};

        //刷新时重新载入数据
        for (var name in this._data) {
            let item = this._data[name];
            if (item) this.data[name] = item;
        }
    }
    get(key) {
        return this.data[key];
    }
    getByPath(path) {
        return Utils.getValueByPath(this.data, path);
    }
    save() {
        this.session.set(this._data);
    }
    remove(key) {
        delete this._data[key];
        delete this.data[key];
        save();
    }
    add(key, value, param = {}) {
        if (Utils.isPlainObject(item.value) === false) {
            LogHandler.error(LOGTAG, `你设置的${key}不是一个对象类型，缓存管理只可保存对象类型。`);
            return;
        }

        if (Utils.isStrEmpty(key) === false) {
            let item = {
                value: value,
                param: param,
                fragment: this.app.router.fragment
            }

            this._data[key] = item;
            this.data[key] = value;

            this.save();

            return item;
        }
        else {
            LogHandler.error(LOGTAG, "设置状态时key值不可以为空");
        }
    }
    addWatcher(key, value, param = {}) {
        let item = this.add(key, value, param);

        item && new Observer(item.value);
    }
}

export default Storage;