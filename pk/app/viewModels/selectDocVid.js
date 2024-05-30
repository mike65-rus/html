/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/selectDocVid','services/proxyService',
        'dataSources/docsTreeDataSource'],
    function(kendo,editTemplateId,proxy,ds) {
        "use strict";
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            ds:ds,
            selectedItem: null,
            onSelect: function(e) {
                var dataUid=$(e.node).attr("data-uid");
                viewModel.set("selectedItem",viewModel.ds.getByUid(dataUid));

            },
            isOkEnabled: function() {
                var bRet=false;
                var selected=viewModel.get("selectedItem");
                if (selected) {
                    bRet=(selected.sprite==="html") ? true: false;
                }
                return bRet;
            },
            open: function(data) {
                viewModel.set("selectedItem",null);
                viewModel.set("passedData",data);
                kendoWindow.open().center();
                kendo.bind($("#ibdocs_vid_view_modal"),viewModel);
                setTimeout(function(){
                    var treeView = $("#doc_tree").data("kendoTreeView");
                    try {
                        treeView.expand(treeView.findByText("Общие шаблоны"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("Первичный осмотр"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("Осмотр врача"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("ОнкоДокументация"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("Извещение в СЭС. Форма 058/у"));
                    }
                    catch (e) {
                    }
                    if ((treeView.select()).length) {
                        viewModel.onSelect({node:treeView.select()});
                    }
                },500);

            },
            ok: function() {
                var data=viewModel.get("selectedItem");
                proxy.publish("createDoc",{
                    doc_vid:data.doc_type,
                    doc_sub:data.doc_subtype,
                    extData:null
                });
                kendoWindow.close();
            },
            cancel: function() {
                kendoWindow.close();
            }
        });
        //
        var kendoWindowOtd;
        var kendoWindow=$("<div id='selectDocVidDialog'/>").kendoWindow({
            title: "Выбор вида нового документа",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
        return viewModel;
    }

);
