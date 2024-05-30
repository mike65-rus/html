/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/selectDistDocVid','services/proxyService',
        'dataSources/docsTreeDistDataSource'],
    function(kendo,editTemplateId,proxy,ds) {
        "use strict";
        var viewModel;
        var kendoWindow;
        var dialogSelector="selectDistDocVidDialog";
        var bindableSelector="ibdocs_vid_dist_view_modal";
        var onClose=function(e) {
            var selector=dialogSelector;
            kendo.unbind("#"+bindableSelector);
            kendoWindow.destroy();
            $(selector).remove();
        };
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
            reallyOpen() {
                kendoWindow=$("<div id='"+dialogSelector+"'/>").kendoWindow({
                    title: "Выбор вида нового документа",
                    modal:true,
                    content: {
                        template: $("#"+editTemplateId).html()
                    },
                    close:onClose
                }).data("kendoWindow");

                kendoWindow.open().center();
                kendo.bind($("#"+bindableSelector),viewModel);
                setTimeout(function(){
                    var treeView = $("#doc_dist_tree").data("kendoTreeView");
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
            open: function(data) {
                viewModel.set("selectedItem",null);
                viewModel.set("passedData",data);
                ds.read({record_id:data.record_id}).then(function(){
                    viewModel.reallyOpen();
                });

            },
            ok: function() {
                var data=viewModel.get("selectedItem");
                proxy.publish("createDocFromSrc",{
                    doc_vid:data.doc_type,
                    doc_sub:data.doc_subtype,
                    extData:null,
                    src_record_id:viewModel.passedData.record_id
                });
                kendoWindow.close();
            },
            cancel: function() {
                kendoWindow.close();
            }
        });
        //
        var kendoWindowOtd;
        return viewModel;
    }

);
