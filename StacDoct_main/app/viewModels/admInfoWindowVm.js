/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","services/proxyService",
        "dataSources/adminInfoDataSource",
        'kendo-template!templates/admInfoItem',
        'kendo-template!templates/admInfoWindow',
        "utils"],
    function(kendo,proxy,ds,listItemTemplate,editTemplateId,utils) {
        'use strict';
        var kendoWindow;
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            dataSource:ds,
            close:function(e) {
                kendoWindow.close();
            }
        });
        var closeWindow=function(e) {
            var selector="#admListWindow";
            kendo.unbind("#adm_info_window");
            kendoWindow.destroy();
            $(selector).remove();
        };
        var showWindow=function(data) {
            if (!data.length) {
                return;
            }
            var sTitle="АРМ врача стационара. Административная информация";
            kendoWindow=$("<div id='admListWindow'/>").kendoWindow({
                title: sTitle,
                modal:true,
                /*
                animation:false,
                width:1000,
                maxWidth:1000, */
                animation:{
                    open:{effects:"fade:in",duration:1000*3}
                    },
                actions:[],
                content: {
                    template: $("#"+editTemplateId).html()
                },
                close: closeWindow
            }).data("kendoWindow");
            kendo.bind("#adm_info_window",viewModel);
            kendoWindow.open().maximize();
        };
        var onShowAdmInfo=function() {
           showWindow(viewModel.dataSource._data);
        };
        proxy.subscribe("showAdmInfo",onShowAdmInfo);
        viewModel.dataSource=ds;
        return viewModel;
    }
);