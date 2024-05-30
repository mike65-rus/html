/**
 * Created by STAR_06 on 18.11.2015.
 */
define(['kendo.all.min','services/proxyService','viewModels/menuVm','alertify'],function(kendo,proxy,menuVm,alertify){
        'use strict';

        var onRouteMissing= function (e) {
/*            require(['text!views/pageNotFound.html'], function(view) {
                loadView(null,view,"",function() {
                    $("#pageNotFound").html(e.url);
                });
            });
*/
            var aUrl= e.url.split("/");
            if ((aUrl.length==6) && (aUrl[1].toLowerCase()==="ib-news-content")) {
                var askId=aUrl[2],sysId=aUrl[3],ext3=aUrl[4],idDoc=aUrl[5];
                if (Number(sysId)===1) {
                    require(['viewModels/ibLabVm'],function(viewModel){
                        viewModel.set("currentExt3",ext3);
                    });
                }
                if (Number(sysId)===2) {
                    require(['viewModels/ibLdoVm'],function(viewModel){
                        viewModel.set("currentExt3",ext3);
                    });
                }
//                alertify.alert("askId="+askId+" sysId="+sysId+" ext3="+ext3+" iddoc="+idDoc);
                e.preventDefault();
                return;
            }
            if (aUrl[1]==="get-doc") {
                proxy.publish("getDocument",aUrl[2]);
                e.preventDefault();
                return;
            }
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
        router.route("/ib-kdl/:id", function(id) {
            if (!ibRendered) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibLabVm','text!views/ibLab.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                        kendo.bind(view,viewModel);

                    });
                });
                activateMenuItem("/ib-kdl/");
            }
        });
        router.route("/ib-ldo/:id", function(id) {
            if (!ibRendered) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibLdoVm','text!views/ibLdo.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                        kendo.bind(view,viewModel);

                    });
                });
                activateMenuItem("/ib-ldo/");
            }
        });
        /*
        router.route("/ib-news-content/:id/:sysId/:ext3",function(id,sysId,ext3){
            alertify.alert("id="+id+" sysId="+sysId+" ext3="+ext3);
            event.preventDefault();
        });
        */
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
        router.route("/about", function() {
            require(['viewModels/aboutVm', 'text!views/about.html','text!views/emptyContent.html'], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#about"),viewModel);
                    activateMenuItem("about");
                });
            });
        });
        router.route("/ib-docs/:id", function(id) {
            if (!ibRendered) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibDocsListVm','text!views/ibDocs.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                        kendo.bind($("#ibDocsGrid"),viewModel);
                        kendo.bind($("#ibDocs_Toolbar"),viewModel);

                    });
                });
                activateMenuItem("/ib-docs/");
            }
        });
        router.route("/ib-cases/:id", function(id) {
            if (!ibRendered) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibCasesVm','text!views/ibCases.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                        kendo.bind($("#grid"),viewModel);
                        kendo.bind($("#toolbar-cases"),viewModel);

                    });
                });
                activateMenuItem("/ib-cases/");
            }
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
        var onNavigateCommand= function(sPath) {
            router.navigate(sPath);
        };
        proxy.subscribe("navigateCommand",onNavigateCommand);
        return router;

    }
);;