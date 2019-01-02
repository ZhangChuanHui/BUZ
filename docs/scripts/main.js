var menuDatas = {
    help: [
        { title: "介绍", href: "pages/help/introduce.html" },
        { title: "使用说明", href: "pages/help/use.html" },
        { title: "加载流程", href: "pages/help/load.html" },
        { title: "模板语法", href: "pages/help/templete.html" },
        { title: "自定义指令", href: "pages/help/customOrder.html" }
    ],
    api: [
        { title: "应用池", href: "pages/api/application.html" },
        { title: "路由", href: "pages/api/router.html" },
        { title: "视图区域", href: "pages/api/region.html" },
        { title: "区域配置", href: "pages/api/areaConfig.html" },
        { title: "控制器", href: "pages/api/controller.html" },
        { title: "视图", href: "pages/api/view.html" },
        { title: "缓存管理", href: "pages/api/storage.html" },
        { title: "请求管理", href: "pages/api/requester.html" }
    ]
}

$(function () {
    $(".header .nav").on({
        click: function () {
            var name = $(this).attr("name");
            selectNav(name);

            $(".header .nav a").removeClass("active");
            $(this).addClass("active");
        }
    }, "a");

    $(".middel .menu").on({
        click: function () {
            $(".middel .menu a").removeClass("active");
            $(this).addClass("active");

            $(".middel iframe").attr("src", $(this).attr("href"));
            return false;
        }
    }, "a");

    selectNav("help");

    $(window).resize(function () {
        resizeContentHeight();
    });

    resizeContentHeight();
});

function selectNav(name) {
    $(".middel .menu").empty();

    var htmls = [];
    for (var i = 0; i < menuDatas[name].length; i++) {
        var item = menuDatas[name][i];
        htmls.push('<li><a href="' + item.href + '" target="content">' + item.title + '</a></li>');
    }

    $(".middel .menu").html(htmls.join(''));

    $(".middel .menu li:first a").click();
}

function resizeContentHeight() {
    $(".middel").height($(window).height() - $(".header").outerHeight(true) - 20);
}