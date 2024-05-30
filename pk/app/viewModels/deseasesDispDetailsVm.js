define(['kendo.all.min','kendo-template!views/deseasesDispDetailsWindow',
        'services/proxyService','utils'],
    function(kendo,viewId,proxy,utils) {
        'use strict';
        var parentModel=null;
        var kendoWindow;
        var windowSelector="#deseasesDispDetailsWindow";
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
            var wndDiv=$("<div id='deseasesDispDetailsWindow'/>");
            kendoWindow=$(wndDiv).kendoWindow({
                title: "Детальная информация",
                modal:true,
                content: {
                    template: $("#"+viewId).html()
                },
                animation: false,
                close: onCloseWindow
            }).data("kendoWindow");
            kendo.bind($("#deseases-disp-details-command-bar"),viewModel);
            kendo.bind($("#deseases-disp-details-content"),parentModel);
            kendoWindow.center().open();
        };
        var onViewDetails=function(data) {
            parentModel=data.parentModel;
            showWindow();
        };

        proxy.subscribe("deseasesDispViewDetails",onViewDetails);

        return viewModel;
    }

);