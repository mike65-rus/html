/**
 * Created by STAR_06 on 26.11.2015.
 */
define(["kendo.all.min",'kendo-template!templates/mobileCode','services/proxyService','alertify',
        'dataSources/mobileCodeDataSource',
        'utils'
    ],
 function(kendo,editTemplateId,proxy,alertify,dsMobile,utils) {
   'use strict';
   var timeoutId=null;
    var viewModel;
    var kendoWindow;
    var closeWindow=function(e) {
        var selector="#mobileCodeWindow";
        kendo.unbind(selector);
        kendoWindow.destroy();
        $(selector).remove();
    };
    var createWindow=function() {
        try {
            clearTimeout(timeoutId);
            timeoutId=null;
        }
        catch (ex) {

        }
        kendoWindow=$("<div id='mobileCodeWindow'/>").kendoWindow({
            actions:[],
            title: "Получение мобильного кода",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            },
            close: viewModel.closeWindow
        }).data("kendoWindow");
        kendoWindow.open().center();
        setTimeout(function(){
            kendo.bind("#mobileCodeWindow",viewModel);
        },1)

    };
    viewModel= new kendo.data.ObservableObject({
        dsMobile:dsMobile,
        mobileCode:"",
        isGetCodeEnabled:true,
        getCode: function(e) {
            var that=viewModel;
            var selector="#mobileCodeWindow";
            kendo.ui.progress($(selector),true);
            that.dsMobile.read().then(function(){
                kendo.ui.progress($(selector),false);
                var dsData=that.dsMobile._data;
                if (dsData) {
                    if (dsData.length) {
                        that.set("mobileCode",dsData[0].code);
                    }
                }
            });
            if (timeoutId) {
                try {
                    clearTimeout(timeoutId);
                    timeoutId=null;
                }
                catch(ex) {
                }
            }
            timeoutId=setTimeout(function() {
                try {
                    that.closeWindow();
                    clearTimeout(timeoutId);
                    timeoutId=null;
                }
                catch(ex) {
                }
            },1000*60);
        },
        closeWindow: function(e) {
            viewModel.set("mobileCode","");
            closeWindow(e);
        }
    });
    var onChange=function(e) {
        var fld=e.field;
        if (fld=="mobileCode") {
            var mCode=viewModel.get("mobileCode");
            viewModel.set("isGetCodeEnabled",!mCode);
        }
    };
    var onGetMobileCode=function(data) {
        createWindow();
    };
     viewModel.bind("change",onChange);
    proxy.subscribe("getMobileCode",onGetMobileCode);
     return viewModel;
}
);