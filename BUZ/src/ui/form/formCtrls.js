import Utils from '../../core/common/utils';
import LogHandler from '../../core/common/log';
import { ComponentParser } from '../../core/compile/parser/component-parser';
import { FROMGROUP, LOGTAG } from './form';

const FORMCTRLGROUP = "BUZFORMCTRL";

const DEFAULTCTRL = {
    blurValidate: true,
    validate: function () { },
    val: function () { },
    setDefaultValue: function () { },
    onShow: function () {
        this.base();
    },
    base: function () {
        //尝试挂载FORM 具有name才符合form提交标准
        this.attrDatas.name && this._mountForm();

        if (Utils.isFunction(this.onInit)) {
            this.onInit();
        }
    },
    _mountForm: function () {

    }
};

/**
 * 注册表单控件
 * @param {String} name 控件名称
 * @param {DEFAULTCTRL} ctrl 控件参数
 */
function register(name, ctrl) {
    if (Utils.isStrEmpty(name) == false && ctrl && Utils.isObject(ctrl)) {
        ComponentParser.add(
            name,
            Object.assign(true, {}, DEFAULTCTRL, ctrl),
            FORMCTRLGROUP);
    }
    else {
        LogHandler.error(LOGTAG, "注册控件失败，请注意控件参数是否符合规范");
    }
}

export default register;