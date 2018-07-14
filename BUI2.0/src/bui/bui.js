import log from './common/log';
import _ from './common/utils';
import Application from './marionette/application';
import { Controller } from './marionette/controller';
import { ViewHandler } from './marionette/view';
import { debug } from "util";

window.Bui = {
    log: log,
    Application: Application,
    Controller: Controller,
    View: ViewHandler
}

export default window.Bui
