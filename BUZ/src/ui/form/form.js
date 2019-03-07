import { ComponentParser } from '../../core/compile/parser/component-parser';
import Utils from '../../core/common/utils';
import LogHandler from '../../core/common/log';

export const FROMGROUP = "BUZFORM";
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
    submit: function (view, fromJs) {
        debugger;
    }
};

ComponentParser.add("submitform", {
    templete: `<form :class="className" :id="id" :style="style"></form>`,
    props: {
        'className': String,
        'url': String,
        'data': { type: Object, default: {} },
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
    ctrls: {},
    onRender: function () {
        this.$el.append(this.componentChildNodes);
    },
    onShow: function () {
        FormHandler.init(this);
    },
    addCtrl: function (name, ctrl) {
        if (this.ctrls[name]) {
            LogHandler.warn(LOGTAG, `${name}已存在，将强制覆盖`);
        }

        this.ctrls[name] = ctrl;
    }
}, FROMGROUP);

