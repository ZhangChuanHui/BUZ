export default {
    templete: `<button type='button' on:click='demoClick'></button>`,
    props: ['btntext'],
    demoClick: function () {
        this.componentNode.trigger("click");
    },
    onRender: function () {
        this.$el.append(this.componentChildNodes);
    }
};