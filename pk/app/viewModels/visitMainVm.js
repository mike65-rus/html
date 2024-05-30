define(['kendo.all.min','utils','kendo-template!views/visitMain',
        'services/proxyService','dataSources/visitsListDataSource',
        'kendo-template!views/visitMainForm',
        'kendo-template!views/visitMainGrid',
    ],
    function(kendo,utils,viewId,proxy,visitsListDs,leftPaneView,rightPaneView) {
        'use strict';
        var myTabStripOrder=0;
        var myTabStripName="main";
        var isMyTabCurrent=false;
        var myTabStrip=null;
        var contentHtml=$("#"+viewId).html();
        var parentModel=null;
        var gridSelector="#not_closed_visits_grid-main";
        var bindWidgets=function() {

            var content=myTabStrip.contentElement(myTabStripOrder);
            $(content).html(contentHtml);
            $(content).find("#left-pane").first().html($("#"+leftPaneView).html());
            $(content).find("#right-pane").first().html($("#"+rightPaneView).html());
            kendo.init("#visit-main-tab");


            kendo.bind($("#left-pane"),parentModel);
            kendo.bind($("#right-pane"),parentModel);

            $("#mkb").on("keypress",utils.rusLatMkbEventListener);
            var autoComplete=$("#mkb").data("kendoAutoComplete");
            if (autoComplete) {
                autoComplete.list.width(800);
            }
            proxy.publish("createMainFormValidator",{form:"#visit-main-form"});
        };
        var onBindWidgets=function(data) {
            parentModel=data.parentModel;
            if (parentModel) {
                bindWidgets();
            }
        };
        var onUnbindWidgets=function(data) {
            if (myTabStrip) {
                $(myTabStrip.contentElement(myTabStripOrder)).html("<div></div>");
            }
        };
        var onVisitVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            if (!(order==myTabStripOrder)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripOrder);
            parentModel=data.parentModel;
            var tabStrip=data.tabStrip;
            myTabStrip = tabStrip.append({
                text: "Основная",
                content: (isMyTabCurrent && parentModel) ? contentHtml: "<div></div>"
            });
            bindWidgets();
        };
        var onTabActivated=function(data) {
            var idx=data.index;
            if (!(idx==myTabStripOrder)) {
                return;
            }
            // resize splitters
            var contentElement=data.content;
            $(contentElement).find(".k-splitter").each(function(idx,el) {
                $(el).css("height",($(contentElement).height()-5)+"px");
                kendo.resize($(el));

            });
            // resize grid
            $(gridSelector).css("height",($(contentElement).height()-90)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }

        };
        var viewModel=new kendo.data.ObservableObject({
        });
        proxy.subscribe("patientVisitVisible",onVisitVisible);
        proxy.subscribe("bindWidgets",onBindWidgets);
        proxy.subscribe("unbindWidgets",onUnbindWidgets);
        proxy.subscribe("visitInternalTabActivated",onTabActivated);
        return viewModel;
    }
);