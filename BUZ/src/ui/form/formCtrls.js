import Utils from '../../core/common/utils';
import LogHandler from '../../core/common/log';
import { ComponentParser } from '../../core/compile/parser/component-parser';
import { FORMCTRLGROUP, LOGTAG } from './form';
import Validation from './validation';
/**
 *  作者：张传辉
 *  功能名称：表单组件 - 对外扩展使用
 *  描述信息：
 *      提供表单组件的注册 和 基础方法
*/
const DEFAULTCTRL = {
    blurValidate: true,
    props: {
        defaultValue: {
            default: ''
        },
        value: {
            default: ''
        },
        validateHandler: Function,
        disabled: Boolean,
        readonly: Boolean
    },
    validate: async function () {
        let message = Validation.validateForElem(this.componentNode, this.val());
        if (message) return message;
        if (Utils.isFunction(this.data.validateHandler))
            return await this.data.validateHandler()
    },
    val: function () {
        if (arguments.length === 0) {
            return this.$el.val();
        }
        else {
            this.$el.val(arguments[0]);
        }
    },
    setDefaultValue: function () { this.val(this.data.defaultValue); },
    onShow: function () {
        let self = this;
        //#region  监听主动触发
        this.$watch("value", (nv, ov) => {
            self.val(nv);
        });

        this.$watch("disabled", (nv, ov) => {
            self.setDisabled(nv, true);
        });

        this.$watch("readonly", (nv, ov) => {
            self.setReadonly(nv, true);
        });
        //#endregion

        if (Utils.isFunction(this.onInit)) {
            this.onInit();
        }

        //#region  初始化默认
        this.val(this.data.value);
        if (this.data.disabled) this.setDisabled(true, true);
        if (this.data.readonly) this.setReadonly(true, true);
        //#endregion
    },
    setDisabled: function (disabled, formJs) {
        if (disabled) {
            this.$el.attr("disabled", "disabled");
        }
        else {
            this.$el.removeAttr("disabled", "disabled");
        }

        if (!formJs) this.data.disabled = !!disabled;
    },
    setReadonly: function (readonly, formJs) {
        if (readonly) {
            this.$el.attr("readonly", "readonly");
        }
        else {
            this.$el.removeAttr("readonly", "readonly");
        }

        if (!formJs) this.data.readonly = !!readonly;
    },
    checkEnableValidate: function () {
        return this.$el.visible() && (!this.data.disabled && !this.data.readonly)
    },
    checkEnableSubmit: function () {
        return this.$el.visible() && !this.data.disabled;
    },
    checkEnableSetDefaultValue: function () {
        return !this.data.disabled && !this.data.readonly;
    }
};

/**
 * 注册表单控件
 * @param {String} name 控件名称
 * @param {DEFAULTCTRL} ctrl 控件参数
 */
function register(name, ctrl) {
    if (Utils.isStrEmpty(name) == false && ctrl && Utils.isObject(ctrl)) {
        //onShow 不对外 onInit对外
        delete ctrl.onShow;

        //深度合并props
        ctrl.props = Object.assign({}, DEFAULTCTRL.props, ctrl.props);

        ComponentParser.add(
            name,
            Object.assign({}, DEFAULTCTRL, ctrl),
            FORMCTRLGROUP);
    }
    else {
        LogHandler.error(LOGTAG, "注册控件失败，请注意控件参数是否符合规范");
    }
}

export default register;

