/**
 * Created by 1 on 30.11.2015.
 */
define(["kendo.all.min",'dataSources/ibRecomByIdDataSource','dataSources/allRecomListDataSource', 'models/allRecomModel',
        'dataSources/allLdoListDataSource',
        'dataSources/allKdlListDataSource',
        'dataSources/allUsersDataSource',
        'dataSources/adminInfoDataSource',
        'models/adminInfoModel',
        'dataSources/notificationsDataSource',
        'models/notificationsModel',
        'dataSources/ibPlanOutDataSource',
        'models/ibPlanOutModel',
        'models/allIssledModel',
        'services/wssService',
        'services/proxyService',
        'services/sessionService',
        'utils','viewModels/mobileCodeVm'],
    function (kendo,ibRecomByIdDs,allRecomsDs,allRecomsModel,allLdoListDs,allKdlListDs,allUsersDs,adminInfoDs,adminInfoModel,
              notificationsDs,notificationsModel,
              ibPlanOutDs,ibPlanOutModel,
              allIssledModel,SocketServer,proxy,session,utils,mobileCodeVm) {
        'use strict';
        var aNotificationData=[];
        var hrefToRecomendations="#/all-recomendations?q=1";
        var hrefToNotifications="#/all-recomendations?q=5";
        var hrefToToAdmInfo="#/adm-info";
        var socketDataCount=0;
        var viewModel;
        var sockets=[];
        var lastMsgTime=null;
        var lastNotifications=kendo.stringify([]);
        var roleListWithoutRecomendations=["VRACH_ORIT","VRACH_DEGURANT","VRACH_LDO"];
        if (utils.isMobileDevice()) {
            roleListWithoutRecomendations=["VRACH_ORIT","VRACH_DEGURANT","VRACH_LDO","ADMIN","NACH_MED","ZAV_OTD","VRACH_OTD"];
        }
        viewModel= new kendo.data.ObservableObject({
            isAdmInfoVisible:false,
            isAllRecomendationsVisible: false,
            allRecomendationsCount:0,
            isMonitorVisible:false,
            allLdoCont:0,
            allKldCount:0,
            notificationsImportantCount:0,
            notificationsOthersCount:0,
            wssIconClass:"fa fa-ban",
            wssButtonTitle:"Монитор выключен или недоступен",
            wssConnected:false,
            isBusy:false,
            userId:null,
            mobileButtonClick: function(e) {
                proxy.publish("getMobileCode"); // subscribed in mobileCodeVm.js
//                kendo.alert("Mobile button clicked!");
            },
            kendoNotificationButtonClick: function(e) {
                var items=[];
                var btn=e.target;
                var $content=$(btn).closest("div");
                var noteId=$content.attr("data-item-id");
                if (noteId) {
                    items.push(Number(noteId));
                    proxy.publish("updateNotificationsViewDateTime",{items:items});
                }
            },
            monitorButtonClick: function(e) {
                var href=$(e.target).attr("rel");
                if (!href) {
                    href=$(e.target).closest("button").attr("rel");
                }
                if (href) {
                    if (viewModel.get("wssConnected")) {
                        if (sockets.length) {
                            var wss=sockets[0];
                            var msg={user_name:getUserName(Number(localStorage["last_user"])),
                                message:"Monitor button clicked: href="+href};
                            wss.send(msg);
                        }
                    }
                    proxy.publish("navigateCommand",href);
                }
            },
            monitorStateButtonClick: function(e) {
                if (!viewModel.wssConnected) {
                    if (sockets.length) {
                        var wss=sockets[0];
                        sockets=[];
                        viewModel.set("isBusy",true);
//                        onOpenSocket({url:wss.url,greetings:wss._handShake});
                    }
                }
                else {
                    var userId = Number(localStorage["last_user"]);
                    if (sockets.length) {
                        if (userId==1) {
                            // for Alekseev
                            kendo.prompt("Enter valid user id if you want see that user messages",viewModel.get("userId")).
                            then(function (data) {
                                var dataItem=allUsersDs.get(Number(data));
                                if (dataItem) {
                                    kendo.alert(dataItem.name);
                                    viewModel.set("userId",Number(data));
                                }
                            });
                        }
                        else {
                            var wss = sockets[0];
                            var msg="<strong>Монитор событий</strong> <br>";
                            msg= msg+ "Подключен к серверу <strong>" + wss.url+"</strong>";
                            msg = msg + "<br>";
                            msg = msg + "Время последнего сообщения <strong>" + kendo.toString(lastMsgTime, "HH:mm:ss")+"</strong>";
                            kendo.alert(msg);
                        }
                    }
                }
            }
        });
        var getUserName=function(iUserId) {
            var ds=allUsersDs;
            return ds.get(iUserId).name || "";
        };
        var onModelChange=function(e) {
            var field=e.field;
            if (field=="userId") {
                // may be change by Alekseev
                if (viewModel.wssConnected) {
                    if (sockets.length) {
                        var wss=sockets[0];
                        sockets=[];
                        wss.close();
                        setTimeout(function() {
                            var greetings=   {
                                user_id: viewModel.userId,
                                    user_connected: true
                            }
                            onOpenSocket({url:wss.url,greetings:greetings});
                        },1000);
                    }
                }
            }
            if (field=="wssConnected") {
                if (viewModel.wssConnected) {
                    viewModel.set("wssIconClass","fa fa-wifi");
                    viewModel.set("wssButtonTitle","Монитор активен");
                }
                else {
                    viewModel.set("wssIconClass","fa fa-ban");
                    viewModel.set("wssButtonTitle","Монитор не активен или отключен");
                    viewModel.set("notificationsImportantCount",0);
                }
            }
            if (field=="isBusy") {
                if (viewModel.isBusy) { // имитация 3-х секундной работы над поступившими данными
                    var oldIconClass=viewModel.get("wssIconClass");
                    viewModel.set("wssIconClass",oldIconClass+" fa-spin");
                    var iTimeout=setTimeout(function() {
                        viewModel.set("isBusy",false);
                        viewModel.set("wssIconClass",oldIconClass);
                        clearTimeout(iTimeout);
                    },1000*3);
                }
            }
            if (field=="notificationsImportantCount") {
                if (!viewModel.get("notificationsImportantCount")) {
                    var $btn=$("#notify-monitor-btn");
                    if ($btn.length) {
                        var $i=$btn.find("i").first();
                        $i.removeClass("fa-pulse");
                        $btn.removeClass("monitor-button-yellow");
                    }
                }
                else {
                    var $btn=$("#notify-monitor-btn");
                    if ($btn.length) {
                        var $i = $btn.find("i").first();
                        $i.removeClass("fa-pulse");
                        $i.addClass("fa-pulse");
                        $btn.addClass("monitor-button-yellow");
                    }
                }
            }
        };
        var createNoti=function() {
            var notify=$("#kendo-notification-ib-plan-out").kendoNotification({
                autoHideAfter:0,
                button:true,
                animation: {
                    open: {
                        effects: "slideIn:left"
                    },
                    close: {
                        effects: "slideIn:left",
                        reverse: true
                    }
                },
                position: {
                    top:0,
                    right:0
                }
            }).data("kendoNotification");
            return notify;
        };

        var onAdminInfo=function(myData) {
            var admInfoDate=new Date(1975,0,1);
            var allDs=adminInfoDs;
            var aDel = [];
            for (var i = 0; i < allDs.total(); i++) {
                aDel.push(allDs.at(i));
            }
            for (var i = 0; i < aDel.length; i++) {
                allDs.remove(aDel[i]);
            }
            for (var i = 0; i < myData.length; i++) {
                var parItem=myData[i];
                var dataItem = new adminInfoModel;
                dataItem.set("file",parItem.file || '');
                var d=kendo.parseDate(parItem.message.date);
                var d2=d-(3*(1000*60*60));  // time zone !!!
                dataItem.set("date",new Date(d2));
                dataItem.set("body",parItem.message.body || "");
                dataItem.set("theme",parItem.message.theme || "");
                allDs.pushCreate(dataItem);
                try {
                    allDs.getByUid(dataItem.uid).dirty = false;
                }
                catch (ex) {

                }
                if (dataItem.date>admInfoDate) {
                    admInfoDate=dataItem.date;
                }
            }
            return {date:admInfoDate,length:myData.length};
        };
        var showAnimation=function(e) {
            var $mainSection=$("#content");
            if ($mainSection.length) {
                var $div=$mainSection.closest("div");
                if ($div.length) {
                    var effect = kendo.fx($div).zoom("out").duration(2000).startValue(1).endValue(0.1);
                    effect.play().then(function() {
                        var effect = kendo.fx($div).zoom("in").duration(2000).startValue(0.1).endValue(1);
                        effect.play();
                    });
                }
            }
        };
        var showButtonAnimation=function() {
            var effect = kendo.fx("#notify-monitor-btn").zoom("in").duration(4000).startValue(1).endValue(5);
            effect.play().then(function(){
                    effect.reverse()
                }
            );
        };

        var onIbPlanOut=function(data) {    // 15.10.2020 - планируемая выписка без эпикризов
            var allDs=ibPlanOutDs;
            var aDel = [];
            var noVypNeeded=0;
            for (var i = 0; i < allDs.total(); i++) {
                aDel.push(allDs.at(i));
            }
            for (var i = 0; i < aDel.length; i++) {
                allDs.remove(aDel[i]);
            }

            viewModel.set("notificationsImportantCount",0);
            viewModel.set("notificationsOthersCount",0);
            var $btn=$("#notify-monitor-btn");
            if (!$btn.length) {
                return;
            }
            if (!data.length) {
                var notify=$("#kendo-notification-ib-plan-out").data("kendoNotification");
                if (notify) {
                    notify.hide();
                }
                return;
            }
            if (data.length) {
                var hour=Number(kendo.toString(new Date(),"HH"));
                var notificationProperty="notificationsImportantCount";
                if ((hour>9) && (hour<12)) {
                    notificationProperty="notificationsOthersCount";
                }
                var href=window.location.href || "";
                var bOnAskId=false;
                for (var i=0;i<data.length;i++) {
                    var parItem=data[i];
                    var dataItem = new ibPlanOutModel;
                    dataItem.set("id",parItem.ID);
                    dataItem.set("ask_id", parItem.ASK_ID.trim());
                    dataItem.set("niib",parItem.NIIB || 1);
                    dataItem.set("fio",parItem.FIO);
//                    dataItem.set("date_ask",kendo.parseDate(parItem.DATE_ASK.substr(0,10),"yyyy-MM-dd"));
//                    dataItem.set("date_out",kendo.parseDate(parItem.DATE_OUT.substr(0,10),"yyyy-MM-dd"));
                    dataItem.set("date_ask",kendo.parseDate(parItem.DATE_ASK,"yyyy-MM-ddTHH:mm:ss.000zzz"));
                    dataItem.set("date_out",kendo.parseDate(parItem.DATE_OUT,"yyyy-MM-ddTHH:mm:ss.000zzz"));
                    dataItem.set("notification",parItem.NOTIFICATION || "ТРЕБУЕТСЯ сформировать выписной эпикриз");
                    dataItem.set("ext1",'{"goto":"ib-docs","doc_id":1,"doc_sub":1}');
                    dataItem.set("is_vyp",parItem.IS_VYP || 0);
                    if (dataItem.get("is_vyp")) {
                        dataItem.set("notification","");
                        dataItem.set("ext1",'{"goto":"ib-docs"}');
                        noVypNeeded++;
                    }
                    allDs.pushCreate(dataItem);

                    if (href.indexOf(dataItem.ask_id)>=0) {
                        bOnAskId=true;
                        notificationProperty="notificationsOthersCount";
                    }
                    try {
                        allDs.get(dataItem.id).dirty = false;
                    }
                    catch (ex) {
                    }
                }
                viewModel.set(notificationProperty,data.length-noVypNeeded);
                var notify=$("#kendo-notification-ib-plan-out").data("kendoNotification");
                if (!notify) {
                    notify=createNoti();
                }
                notify.hide();
                if ((viewModel.notificationsImportantCount || 0) + (viewModel.notificationsOthersCount || 0)) {
                    if (viewModel.get("isMonitorVisible")) {
                        if (!bOnAskId) {
                            if ((href.indexOf("/ib-docs")<0) && (href.indexOf(hrefToNotifications)<0)) {
                                showButtonAnimation();
                                notify.show("<a class='"+
                                    ((viewModel.notificationsImportantCount) ? "a-notification-warning":"a-notification-info")+
                                    "' href='"+hrefToNotifications+"'>Заполните выписные <div>эпикризы!</div></a>",
                                    (viewModel.notificationsImportantCount) ? "warning":"info");
                            }
                        }
                    }
                }
            }
        };
        var onNotifications=function(data) {    // 15.10.2020 - obsolete
            // return;
//            console.log(data);
            var kendoNotificationText="";
            lastMsgTime=new Date();
            viewModel.set("wssConnected",true);
            viewModel.set("notificationsImportantCount",0);
            viewModel.set("notificationsOthersCount",0);
            viewModel.set("isBusy",true);
            viewModel.set("isMonitorVisible",false);
            var userId = (viewModel.get("userId") || 0);
            var uIdCur=Number(localStorage['last_user']);
            var allDs=notificationsDs;
            var aDel = [];
            for (var i = 0; i < allDs.total(); i++) {
                aDel.push(allDs.at(i));
            }
            for (var i = 0; i < aDel.length; i++) {
                allDs.remove(aDel[i]);
            }
            var kendoNotificationWidget=$("#kendo-notification").getKendoNotification();
            if (kendoNotificationWidget) {
                var elements = kendoNotificationWidget.getNotifications();
                elements.each(function () {
                    $(this).parent().remove();
                });
            }
            for (var i=0;i<data.length;i++) {
                var parItem=data[i];
                var forUser=parItem.UID;
                if (!(forUser==uIdCur)) {
                    continue;
                }
                var dataItem = new notificationsModel;
                dataItem.set("ask_id", parItem.ASK_ID.trim());
                dataItem.set("id",parItem.ID);
                dataItem.set("curdatetime",parItem.CURDATETIME);
                dataItem.set("important",parItem.IMPORTANT);
                dataItem.set("niib",parItem.NIIB);
                dataItem.set("patient_name",parItem.PATIENT_NAME);
                dataItem.set("sender",parItem.SENDER);
                dataItem.set("subsystem",parItem.SUBSYSTEM);
                dataItem.set("sys_id",parItem.SYS_ID);
                dataItem.set("text",parItem.TEXT);
                dataItem.set("uid1",parItem.UID);
                dataItem.set("uid2",parItem.UID2);
                dataItem.set("viewdatetime",parItem.VIEWDATETIME);
                if (!dataItem.get("viewdatetime")) {
                    if ((dataItem.get("important")>0)) {
                        var href=window.location.href;
                        viewModel.set("notificationsImportantCount",viewModel.get("notificationsImportantCount")+1);
                        kendoNotificationText="<span data-item-id='"+dataItem.get("id").toString()+"'><strong>"+dataItem.get("patient_name")+" № "+dataItem.get("niib")+"</strong></span>"+
                            "<div style='white-space:pre-wrap;height:70px;overflow-y:scroll' data-item-id='"+
                            dataItem.get("id").toString()+"'>"+
                            dataItem.get("text")+
                            "<p style='text-align: center'>"+
                            "<button class='btn btn-warning' data-bind='events:{click:kendoNotificationButtonClick}'>Сообщение прочитано</button></p>"+
                            "</div>";

//                        if ((href.indexOf("#/my-pacients")>=0)) {
                            kendoNotificationWidget.warning(kendoNotificationText);
//                        }
                    }
                    else {
                        viewModel.set("notificationsOthersCount",viewModel.get("notificationsOthersCount")+1);
                    }
                }
                //
                allDs.pushCreate(dataItem);
                try {
                    allDs.getByUid(dataItem.uid).dirty = false;
                }
                catch (ex) {

                }
            }
            allDs.sort({field: "important", dir: "desc"},{field:"curdatetime",dir:"desc"});
            viewModel.set("isMonitorVisible",true);
            var elements = kendoNotificationWidget.getNotifications();
            elements.each(function () {
//                $(this).parent().remove();
                kendo.bind($(this).find("button"),viewModel);
            });

        };

        var onSocketMessage=function(data) {
            var socketData = JSON.parse(data.data);
            if (socketData.notifications) {
                lastMsgTime=new Date();
                viewModel.set("wssConnected",true);
               // onNotifications(socketData.notifications);
                return;
            }
            if (socketData.ib_plan_out) {
                var socketData = JSON.parse(data.data);
                viewModel.set("wssConnected",true);
                /*
                var $emul=$("#emul-span");
                if (!($emul.length)) {
                    return;
                }
                */
                lastMsgTime=new Date();
                onIbPlanOut(socketData.ib_plan_out);
                return;
            }
            if (socketData.admin_info) {
                var admInfoResult=onAdminInfo(socketData.admin_info);
                viewModel.set("isAdmInfoVisible",!!admInfoResult.length);
                var lastUserAdmInfoDate=session.getLastUserAdmInfoDate(Number(localStorage['last_user']));
                if ((admInfoResult.date>lastUserAdmInfoDate) && (admInfoResult.length)) {
                    session.setLastUserAdmInfoDate(Number(localStorage["last_user"]),admInfoResult.date);
                    setTimeout(function() {
                        proxy.publish("navigateCommand",hrefToToAdmInfo);
                    },10);
                }
                return;
            }
            aNotificationData=[];
            lastMsgTime=new Date();
            viewModel.set("wssConnected",true);
            var href=window.location.href;


            if (href.indexOf("#/all-recomendations")>=0) {
//                return;
                proxy.publish("newRecomendationsData");
            }
            var lastUserRoleJson=sessionStorage['last_user_role'];
            if (lastUserRoleJson) {
                var oLastRole=JSON.parse(lastUserRoleJson);
                if (Number(oLastRole.uid)==Number(localStorage['last_user'])) {
                    if ((roleListWithoutRecomendations.indexOf(oLastRole.rolecode)>=0)) {
                        viewModel.set("isMonitorVisible",false);
                        return;
                    }
                }
            }
            viewModel.set("isBusy",true);
            viewModel.set("isMonitorVisible",false);
//            console.log(socketData);
            var userId = (viewModel.get("userId") || 0);
            for (var j=1;j<=3;j++) {
                var myData = [];
                for (var i = 0; i < socketData.length; i++) {
                    var socketDataItem = socketData[i];
                    if (socketDataItem.SYS_ID == j) {
                        if (socketDataItem.UID == userId) {
                            myData.push(socketDataItem);
                        }
                    }
                }
//                console.log(j);
//                console.log(myData);
                switch (j) {
                    case 4:
                        lastNotifications=kendo.stringify(myData);
                        var allDs=notificationsDs;
                        break;
                    case 3:
                        var allDs = allRecomsDs;
                        break;
                    case 2:
                        var allDs = allLdoListDs;
                        break;
                    case 1:
                        var allDs = allKdlListDs;
                        break;
                }
                var aDel = [];
                for (var i = 0; i < allDs.total(); i++) {
                    aDel.push(allDs.at(i));
                }
                for (var i = 0; i < aDel.length; i++) {
                    allDs.remove(aDel[i]);
                }
                for (var i = 0; i < myData.length; i++) {
                    var parItem = myData[i];
                    switch (j) {
                        case 4:
                            var dataItem = new notificationsModel;
                            break;
                        case 3:
                            var dataItem = new allRecomsModel;
                            break;
                        case 2:
                            var dataItem = new allIssledModel;
                            break;
                        case 1:
                            var dataItem = new allIssledModel;
                            break;
                    }
                    if (j==3) {
                        dataItem.set("recomid", Number(parItem.EXT4));
                        dataItem.set("ext1",parItem.EXT3);    // экстренная отмена переходов на документ
                    }
                    dataItem.set("ask_id", parItem.ASK_ID.trim());
                    if (j<=3 ) {
                        dataItem.set("ext3", parItem.EXT2);
                        dataItem.set("ext2", parItem.EXT1);
                        dataItem.set("date", parItem.CURDATE);
                        dataItem.set("time", parItem.CURTIME);
                        dataItem.set("date_ask", kendo.parseDate(parItem.ASK_ID.substr(0,10)));
                        dataItem.set("niib", parItem.IB_NO);
                        dataItem.set("fio", parItem.FIO);
                        if (j==3) {
                            var s3=dataItem.ext3;
                            if (s3) {
                                if (s3.startsWith("Требуется ")) {
                                    s3=s3.replace("Требуется","<strong>ТРЕБУЕТСЯ</strong>");
                                    dataItem.set("ext3", s3);
                                    var iDaysLeft=utils.getWorkDaysBetweenDates(dataItem.date_ask,new Date());
                                    if (iDaysLeft>=3) {
                                        aNotificationData.push(dataItem);
                                    }
                                }
                            }
							
							var s2 = dataItem.ext2;
							if (s2) {
								if (s2.startsWith("Онкодокументация")) {
									aNotificationData.push(dataItem);
								}
							}
                        }
                    }
                    if (j==4) {
                        dataItem.set("id",parItem.ID);
                        dataItem.set("curdatetime",parItem.CURDATETIME);
                        dataItem.set("important",parItem.IMPORTANT);
                        dataItem.set("niib",parItem.NIIB);
                        dataItem.set("patient_name",parItem.PATIENT_NAME);
                        dataItem.set("sender",parItem.SENDER);
                        dataItem.set("subsystem",parItem.SUBSYSTEM);
                        dataItem.set("sys_id",parItem.SYS_ID);
                        dataItem.set("text",parItem.TEXT);
                        dataItem.set("uid1",parItem.UID);
                        dataItem.set("uid2",parItem.UID2);
                        dataItem.set("viewdatetime",parItem.VIEWDATETIME);
                        if (!dataItem.get("viewdatetime")) {
                            if (dataItem.get("important")>0) {
                                viewModel.set("notificationsImportantCount",viewModel.get("notificationsImportantCount")+1);
                            }
                            else {
                                viewModel.set("notificationsOthersCount",viewModel.get("notificationsOthersCount")+1);
                            }
                        }
                    }
                    //
                    allDs.pushCreate(dataItem);
                    try {
                        allDs.getByUid(dataItem.uid).dirty = false;
                    }
                    catch (ex) {

                    }
                }
                switch (j) {
                    case 4:
                        allDs.sort({field: "important", dir: "desc"},{field:"curdatetime",dir:"desc"});
                        break;
                    case 3:
                        allDs.sort({field: "fio", dir: "asc"});
                        break;
                    default:
                        allDs.sort([{field: "date", dir: "desc"},{field:"time",dir:"desc"}]);
                        break;
                }
            }
            socketDataCount++;
            onAllRecomendationsChanged();
            /*
            notificationsDs.read().then(function() {
                lastNotifications=kendo.stringify(notificationsDs._data);
            });
            */
            onUpdateNotificationsViewDateTime({items:[]});

            if (socketDataCount==1) {
                if (viewModel.get("notificationsImportantCount")>0 || viewModel.get("notificationsOthersCount")>0) {
                    setTimeout(function() {
                        proxy.publish("navigateCommand",hrefToNotifications);
                    },1000*3);
                }
                else {
                    /* 28/03/2019
                    if ((allRecomsDs._data.length)) {
                        setTimeout(function() {
                            proxy.publish("navigateCommand",hrefToRecomendations);
                        },1000*3);
                    }
                    */
                }
                setTimeout(function() {
                    if (viewModel.get("wssConnected")) {
                        if (sockets.length) {
                            var wss=sockets[0];
                            var msg={get_admin_info:true,user_name:getUserName(Number(localStorage["last_user"])),
                                date:new Date()};
                            wss.send(msg);
                        }
                    }
                },1000);
           }
            var kendoNotificationWidget=$("#kendo-notification").getKendoNotification();
            if (kendoNotificationWidget) {
                kendoNotificationWidget.unbind("hide");
                var elements = kendoNotificationWidget.getNotifications();
                elements.each(function () {
                    $(this).parent().remove();
                });
                var href=window.location.href;
                if ((href.indexOf("/ib-docs/")<0) || true) {
                    var aIdList=[];
                    for (var i=0;i<aNotificationData.length;i++) {
                        aIdList.push(aNotificationData[i].recomid);
                    }
                    if (aIdList.length) {
                        ibRecomByIdDs.read({ids:aIdList.join(',')}).then(function(){
                            var elements = kendoNotificationWidget.getNotifications();
                            elements.each(function () {
                                $(this).parent().remove();
                            });
                            var data=ibRecomByIdDs._data;
                            for (var i=0;i<data.length;i++) {
                                var item=data[i];
                                if (item.cancel_ts || item.ucancel_ts) {
                                    continue;
                                }
                                for (var j=0;j<aNotificationData.length;j++) {
                                    var dataItem=aNotificationData[j];
                                    if (dataItem.recomid==item.recomid) {
                                        if (dataItem.ask_id==item.ask_id) {
                                            kendoNotificationWidget.warning({
                                                recomid:dataItem.recomid,
                                                ask_id:dataItem.ask_id,
                                                ext1:dataItem.ext1,
                                                ext3:(dataItem.ext2 == "Онкодокументация") ? (dataItem.ext2 + ": " + dataItem.ext3) : dataItem.ext3,
                                                fio:dataItem.fio,
                                                niib:dataItem.niib
                                            });
                                        }
                                    }
                                }
                            }
                        });
                        kendoNotificationWidget.bind("hide",onHideNotification);
                        if (href.indexOf("/my-pacients")<0) {
                            proxy.publish("hideYellowNotifications");
                        }
                        else {
                            proxy.publish("showYellowNotifications");
                        }

                    }
                }
            }

        };
        var onHideNotification=function(e) {
            var element=e.element;
            var div=$(element).find("div").first();
            if (div.length) {
                var recomId=$(div).data("recom-id");
                if (recomId) {
                    ibRecomByIdDs.read({ids:recomId.toString()}).then(function(){
                        var data=ibRecomByIdDs._data;
                        for (var i=0;i<data.length;i++) {
                            var item=data[i];
                            if (item.cancel_ts || item.ucancel_ts) {
                                continue;
                            }
                            for (var j=0;j<aNotificationData.length;j++) {
                                var dataItem=aNotificationData[j];
                                if (dataItem.recomid==item.recomid) {
                                    if (dataItem.ask_id==item.ask_id) {
                                        setTimeout(function() {
                                            window.location.href=
                                                window.location.origin+window.location.pathname+window.location.search+
                                                "#/"+"ib-docs"+"/" + dataItem.ask_id+"/"+dataItem.ext1;
                                        },10);
                                        break;
                                    }
                                }
                            }
                        }

                    });
                }
            }
        };
        var onAllRecomendationsChanged=function() {
//             viewModel.set("isAllRecomendationsVisible",data.length);

            viewModel.set("allRecomendationsCount",allRecomsDs.data().length || 0);
            viewModel.set("allLdoCount",allLdoListDs.data().length || 0);
            viewModel.set("allKdlCount",allKdlListDs.data().length || 0);
            viewModel.set("isMonitorVisible",true);
            /*
            viewModel.set("isMonitorVisible",
                viewModel.get("allRecomendationsCount") ||
                viewModel.get("allLdoCount") ||
                viewModel.get("allKdlCount") ||
                viewModel.get("notificationsImportantCount") ||
                viewModel.get("notificationsOthersCount")
            );
            */
        };
        var sendPlanOutQuery=function() {
            if (viewModel.get("wssConnected")) {
                if (sockets.length) {
                    var wss = sockets[0];
                    var userId = Number(localStorage["last_user"]);
                    var msg = {ib_plan_out: true, user_id: userId};
                    wss.send(msg);
                }
            }
            else {
                onOpenSocket(viewModel.get("socketData"));
            }

        };
        var onOpenSocket=function(data) {
            var socketData=data;
            viewModel.set("socketData",socketData);
            var userId = Number(localStorage["last_user"]);
            if (viewModel.get("userId")) {
                userId=viewModel.userId;
            }
            else {
                viewModel.userId=userId;    // without set !!!
            }
            var wss=new SocketServer(data.url);
            wss.open(data.greetings);
            if (!sockets.length) {
                sockets.push(wss);
            }
            setTimeout(function(){
                if (!sockets.length) {
                    viewModel.set("wssConnected",false);
                }
                else {
                    if (sockets[sockets.length-1]._connection.readyState!=1) {
                        viewModel.set("wssConnected",false);
                    }
                    else {
                        viewModel.set("wssConnected",true);
                        if (!viewModel.get("planOutInterval")) {
                            sendPlanOutQuery();
                            viewModel.set("planOutInterval",setInterval(sendPlanOutQuery,1000*60));   // 1 minutes
                        }
                        if (viewModel.get("socketReconnectInterval")) {
                            clearInterval(viewModel.get("socketReconnectInterval"));
                            viewModel.set("socketReconnectInterval",undefined);
                        }
                    }
                }
            },3000);
        };
        var onCloseSockets=function() {
            for (var i=0;i<sockets.length;i++) {
                try {
                    sockets[i].close();
                }
                catch (ex) {

                }
            }
            sockets=[];
        };
        var onSocketClose=function(e) {
            viewModel.set("wssConnected",false);
            if (viewModel.get("planOutInterval")) {
                clearInterval(viewModel.get("planOutInterval"));
            }
        };
        var onSocketError=function(e) {
            viewModel.set("wssConnected",false);
            if (viewModel.get("planOutInterval")) {
                clearInterval(viewModel.get("planOutInterval"));
                viewModel.set("notificationsImportantCount",0);
            }
            onCloseSockets();
            if (!viewModel.get("socketReconnectInterval")) {
                viewModel.set("socketReconnectInterval",setInterval(function(){
                    onOpenSocket(viewModel.get("socketData"));
                },1000*30));   // 30 seconds
            }

        };
        var onIbScopeChanged=function() {
            var lastUserRoleJson=sessionStorage['last_user_role'];
            if (lastUserRoleJson) {
                var oLastRole=JSON.parse(lastUserRoleJson);
                if (Number(oLastRole.uid)==Number(localStorage['last_user'])) {
                    if ((roleListWithoutRecomendations.indexOf(oLastRole.rolecode)>=0)) {
                        viewModel.set("isMonitorVisible",false);
                        return;
                    }
                }
            }
            viewModel.set("isMonitorVisible",true);
        };
        var onUpdateNotificationsViewDateTime=function(data) {
            // console.log("updateNotificationsViewDateTime");
            if (viewModel.get("wssConnected")) {
                if (sockets.length) {
                    var wss=sockets[0];
                    var msg={updateNotifications:true,user_id:Number(localStorage["last_user"]),
                        items:data.items.join(",")};
                    wss.send(msg);
                }
            }
        };
        var onHideYellowNotifications=function() {
            /*
            var kendoNotificationWidget=$("#kendo-notification").data("kendoNotification");
            if (kendoNotificationWidget) {
                kendoNotificationWidget.hide();
            }
            */
            var kendoNotificationWidget=$("#kendo-notification").getKendoNotification();
            if (kendoNotificationWidget) {
                var elements = kendoNotificationWidget.getNotifications();
                elements.each(function () {
                    $(this).parent().hide();
                });
            }
        };
        var onShowYellowNotifications=function() {
            var kendoNotificationWidget=$("#kendo-notification").getKendoNotification();
            if (kendoNotificationWidget) {
                var elements = kendoNotificationWidget.getNotifications();
                elements.each(function () {
                    $(this).parent().show();
                });
            }

        };
        var onGoToIb=function(data) {
            if (data.ask_id) {
              var allDs=ibPlanOutDs.data();
              for (var i=0;i<allDs.length;i++) {
                  if (allDs[i].ask_id==data.ask_id) {
                      var tmp=(viewModel.get("notificationsImportantCount") || 0) +
                            (viewModel.get("notificationsOthersCount") || 0);
                      viewModel.set("notificationsImportantCount",0);
                      viewModel.set("notificationsOthersCount",tmp);
                      break;
                  }
              }
            }
        };
        proxy.subscribe("allRecomendationsChanged",onAllRecomendationsChanged);
        proxy.subscribe("openSocket",onOpenSocket);
        proxy.subscribe("closeSockets",onCloseSockets);
        proxy.subscribe("socketMessage",onSocketMessage);
        proxy.subscribe("socketClose",onSocketClose);
        proxy.subscribe("socketError",onSocketError);
        proxy.subscribe("ibScopeChanged",onIbScopeChanged);
        proxy.subscribe("updateNotificationsViewDateTime",onUpdateNotificationsViewDateTime);
        proxy.subscribe("hideYellowNotifications",onHideYellowNotifications);
        proxy.subscribe("showYellowNotifications",onShowYellowNotifications);
        proxy.subscribe("gotoIb",onGoToIb); // published from ib.js
        viewModel.bind("change",onModelChange);
        return viewModel;
    }
);
