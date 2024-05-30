/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","services/proxyService","dataSources/forMonGpDataSource",
        "utils","alertify"],
    function(kendo,proxy,ds,utils,alertify) {
        'use strict';
        var kendoWindow=null;
        var confirmOnScreen=false;
        var timeoutId=null;
        var monGpMaxUndoCount=1;
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            dataSource:ds,

        });
        var closeWindow=function(e) {
            var selector="#diagsListWindow";
            kendo.unbind("#ib_diags_list_window");
            kendoWindow.destroy();
            $(selector).remove();
        };
        var isNeedCheckMonGp=function(data) {
            var bRet=false;
            var aUsers=data.users_list.split(",");
            for (var i=0;i<aUsers.length;i++) {
                if (Number(localStorage['last_user']) == Number(aUsers[i])) {
                    bRet=true;
                    break;
                }
            }
            return bRet;
        };
        var processMonGp=function(data) {
            var bShowMonGp=false;
            var curDate=new Date();
            if (utils.isWorkDay(curDate,data.holidays)) {
                var hour=curDate.getHours();
                var lastConfirm=data.confirmed;
                if (kendo.toString(lastConfirm,"yyyyMMdd")<kendo.toString(curDate,"yyyyMMdd")) {
                    if ((hour>=8) && (hour<=16)) {
                        bShowMonGp = true;
                    }
                }
            }
            return bShowMonGp;
        };
        var openMonGpWindow=function(data) {

            var wndDiv = $("<div id='iframe-doc-window-mon-gp'></div>");
            var url = "https://tele.pgb2.ru/Medsystem/InfectionMonitor/Home/PatientList?uid=" +
                Number(localStorage['last_user']).toString()+"&h="+data.hash ;
//            var url = "https://srv.hospital.local:444/Medsystem/InfectionMonitor/Home/PatientList?uid=" +
//                Number(localStorage['last_user']).toString()+"&h="+data.hash ;
            var title="Ежедневный мониторинг грипп/пневмония/ОРВИ";
//            var title="Ежедневный мониторинг";
            var wnd = window.open(url);
            setTimeout(function() {
                wnd.postMessage("collapseSplitter","*");
            },3000);
            return;
            /*
            kendo.confirm("Данные ежедневного мониторинга грипп/пневмония/ОРВИ еще не заполнены!<br>Заполнить сейчас?").
                then(function() {
                    var wnd = window.open(url);
//                    wnd.onload=function() {
                        setTimeout(function() {
                            wnd.postMessage("collapseSplitter","*");
                        },3000);

  //                  };
                }
                );
            return;
            */
            kendoWindow = $(wndDiv).kendoWindow({
                title: title,
                modal: true,
                animation: false,
                actions:["Close"],
                iframe: true,
                content: url,
                open: function(e) {
  //                  kendo.ui.progress($("#iframe-doc-window-mon-gp"),true);
                },
                close: function(e) {
                    var windowElement = $("#iframe-doc-window-mon-gp");
//                    var kendoWindow=$(windowElement).data("kendoWindow");
                    kendoWindow.destroy();
                    kendoWindow=null;
                    var iframeDomElement = windowElement.children("iframe");
                    $(iframeDomElement).remove();
                    $(windowElement).remove();
                },
                refresh: function (e) {
//                    kendo.ui.progress($("#iframe-doc-window-mon-gp"),false);
                    var windowElement = $("#iframe-doc-window-mon-gp");
                    var iframeDomElement = windowElement.children("iframe")[0];
                    var iframeWindowObject = iframeDomElement.contentWindow;
                    iframeWindowObject.postMessage("collapseSplitter","*");
                    /*
                    var iframeDocumentObject = iframeDomElement.contentDocument;
                    var iframejQuery = iframeWindowObject.$; // if jQuery is registered inside the iframe page, of course
                    setTimeout(function() {
                        var splitter=iframejQuery("#splitter").data("kendoSplitter");
                        splitter.collapse(".k-pane:first");
                    },50);
                    */
                }
          }).data("kendoWindow");
          kendoWindow.open().maximize();
        };
        var onShowMonGpWindow=function(data) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            viewModel.dataSource.read().
            then(function() {
                var data=viewModel.dataSource._data[0];
                var bNeedCheckMonGp=isNeedCheckMonGp(data);
                if (localStorage.last_user_roles.includes("VRACH_DEGURANT")) { //24.04.2023
                    bNeedCheckMonGp=false;
                }
                    if (bNeedCheckMonGp && processMonGp(data) && (!utils.isEmulMode())) {
                    if (!kendoWindow) {
                        if (!confirmOnScreen ) {
                            var undoCount=utils.getMonGpUndoCount(Number(localStorage['last_user']));
                            var sMsg="<p>Данные ежедневного мониторинга грипп/пневмония/ОРВИ еще не заполнены или не подтверждены!</p>";
                            sMsg=sMsg+"<p style='text-align: center'>Заполнить сейчас?</p>";
                            confirmOnScreen=true;
                            if (undoCount<monGpMaxUndoCount) {
                                kendo.confirm(sMsg).
                                then(function() {
                                    confirmOnScreen=false;
                                    openMonGpWindow(data);
                                }, function() {
                                    confirmOnScreen=false;
                                    utils.setMonGpUndoCount(Number(localStorage['last_user']));
                                })
                            }
                            else {
                                confirmOnScreen=true;
                                alertify.alert(sMsg,function() {
                                    confirmOnScreen = false;
                                    openMonGpWindow(data);
                                })
                            }
                        }

                    }
                }
                if (bNeedCheckMonGp && data.check_interval) {
                    timeoutId=setTimeout(function(){
                        onShowMonGpWindow();
                    },data.check_interval*(1000*60));
                }
            },
            function() {
            });
        };
        proxy.subscribe("showMonGpWindow",onShowMonGpWindow);
        return viewModel;
    }
);