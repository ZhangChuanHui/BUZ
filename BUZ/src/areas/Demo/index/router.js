export default Buz.Controller({
    actions: {
        "": () => {
            App.regions.content.show(import( /* webpackChunkName: "areas/Demo/index/index" */ "./Index"));
        },
        "index2": () => {
            App.regions.content.show(import( /* webpackChunkName: "areas/Demo/index/index2" */ "./Index2"));
        }
    }
});