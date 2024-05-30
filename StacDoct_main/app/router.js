/**
 * Created by STAR_06 on 18.11.2015.
 */
define(['kendo.all.min','services/proxyService','viewModels/menuVm','alertify','dataSources/labDescrDataSource',
    'viewModels/labCommentWindowVm','viewModels/mainMenuVm','utils'],
    function(kendo,proxy,menuVm,alertify,dsLabDescr,labCommentWindow,mainMenu,utils){
        'use strict';
        var monGpWindowCheckInterval=null;
        var noCheckNavigationToNewIb=false;
        var oSuffix=null;
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
			if (aUrl[1]==="get-dnev") {
				proxy.publish("getDnev",aUrl[2]);
                e.preventDefault();
                return;
			}
            alertify.alert('Запрашиваемая страница "'+ e.url+'" не найдена!');
            e.preventDefault();
        };
        var onChange=function(e) {
            if (noCheckNavigationToNewIb) {
//                e.preventDefault();
//                return false;
            }
            var url=e.url;
            if (!utils.isViewer()) {
                if (url.indexOf("/my-pacients")<0) {
                    proxy.publish("hideYellowNotifications");
                }
                else {
                    proxy.publish("showYellowNotifications");
                }
            }
            if (url.startsWith("/ib/")) {
                if (noCheckNavigationToNewIb){
                    noCheckNavigationToNewIb=false;
                }
                else {
                    var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
                    var oldAskId=selIb.ask_id || "";
                    if (oldAskId) {
                        var newAskId=url.substr(4,26);
                        if (!(newAskId==oldAskId)) {
                            var data={count:0};
                            proxy.publish("askIdMayChange",data);   // subscribed in ibDocsListVm
                            if (data.count) {
                                var sMsg="В текущей ИБ возможно есть несохраненные документы!\n Перейти к новой ИБ?";
                                if (!window.confirm(sMsg)) {
                                    e.preventDefault();
                                    setTimeout(function() {
//                                        router.trigger("back");
//                                        router.trigger("back");
//                                        router.navigate("#:back");
                                        router.navigate("#:back");
                                        setTimeout(function(){
                                            ibHeaderOnScreen=true;
                                           router.navigate("#/ib-docs/"+oldAskId);
                                        },10);
                                    },10);
                                    return false;
                                }
                                else {
                                    noCheckNavigationToNewIb=true;
                                }

/*
                                e.preventDefault();
                                var sMsg="Попытка открыть другую историю болезни!<br>" +
                                    "Возможно в текущей ИБ есть не сохраненные документы!<br>"+
                                    "Нажмите <ОК> для перехода к новой ИБ<br>"+
                                    "Нажмите <Отмена> чтобы продолжить работу с документами текущей ИБ";
                                router.unbind("change");
//                                noCheckNavigationToNewIb=true;
                                kendo.confirm(sMsg)
                                    .done(function(){
                                        noCheckNavigationToNewIb=true;
                                        router.bind("change",onChange);
                                        router.navigate(url);
                                    })
                                    .fail( function(){
                                        router.bind("change",onChange);
  //                                      noCheckNavigationToNewIb=false;
                                        window.location.href=window.location.href;
//                                        proxy.publish("navigateCommand","#/ib-docs/"+oldAskId+"?_back");
                                    });
                                return false;
*/
                            }
                        }

                    }
                }
            }
            if (url.endsWith("}")) {
                var idx1=url.indexOf("{");
                if (idx1>=0) {
                    var sSuffix=url.substring(idx1);
                    sSuffix = decodeURI(sSuffix);
                    try {
                        oSuffix=JSON.parse(sSuffix);
                    }
                    catch (ex) {
                        oSuffix=null;
                        e.preventDefault();
                        return;
                    }
                    var url2=url.substring(0,idx1-1);
                    e.url="#"+url2;
//                    if (!(e.backButtonPressed)) {
                        router.replace(url2);
//                        proxy.publish("navigateCommand","#"+url2);
//                        history.replaceState()
//                    }
//                    oSuffix=null;
//                    return;
                }
            }
            if (url.startsWith("/ib-diags/")) {
                e.preventDefault();
                var sAskId=url.substr(10);
                if (sAskId && sAskId.length==26) {
                    proxy.publish("showDiagsList",{ask_id:sAskId});
                }
            }
            if (url.startsWith("/mon-gp-report-data")) {
                e.preventDefault();
                proxy.publish("showMonGpWindow");
            }
            if (url.endsWith("/adm-info")) {
                    e.preventDefault();
                    var monGpWindow=$("#iframe-doc-window-mon-gp");
                    if (monGpWindow.length) {
                        monGpWindowCheckInterval=setInterval(function() {
                            monGpWindow=$("#iframe-doc-window-mon-gp");
                            if (!monGpWindow.length) {
                                clearInterval(monGpWindowCheckInterval);
                                proxy.publish("showAdmInfo");
                            }
                        },100);
                    }
                    else {
                        proxy.publish("showAdmInfo");
                    }
            }
            if (url.endsWith("?_back")) {
//                e.preventDefault();
                var url=e.url;
                var url2=url.replace("?_back","");
                setTimeout(function() {
                    proxy.publish("navigateCommand","#"+url2);
                },10);

            }
        };
        var router = new kendo.Router({routeMissing:onRouteMissing,change:onChange}),
            layout = new kendo.Layout("<section id='content'><div id='init'></div></section><section id='content2'></section>");
        var ibRendered=false;
        var ibHeaderOnScreen=false;
        var extMessage="";
        layout.render($("#app"));
        // toDO add routes
        router.route("/all-recomendations", function(params) {
            require(['viewModels/allRecomendationsVm', 'text!views/allRecomendations.html',"text!views/emptyContent.html",
                    'kendo-template!templates/admInfoItem','kendo-template!templates/notificationsItem'],
                function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    activateMenuItem("all-recomendations");
                });
                if (params) {
                    setTimeout(function() {
                        proxy.publish("navigateToRecomendations",params);
                    },10);
                }
            });
        });
        router.route("/my-pacients", function() {
//            unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbIndex', 'text!views/myIndex.html',"text!views/emptyContent.html"], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    var $gridSelector=$("#grid");
                    hideGridIfLdo($gridSelector);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("my-pacients");
                    proxy.publish("navigateToMyIb");
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
                    var $gridSelector=$("#grid");
                    hideGridIfLdo($gridSelector);
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
		router.route("/transfer-to", function() {
    //        unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbPerevodIndex', 'text!views/perevodIndex.html','text!views/emptyContent.html'], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("transfer-to");
                });
            });
        });
		router.route("/transfer-from", function() {
    //        unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbPerevod2Index', 'text!views/perevod2Index.html','text!views/emptyContent.html'], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("transfer-from");
                });
            });
        });
		router.route("/observation", function() {
    //        unbindIbMenu($("#menu-ib-left"));
            require(['viewModels/myIbObservation', 'text!views/observation.html','text!views/emptyContent.html'], function(viewModel,view,view2) {
                loadView(null,view2,"#content2");
                loadView(viewModel, view, "#content",function() {
                    kendo.bind($("#grid").find(".k-grid-toolbar"), viewModel);
                    proxy.publish("ibHeaderOnScreen",false);
                    kendo.bind($("#ib-menu-details"),menuVm);
                    activateMenuItem("observation");
                });
            });
        });
        router.route("/ib/:id(/:suffix)", function(id,suffix) {
            if (!id || (id=="undefined")) {
                return;
            }
  //          var s=(suffix) ? decodeURI(suffix) : "";

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
                    /*
                    if (s) {
                        var oData={};
                        try {
                            oData=JSON.parse(s);
                            viewModel.set("suffix",oData);
                        }
                        catch (ex) {
                            console.log("Bad suffix on Url "+s);
                        }
                        // viewModel.isOpen=false;
                        //viewModel.set("isOpen",true);
                    }
                    */
                    if (oSuffix) {
                        viewModel.set("suffix",oSuffix);
                        oSuffix=null;
                    }
                });
            });
        });

        router.route("/ib-news/:id", function(id) {
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibNewsVm','text!views/ibNews.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                    });
                });
                activateMenuItem("/ib-news/");
            }
        });
        router.route("/ib-kdl/:id", function(id) {
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
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
        router.route("/ib-ldo/:id(/:page)", function(id,page) {
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibLdoVm','text!views/ibLdo.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update(page);
                        kendo.bind(view,viewModel);
                        setTimeout(function(){
                            kendo.bind("#GridRisToolbar",viewModel);
                            if (!utils.isViewer()) {
                                viewModel.ibRisQuery();
                            }
                        })

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
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
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
//        router.route("/ib-docs/:id", function(id) {
        router.route("/ib-docs/:id(/:suffix)", function(id,suffix) {
            var s=(suffix) ? decodeURI(suffix) : "";
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
                router.navigate("/ib/"+id+((s) ? ("/"+s) : ""));
            }
            else {
                require(['viewModels/ibDocsListVm','text!views/ibDocs.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        var data=null;
                        if ((extMessage) && (extMessage.message==="copyDoc") ) {
                            data=extMessage.messageData;
                            extMessage=null;
                        }
                        /*
                        if (s) {
                            var oData={};
                            try {
                                var oData=JSON.parse(s);
                            }
                            catch (ex) {
                                console.log("Bad suffix on Url "+s);
                            }
                            viewModel.set("suffix",oData);
                        }
                        */
                        if (oSuffix) {
                            viewModel.set("suffix",oSuffix);
                            oSuffix=null;
                        }
                        viewModel.update(data);

                    });
                });
                activateMenuItem("/ib-docs/");
            }
        });
		router.route("/ib-dnev/:id(/:suffix)", function(id,suffix) {
            var s=(suffix) ? decodeURI(suffix) : "";
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
                router.navigate("/ib/"+id+((s) ? ("/"+s) : ""));
            }
            else {
                require(['viewModels/ibDnevListVm','text!views/ibDnev.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        var data=null;
                        if ((extMessage) && (extMessage.message==="copyDoc") ) {
                            data=extMessage.messageData;
                            extMessage=null;
                        }
                        if (oSuffix) {
                            viewModel.set("suffix",oSuffix);
                            oSuffix=null;
                        }
                        viewModel.update(data);

                    });
                });
                activateMenuItem("/ib-dnev/");
            }
        });
        router.route("/ib-cases/:id", function(id) {
            var selIb=(proxy.getSessionObject('selectedIb')) || {} ;
            if ((!ibRendered)  || !(id==selIb.ask_id) || !(ibHeaderOnScreen)) {
                router.navigate("/ib/"+id);
            }
            else {
                require(['viewModels/ibCasesVm','text!views/ibCases.html'], function(viewModel,view) {
                    loadView(viewModel,view,"#content2",function() {
                        viewModel.update();
                    });
                });
                activateMenuItem("/ib-cases/");
            }
        });
        router.route("/arx-pacients", function(id) {
                require(['viewModels/ibArxiveVm','text!views/ibArxive.html',"text!views/emptyContent.html"],
                    function(viewModel,view,view2) {
                    loadView(null,view2,"#content2");
                    loadView(viewModel,view,"#content",function() {
                        proxy.publish("ibHeaderOnScreen",false);
                        viewModel.update();
                        kendo.bind($("#myib4"),viewModel);
                        kendo.bind($("#Grid4Toolbar"),viewModel);

                    });
                    activateMenuItem("/arx-pacients");
                });
        });
        router.route("/services", function(id) {
            require(['viewModels/servicesVm','text!views/services.html',"text!views/emptyContent.html"],
                function(viewModel,view,view2) {
                    loadView(null,view2,"#content2");
                    loadView(viewModel,view,"#content",function() {
                        proxy.publish("ibHeaderOnScreen",false);
                        kendo.bind($("#services-page"),viewModel);

                    });
                    activateMenuItem("/services");
                });
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

        var deactivateAllMenuItems=function() {
            $("ul.main-menu>li").each(function(index){
                $(this).removeClass("active");
            });
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
        var onIbHeaderOnScreen=function(bOnOff) {
            ibHeaderOnScreen=bOnOff;
        };
        var onExtMessage=function(data) {
            if (data.message==="copyDoc") {
                var selIb = proxy.getSessionObject("selectedIb");
//                if ((!ibRendered) || !(ibHeaderOnScreen)) {
                    router.navigate("/ib/" + selIb.ask_id);

//                }
                var intervalId = setInterval(function () {
                    if (ibRendered || ibHeaderOnScreen) {
                        clearInterval(intervalId);
                        extMessage=data;
                        setTimeout(function () {
                            router.navigate("/ib-docs/" + selIb.ask_id);
                        }, 500);
                    }
                }, 500);
            }
        };
        var onGetLabComment=function(data) {
            var ds=dsLabDescr;
            ds.read({id:data.commentId}).then(function() {
                if (ds._data.length) {
                    var item=ds._data[0];
                    var s1=item.to_html;
                    var s2 = s1.split("<BODY")[1].split(">").slice(1).join(">").split("</BODY>")[0];
                    labCommentWindow.showWindow({pokazName:data.name,
                        commentName:item.name,commentHtml:s2,srcHtml:item.hsource});
//                    kendo.alert(s2);
                }
            });
        };
        var hideGridIfLdo=function($gridSelector) {
            if ((JSON.parse(sessionStorage['last_user_role']).rolecode=="VRACH_LDO")) {
                $gridSelector.find("div.k-grid-header").hide();
                $gridSelector.find("div.k-grid-content").hide();
                $gridSelector.find("div.k-grid-pager").hide();
                try {
                    $("#ib-selector-mypac").focus();
                }
                catch(e) {

                }
            }
        };
        proxy.subscribe("navigateCommand",onNavigateCommand);
        proxy.subscribe("ibHeaderOnScreen",onIbHeaderOnScreen);
        proxy.subscribe("extMessage",onExtMessage);
        proxy.subscribe("getLabComment",onGetLabComment);
        return router;

    }
);