export default {
    templete: `<button type='button' on:click='demoClick'>{{btntext}}</button>`,
    props: ['btntext'],
    demoClick: function () {
        alert(1);
    },
    onRender: function () {
        debugger;
    }
};