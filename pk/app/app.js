define([
    'domReady!','backgroundLoader','router','alertify','kendo.all.min','services/sessionService','services/printMarginService',
    'services/domService',
    'services/proxyService',
    'kendoCulture','kendoMessages','kendoHelpers','protoExtender',
    'viewModels/aboutVm','viewModels/mainMenuVm','services/initService','viewModels/patientCardVm'
], function(domReady,backgroundLoader,router,alertify,kendo,sessionService,printMarginService,domService,proxy,
            kendoCulture,kendoMessages,kendoHelpers,protoExtender,aboutVm,mainMenuVm,initService,patientCard) {
    'use strict';
    var msgListener=function(e) {
        var data= e.data;
//        console.log(data);
        if (!(window.location.origin== e.origin)) {
            return;
        }
        if (data.message==="copyDoc") {
            var selIb=proxyService.getSessionObject("selectedIb");
            if (selIb) {
                var msgData=data.messageData;
                if (msgData) {
                    if (msgData.global_vn === selIb.global_vn) {
                        proxyService.publish("extMessage",data);
//                        router.navigate("/ib-docs/" + selIb.ask_id);
                        e.source.postMessage({message: "copyDocResponse"}, e.origin);
                    }
                    else {
                        alertify.alert("Текущий пациент не совпадает с копируемым!", function (ev) {
                            e.source.focus();
                        });
                    }
                }
            }
            else {
                alertify.alert("Текущий пациент не выбран!",function(ev) {
                        e.source.focus();
                });
            }
        }
    };
    var initialize = function() {
        kendo.culture("ru-RU");
        sessionService.showSessionDelay();
        aboutVm.showInitWindow();
        // TODO: initialial ajax calls
        proxy.subscribe("initCompleted",onInitCompleted);
        proxy.subscribe("initError",onInitError);

        initService.start();
        /*
        var readyDiv=$("#ready-div");
        $(readyDiv).css("background-color","red");
        kendo.ui.progress($("#content"),true);
        kendo.culture("ru-RU");
        sessionService.initialize();
        printMarginService.initialize();
        domService.initialize();
        proxyService.subscribe("ibScopeReady",onIbScopeReady);
        proxyService.subscribe("initEnd",onInitEnd);
        $("#init").html("Инициализация.Права пользователя...");
        ibScopeDataSource.read();
        kendo.bind($("#ib-menu"),menuVm);
        window.name="ru.pgb2.stac.ARM";
        if (window.addEventListener){
            window.addEventListener("message",msgListener,false);
        }
        else {
            attachEvent("onmessage", msgListener);
        }
        */
    };
    var onIbScopeReady=function() {
        proxy.publish("initEnd");
        /*
        $("#init").html("Инициализация.Мои пациенты...");
        myIbDataSource.read({uid: localStorage['last_user'],outed: false});
        */
        proxy.unsubscribe("ibScopeReady",onIbScopeReady);
        var readyDiv=$("#ready-div");
        $(readyDiv).css("background-color","Yellow");
    };
    var onInitCompleted=function() {
//        proxyService.publish("initCompleted");  // initialization ended
        mainMenuVm.initMenu();
        router.start();
        /*
        window.addEventListener("resize",function(e) {
             proxy.publish("windowResize");  // subscribed in patientCardVm
        })
        */
        /*
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
        */
    };
    var onInitError=function(e) {   // e=error object from dataSource
        var wndDiv=$(document.body).append("<div id='initAjaxErrorDialog'/>");
        var msg=e.errors;
        var url="";
        try {
            url = e.sender.transport.options.read.url;
        }
        catch (ex) {
        }
        wndDiv=$("#initAjaxErrorDialog");
        $(wndDiv).kendoConfirm({
            content: msg+"<br>url: "+url,
            messages:{
                okText: "Повторить",
                cancel: "Игнорировать"
            }
        }).data("kendoConfirm").toFront().result.
        done(function() {
            initService.start();
//                    $(wndDiv).data("kendoConfirm").destroy();
                    $(wndDiv).remove();
        }).fail(function(){
//                    $(wndDiv).data("kendoConfirm").destroy();
                   $(wndDiv).remove();
/*            setTimeout(function(){
                window.location.reload("default.aspx?action=pk");
            },100); */
            proxy.publish("initCompleted");
        });

    };
    var onOpenIbPart=function(data) {
        router.navigate("/"+data.part+"/"+data.ask_id);
    };
    var onOpenIb=function(data) {
            router.navigate("/ib/"+data.ask_id);
    };
    window.openInNewTab=function(url) {
        var win = window.open(url, '_blank');
        win.focus();
    };
    return {
        initialize: initialize
    };
});