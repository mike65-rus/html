define([
    'domReady!','backgroundLoader','router','alertify','kendo.all.min','services/sessionService','services/printMarginService',
    'services/domService',
    'services/proxyService',
    'utils',
    'kendo-template!templates/sesWarningTemplate',
    'dataSources/getStacModeDataSource',
    'dataSources/myIbDataSource',
    'dataSources/forMonGpDataSource',
    'dataSources/ibScopeDataSource',
    'dataSources/userRolesListDataSource',
    'dataSources/allUsersDataSource',
    'dataSources/allOtdelsDataSource',
    'dataSources/allShefsDataSource',
    'dataSources/allRecomListDataSource',
    'viewModels/mainMenuVm',
    'viewModels/menuVm',
    'viewModels/myIbIndex',
    'viewModels/myIbOutIndex',
    'viewModels/ibArxiveVm',
    'viewModels/admInfoWindowVm',
    'services/cadesService',
    'kendoCulture','kendoMessages','kendoHelpers','protoExtender','viewModels/ibDiagsListVm', 'viewModels/monGpWindowVm',
    'myDatePicker'
], function(domReady,backgroundLoader,router,alertify,kendo,sessionService,printMarginService,domService,proxyService,utils,
            editTemplateId,getStacModeDs,
            myIbDataSource,forMonGpDataSource,
            ibScopeDataSource,uRolesDs,allUsersDs,allOtdelsDs,allShefsDs,allRecomsDs,mainMenuVm,menuVm,
            myIbIndex,outedIndex,arxiveIndex, admInfoWindow,
            cadesService,
            kendoCulture,kendoMessages,kendoHelpers,protoExtender,diagsListVm,monGpVm) {
    'use strict';
    utils.setStacMode();
    var allRecomsTimeout=null;
    var roleList=["ADMIN","NACH_MED","ZAV_OTD","VRACH_OTD","VRACH_ORIT","VRACH_DEGURANT","VRACH_LDO"];
    var roleListWithoutRecomendations=["ADMIN","VRACH_ORIT","VRACH_DEGURANT","VRACH_LDO"];
//    var roleListWithoutRecomendations=["ADMIN","NACH_MED","ZAV_OTD","VRACH_OTD","VRACH_ORIT","VRACH_DEGURANT","VRACH_LDO"];
    var readRecomsTimeout=15;
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
    var clearAllRecomendations=function() {
        while (allRecomsDs.total()) {
            allRecomsDs.remove(allRecomsDs.at(allRecomsDs.total()-1));
        }
    };
    var onUserRolesListChange=function(e) {
        var roleCode=this.value();
        sessionStorage['last_user_role']=JSON.stringify({uid:localStorage['last_user'],rolecode:roleCode});
        /*
        if ((roleListWithoutRecomendations.indexOf(roleCode)>=0)) {
                clearAllRecomendations();
        }
        else {
            allRecomsTimeout=setTimeout(function() {
                refreshAllRecomendations();
            },1000*readRecomsTimeout);
        }
        */
        ibScopeDataSource.read({role:roleCode}).then(function() {
            setTimeout(function(){
                proxyService.publish("ibScopeChanged");
            },500);
        });
    };
    var getMaxUserRole=function(data) {
        var sRet="";
        for (var i=0;i<roleList.length;i++) {
            for (var j=0; j<data.length;j++) {
                var code=data[j].rolecode;
                if (code==roleList[i]) {
                    sRet=code;
                    return sRet;
                }
            }
        }
    };
    var refreshAllRecomendations=function() {
        return;
        var lastUserRoleJson=sessionStorage['last_user_role'];
        if (lastUserRoleJson) {
            var oLastRole=JSON.parse(lastUserRoleJson);
            if (Number(oLastRole.uid)==Number(localStorage['last_user'])) {
                if ((roleListWithoutRecomendations.indexOf(oLastRole.rolecode)<0)) {
                    if (allRecomsTimeout) {
                        clearTimeout(allRecomsTimeout);
                    }
                   allRecomsDs.read();
                }
            }
        }
    };
    var initUserRolesList=function(el) {
        if (!el.length) {
            console.log("id of userRolesListElement not found in DOM!");
            return;
        }
        if (utils.isViewer()) {
            return;
        }
        $(el).closest("span").show();
        var list=$(el).kendoDropDownList({dataSource:uRolesDs,autoBind:false,
            dataTextField:"rolename", dataValueField:"rolecode",
            valuePrimitive:true
        }).data("kendoDropDownList");
        list.bind("change",onUserRolesListChange);
        var roleCode=uRolesDs._data[0].rolecode;
        var lastUserRoleJson=sessionStorage['last_user_role'];
        if (lastUserRoleJson) {
            var oLastRole=JSON.parse(lastUserRoleJson);
            if (Number(oLastRole.uid)==Number(localStorage['last_user'])) {
                for (var i=0;i<uRolesDs._data.length;i++) {
                    if (oLastRole.rolecode==uRolesDs._data[i].rolecode) {
                        roleCode=uRolesDs._data[i].rolecode || uRolesDs._data[0].rolecode;
                    }
                }
            }
        }
        else {
            roleCode=getMaxUserRole(uRolesDs._data);
        }
//        sessionStorage['last_user_role']=JSON.stringify({uid:localStorage['last_user'],rolecode:roleCode});
        list.value(roleCode);
        list.trigger("change");
        list.refresh();
        /*
        allRecomsTimeout=setTimeout(function() {
            refreshAllRecomendations();
        },1000*readRecomsTimeout);
        */
    };
    var initialize = function() {
        getStacModeDs.read().then(function() {
            $("#main-monitor").removeClass("no-display");
            $("#monitor-state").removeClass("no-display");
            kendo.bind($("#main-monitor"),mainMenuVm);
            if (("#mobile-header").length) {
                kendo.bind($("#mobile-header"),mainMenuVm);
            }
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
            allUsersDs.read();
            allOtdelsDs.read({department:utils.getDepartmentForOtdels().toString()});
            allShefsDs.read({department:utils.getDepartmentForOtdels().toString()});
            uRolesDs.read().then(function() {
                initUserRolesList($("#current_user_role"));

                window.name="ru.pgb2.stac.ARM";
                if (window.addEventListener){
                    window.addEventListener("message",msgListener,false);
                }
                else {
                    attachEvent("onmessage", msgListener);
                }

                cadesService.checkCades($("#cert_thumb").text());
                $("#cert_thumb").text("");
            });

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
        if (!(utils.isViewer())) {
            allUsersDs.read().
                then(function(){
                    kendo.bind($("#ib-menu"),menuVm);
                    proxyService.publish("openSocket", {
                        url: "ws://localhost:8089/wstest",
                        greetings: {
                            user_id: Number(localStorage.getItem("last_user")),
                            user_connected: true
                        }
                    }); // subscribed in mainMenu
                    $("#kendo-notification").kendoNotification({
                        hideOnClick:true,
                        autoHideAfter:0,
                        animation:false,
                        stacking:"left",
                        position:{
                            top:null,
                            left:null,
                            pinned:true,
                            bottom:10,
                            right:10
                        },
                        templates: [{
                            type: "warning",
                            template: $("#"+editTemplateId).html()
                        }]
                    })
            });

        }
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

        proxyService.publish("navigateCommand","#/mon-gp-report-data");

    };
    var onOpenIbPart=function(data) {
        router.navigate("/"+data.part+"/"+data.ask_id);
    };
    var onOpenIb=function(data) {
        if (data.suffix) {
            if (data.suffix.goto) {
                router.navigate("/ib/"+data.ask_id+"/"+JSON.stringify(data.suffix));
            }
            else {
                router.navigate("/ib/"+data.ask_id);
            }
        }
        else {
            router.navigate("/ib/"+data.ask_id);
        }
    };
    window.openInNewTab=function(url) {
        var win = window.open(url, '_blank');
        win.focus();
    };
    return {
        initialize: initialize
    };
});