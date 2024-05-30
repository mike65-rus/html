define([
    'domReady!','backgroundLoader','router','kendo.all.min','services/sessionService','services/printMarginService',
    'services/domService',
    'services/proxyService',
    'dataSources/getStacModeDataSource',
    'dataSources/myIbDataSource','dataSources/ibScopeDataSource','viewModels/menuVm','viewModels/ibDiagsListVm',
    'kendoCulture','kendoMessages','kendoHelpers','protoExtender',
    'myDatePicker'
], function(domReady,backgroundLoader,router,kendo,sessionService,printMarginService,domService,proxyService,
            getStacModeDs,
            myIbDataSource,ibScopeDataSource,menuVm,diagsListVm,
            kendoCulture,kendoMessages,kendoHelpers,protoExtender) {
    'use strict';
    var msgListener=function(e) {
        var data= e.data;
//        console.log(data);
        if (!(window.location.origin== e.origin)) {
            return;
        }
        if (data.message==="copyDocResponse") {
            e.source.focus();
            window.close();
        }
    };
    var initialize = function() {
        getStacModeDs.read().then(function() {

            kendo.ui.progress($("#content"), true);
            kendo.culture("ru-RU");
            sessionService.initialize();
            printMarginService.initialize();
            domService.initialize();
            proxyService.subscribe("ibScopeReady", onIbScopeReady);
            proxyService.subscribe("initEnd", onInitEnd);
//        ibScopeDataSource.read();
            kendo.bind($("#ib-menu"), menuVm);
            window.isViewer = true;
            if (window.addEventListener) {
                window.addEventListener("message", msgListener, false);
            }
            else {
                attachEvent("onmessage", msgListener);
            }
            //
            var close = $("#close-session");
            $(close).attr("title", "Закрыть");
            $(close).text("Закрыть");
            $(close).click(function (e) {
                window.close();
                e.preventDefault();
            });
            //
            router.start();
        });
    };
    var onIbScopeReady=function() {
        proxyService.publish("initEnd");
        /*
        $("#init").html("Инициализация.Мои пациенты...");
        myIbDataSource.read({uid: localStorage['last_user'],outed: false});
        */
        proxyService.unsubscribe("ibScopeReady",onIbScopeReady);
        var readyDiv=$("#ready-div");
        $(readyDiv).css("background-color","Yellow");
    };
    var onInitEnd=function() {
        $("#init").hide();
        kendo.ui.progress($("#content"),false);
        proxyService.unsubscribe("initEnd",onInitEnd);
        //
         proxyService.subscribe("openIb",onOpenIb);
        //
        proxyService.subscribe("openIbPart",onOpenIbPart);
        //
        router.start();
        backgroundLoader.start();
    };
    var onOpenIbPart=function(data) {
        router.navigate("/"+data.part+"/"+data.ask_id);
    };
    var onOpenIb=function(data) {
        router.navigate("/ib/"+data.ask_id);
    };
    return {
        initialize: initialize
    };
});