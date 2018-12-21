import log from './common/log';
import utils from './common/utils';
import Application from './marionette/application';
import { Controller } from './marionette/controller';
import { ViewHandler } from './marionette/view';
import { setData, deleteData, notifyDataChange } from './observer/index'
import selector from './common/selector';

window.$ = selector;
window._ = utils;
window.Buz = {
    log: log,
    Application: Application,
    Controller: Controller,
    View: ViewHandler,
    set: setData,
    delete: deleteData,
    notify: notifyDataChange
}

export default window.Buz;
