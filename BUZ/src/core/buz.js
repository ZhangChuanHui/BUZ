import log from './common/log';
import utils from './common/utils';
import Application from './marionette/application';
import { Controller } from './marionette/controller';
import { ViewHandler } from './marionette/view';
import selector from './common/selector';

window.$ = selector;
window._ = utils;
window.Buz = {
    log: log,
    Application: Application,
    Controller: Controller,
    View: ViewHandler
}

export default window.Buz;
