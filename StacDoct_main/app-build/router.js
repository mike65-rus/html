/**
 * Created by STAR_06 on 18.11.2015.
 */
define(['kendo','services/proxyService','viewModels/menuVm','alertify'],function(kendo,proxy,menuVm,alertify){
        var onRouteMissing= function (e) {
/*            require(['text!views/pageNotFound.html'], function(view) {
                loadView(null,view,"",function() {
                    $("#pageNotFound").html(e.url);
                });
            });
*/
            alertify.alert('Запрашиваемая страница "'+ e.url+'" не найдена!');
            e.preventDefault();
        };
        var router = new kendo.Router({routeMissing:onRouteMissing}),
            layout = new kendo.Layout("<section id='content'><div id='init'></div></section><section id='content2'></section>");
        var ibRendered=false;
        layout.render($("#app"));
        // toDO add routes
        router.route("/my-pacients", function() {
//            unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbIndex', 'text!views/myIndex.html',"text!views/emptyContent.html"], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("my-pacients");
                });
            });
        });
        router.route("/outer-pacients", function() {
  //          unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbOutIndex', 'text!views/outIndex.html',"text!views/emptyContent.html"], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
//                    kendo.bind($("#grid"),viewModel);
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("outer-pacients");
                });
            });
        });
        router.route("/new-pacients", function() {
    //        unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbInIndex', 'text!views/inIndex.html','text!views/emptyContent.html'], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("new-pacients");
                });
            });
        });
        router.route("/ib/:id", function(id) {
            require(['viewModels/ib', 'text!views/ibHeader.html',
                    'text!views/emptyContent.html',
                    'kendo-template!templates/recomList'],
            function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    viewModel.set("currentId",id);
                    kendo.bind($("ib"), viewModel);
                    proxy.publish("ibHeaderOnScreen",true);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    kendo.bind($("#ib-menu-details>li"),viewModel);
                    activateMenuItem("/ib/");
                    ibRendered=true;
                });
            });
        });

        router.route("/ib-news/:id", function(id) {
            if (!ibRendered) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibNewsVm','text!views/ibNews.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                        kendo.bind($("#ibNewsGrid"),viewModel);
                        kendo.bind($("#btnRefreshNews"),viewModel);

                    });
                });
                activateMenuItem("/ib-news/");
            }
        });
        router.route("/ib-recom/:id", function(id) {
            if (!ibRendered) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/recomendations','text!views/ibRecom.html','kendo-template!templates/recomList'],
                        function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                        kendo.bind($("#ib-recomendations"),viewModel);
                    });
                    activateMenuItem("/ib-recom/");
                });
            }
        });
        router.route("/", function() {
            router.navigate("/my-pacients");
            activateMenuItem("my-pacients");
        });

        //
        var loadView = function(viewModel, view, container,delegate) {
            var kendoView = new kendo.View(view, { model: viewModel, hide: onHideView });
            if (container==undefined || (!container)) {
                container="#content";
            }
            layout.showIn(container, kendoView);
            if (delegate != undefined)
                delegate();
        };

        var activateMenuItem= function (eref) {
            $("ul.main-menu>li").each(function(index){
                $(this).removeClass("active");
                var sRef=$(this).children("a").attr("href");
                if (sRef && sRef.includes(eref)) {
                    $(this).addClass("active");
                };
            });
        };
        var unbindIbMenu=function(el) {
            kendo.unbind(el);
            el.hide();
        };
        var onHideView=function(e) {
            // console.log("View hide called");
            try {
                e.sender.destroy();
            }
            catch (ev) {}
        };
        return router;

    }
);;