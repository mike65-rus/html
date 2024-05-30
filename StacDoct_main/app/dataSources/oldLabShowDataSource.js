define(["kendo.all.min","models/labListModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
   
    var ds = new kendo.data.DataSource({
        serverPaging: false,
        serverSorting: false,
        pageSize: 100,
        transport: {
            read: "default.aspx?action=pk/pk_lab_AJAX&action2=show",
            dataType: "json"
        },
        requestStart: function(e) {
            kendo.ui.progress($(".k-content"), true);
        },
        requestEnd: function(e) {
            kendo.ui.progress($(".k-content"), false);
            utils._onRequestEnd(e)
        },
        schema: {
            data: "ids.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    html: {
                        type: "string"
                    }
                }
            }
        },/*
        change: function (e) {
            var pData=this.data();
            if (pData.length) {
                LabViewModel.set("oldHtml",pData[0].html);
                LabViewModel.set("patLabel",LabViewModel.patientLabel());
                //LabViewModel.set("oldAnalId",)
                var selIb=ibModel.get("selectedIb");
                LabViewModel.LabIncludeToIb.read({
                    action3:"get",
                    ask_id: selIb.ask_id,
                    anal_id:LabViewModel.get("oldAnalId")
                });
                setTimeout(function(){
                    $("#old-lab-result-window").data("kendoWindow").title(ibModel.selectedIb.fio).open().center();
                },1000);
            }
        },*/
        error: function(e) {
            utils.ajax_error(e);
        }
    })
    return ds;

});	