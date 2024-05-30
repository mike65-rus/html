define(['kendo.all.min','kendo-template!views/deseasesDisp38DetailsWindow',
        'services/proxyService','utils'],
    function(kendo,viewId,proxy,utils) {
        'use strict';
        var parentModel=null;
        var kendoWindow;
        var windowSelector="#deseasesDisp38DetailsWindow";
        var onCloseWindow=function(e) {
            var selector=windowSelector;
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        var viewModel=new kendo.data.ObservableObject({
            closeWindow: function(e) {
                kendoWindow.close();
            }
        });
        var showWindow=function() {
            var wndDiv=$("<div id='deseasesDisp38DetailsWindow'/>");
            kendoWindow=$(wndDiv).kendoWindow({
                title: "Детальная информация",
                modal:true,
                content: {
                    template: $("#"+viewId).html()
                },
                animation: false,
                close: onCloseWindow
            }).data("kendoWindow");
            kendo.bind($("#deseases-details38-command-bar"),viewModel);
            kendo.bind($("#deseases-details38-content"),parentModel);
            kendoWindow.center().open();
        };
        var onViewDetails=function(data) {
            parentModel=data.parentModel;
            showWindow();
        };

        proxy.subscribe("deseasesDisp38ViewDetails",onViewDetails);

        return viewModel;
    }

);