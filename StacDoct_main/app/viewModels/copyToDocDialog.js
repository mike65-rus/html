/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/copyToDocTemplate','kendo-template!templates/copyToDocDialog',
        'services/proxyService'],
    function(kendo,autoTemplateId,editTemplateId,proxy) {
        "use strict";
        var viewModel;
        var theObject=null;
        viewModel= new kendo.data.ObservableObject({
            ds: null,
            open: function(ds,object) {
                viewModel.set("ds",ds);
                theObject=object;
                kendo.bind($("#copy-doc-dlg"),viewModel);
                kendoWindow.open().center();
            },
            isOkEnabled: function() {
                return true;
            },
            ok: function() {
                var data=new Array();
                var ds=viewModel.get("ds");
                for (var i=0;i<ds.length;i++) {
                    var item=ds[i];
                    if (item.isChecked) {
                        data.push(item);
                    }
                }
                if (data.length) {
                    // proxy.publish("copyObjectsSelected", JSON.stringify(data));
                    if (theObject!==undefined) {
                        theObject.copyToNew(JSON.stringify(data));
                    }
                }
                kendoWindow.close();
            },
            cancel: function() {
                kendoWindow.close();
            }
        });
        //
//        console.log(autoTemplateId);
        var kendoWindow=$("<div id='copy-doc-dlg-open'/>").kendoWindow({
            title: "Выбор объектов для копирования",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
        return viewModel;
    }

);
