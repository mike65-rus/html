/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/linksTemplate','kendo-template!templates/linksWindow','services/proxyService',
        'dataSources/linksListDataSource'],
    function(kendo,autoTemplateId,editTemplateId,proxy,dsLinks) {
        "use strict";
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            dsLinks: dsLinks,
            open: function() {
                kendo.bind($("#links-window"),viewModel);
                kendoWindow.open().center();
            }
        });
        //
//        console.log(autoTemplateId);
        var kendoWindow=$("<div id='linksWindow-open'/>").kendoWindow({
            title: "Полезные ссылки",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
        return viewModel;
    }

);
