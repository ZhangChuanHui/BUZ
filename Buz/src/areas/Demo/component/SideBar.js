import templete from './templetes/side-bar.html';

export default Bui.View({
    templete: templete,
    onShow: function () {
        this._onAfterRouterChange = _.bind(this.onAfterRouterChange, this);
        App.router.on("after", this._onAfterRouterChange);
    },
    onAfterRouterChange: function (e, fragment) {
        let area = fragment.params.area;
        let controller = fragment.params.controller;
        let action = fragment.params.action;

        let url = [area, controller, action].join('/');


        this.$("li.active").removeClass("active");
        this.$(`li[data-hash='${url}']`).addClass("active");
    },
    goHref: function (e) {
        if (e.target.tagName === "LI") {
            App.go($(e.target).attr("data-hash"));
        }
    },
    onTeardown: function () {
        App.router.off("after", this._onAfterRouterChange);
    }
});