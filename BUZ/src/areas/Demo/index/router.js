export default Buz.Controller({
    actions: {
        "": () => {
            App.regions.content.show("areas/Demo/index/Index");
        },
        "index2": () => {
            App.regions.content.show("areas/Demo/index/Index2");
        }
    }
});