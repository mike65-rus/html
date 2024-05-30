define([
    'domReady!','router','kendo','services/sessionService','services/printMarginService',
    'services/domService',
    'services/proxyService',
    'dataSources/myIbDataSource','dataSources/ibScopeDataSource','viewModels/menuVm',
    'kendoCulture','kendoMessages','kendoHelpers','protoExtender',
    'myDatePicker'
], function(domReady,router,kendo,sessionService,printMarginService,domService,proxyService,
            myIbDataSource,ibScopeDataSource,menuVm,
            kendoCulture,kendoMessages,kendoHelpers,protoExtender) {
    var initialize = function() {
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

    };
    var onIbScopeReady=function() {
        proxyService.publish("initEnd");
        /*
        $("#init").html("Инициализация.Мои пациенты...");
        myIbDataSource.read({uid: localStorage['last_user'],outed: false});
        */
        proxyService.unsubscribe("ibScopeReady",onIbScopeReady);
    };
    var onInitEnd=function() {
        $("#init").hide();
        kendo.ui.progress($("#content"),false);
        proxyService.unsubscribe("initEnd",onInitEnd);
        //
        proxyService.subscribe("openIb",onOpenIb);
        //
        proxyService.subscribe("openIbPart",onOpenIbPart);
        router.start();
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