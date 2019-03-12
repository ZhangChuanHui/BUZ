import { ComponentParser } from '../../core/compile/parser/component-parser';
import Utils from '../../core/common/utils';
import LogHandler from '../../core/common/log';

export const FROMGROUP = "BUZFORM";
export const FORMCTRLGROUP = "BUZFORMCTRL";
export const LOGTAG = '表单控件';

var FormHandler = {
    init: function (view) {
        this.initHandler(view);
    },
    initHandler: function (view) {
        var self = this;
        view.$el.on({
            click: function (e) {
                Utils.stopAndPreventDefault(e);
                self.submit(view);
            }
        }, "input[type='submit'],button[type='submit']");

        view.$el.on({
            click: function (e) {
                Utils.stopAndPreventDefault(e);
                self.reset(view);
            }
        }, "input[type='reset'],button[type='reset']");

        view.$el.on({
            "submit": function (e) {
                Utils.stopAndPreventDefault(e);
                self.submit(view);
            }
        });
    },
    getCtrls: function (view, filter) {
        let ctrls = ComponentParser.findComponentByGourp(view.$el, FORMCTRLGROUP);
        let result = [], names = [];
        ctrls.forEach((ctrl) => {
            if (ctrl.attrDatas.name && names.indexOf(ctrl.attrDatas.name) === -1) {

                if (filter === undefined || filter(ctrl)) {
                    result.push(ctrl);
                    names.push(ctrl.attrDatas.name);
                }
            }
        });

        return result;
    },
    submit: function (view, fromJs) {

    },
    reset: function (view) {
        let ctrls = this.getCtrls(view);
        ctrls.forEach((ctrl) => {
            ctrl.checkEnableSetDefaultValue()
                && ctrl.setDefaultValue();
        });

        clearErrorMessage();
    },
    validate: async function (view, ctrls) {
        let validatePromise = [];
        let self = this;
        ctrls = ctrls || this.getCtrls(view);

        ctrls.forEach((ctrl) => {
            if (ctrl.checkEnableValidate()) {

                let promiseItem = ctrl.validate()
                    .then((message) => {
                        message && self.showErrorMessage(view, message);
                    })

                if (view.data.stoponerror) {
                    if (await promiseItem) {
                        return false;
                    }
                }
                else {
                    validatePromise.push(promiseItem);
                }
            }
        });

        let result = await Promise.all(validatePromise);
        (result || []).forEach((message) => {
            if (message) return false;
        });

        return true;
    },
    clearErrorMessage: function (view, ctrls) {
        ctrls = ctrls || this.getCtrls(view);
        ctrls.forEach((item) => {
            this.closeErrorMessage(view, item);
        });
    },
    closeErrorMessage: function (view, ctrl) {
        if (view.data.oncloseerror) {
            view.data.oncloseerror(ctrl);
        }
        else {
            //TODO:
        }
    },
    showErrorMessage: function (view, ctrl, message) {
        if (view.data.onshowerror) {
            view.data.onshowerror(ctrl, message);
        }
        else {
            //TODO:
        }
    },
    getFormData: function (view, ctrls) {
        ctrls = ctrls || this.getCtrls(this);

        let formData = {};

        ctrls.forEach((ctrl) => {
            ctrl.checkEnableSubmit()
                && (formData[ctrl.attrDatas.name] = ctrl.val());
        });

        Object.assign({}, view.data.formdata, formData);

        return formData;
    }
};

ComponentParser.add("submitform", {
    templete: `<form :class="classname" :id="id" :style="style"></form>`,
    props: {
        'classname': String,
        'url': String,
        'formdata': { type: Object, default: {} },
        'stoponerror': { type: Boolean, default: false },
        'entersubmit': { type: Boolean, default: true },
        'validateonblur': { type: Boolean, default: true },

        'onsubmit': Function,
        'onbeforerquest': Function,
        'oncusotmsubmit': Function,
        'onsuccess': Function,
        'onerror': Function,
        'oncomplete': Function,
        'onshowerror': Function,
        'oncloseerror': Function
    },
    onChildrenRender: function () {
        this.$el.append(this.componentChildNodes);
    },
    onShow: function () {
        FormHandler.init(this);
    },
    reset: function () {
        FormHandler.reset(this);
    },
    validate: async function () {
        if (arguments.length === 1) {
            let param = arguments[0];
            let ctrls = [];
            if (typeof param === "string") {
                let ctrls = FormHandler.getCtrls(this, function (ctrl) {
                    return ctrl.attrDatas.name === param;
                });
            }
            else if (Utils.isArray(param)) {
                let ctrls = FormHandler.getCtrls(this, function (ctrl) {
                    return param.indexOf(ctrl.attrDatas.name) > -1;
                });
            }

            return await FormHandler.validate(this, ctrls);
        }
        else {
            return await FormHandler.validate(this);
        }
    },
    showErrorMessage: function (name, message) {
        let ctrls = FormHandler.getCtrls(this, function (ctrl) {
            return ctrl.attrDatas.name === name;
        });

        if (ctrls.length === 0) return;

        FormHandler.showErrorMessage(this, ctrls[0], message);
    },
    closeErrorMessage: function (name, message) {
        let ctrls = FormHandler.getCtrls(this, function (ctrl) {
            return ctrl.attrDatas.name === name;
        });

        if (ctrls.length === 0) return;

        FormHandler.closeErrorMessage(this, ctrls[0], message);
    },
    clearErrorMessage: function () {
        FormHandler.clearErrorMessage(this);
    },
    submit: function () {
        FormHandler.submit(this, true);
    },
    getFormData: function () {
        return FormHandler.getFormData(this);
    }
}, FROMGROUP);

