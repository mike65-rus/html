/**
 * Created by STAR_06 on 26.11.2015.
 */
define(["kendo.all.min",'kendo-template!templates/medicamOstatReport','services/proxyService','alertify',
        'dataSources/skladListDataSource',
        'dataSources/medicamOstatReportDataSource'
    ],
    function(kendo,editTemplateId,proxy,alertify,dsSkladList,dsReport) {
        'use strict';
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            dsReport:dsReport,
            dsSkladList:dsSkladList,
            selectedSklad:null,
            reportLink: null,
            isLinkVisible: function() {
                if (this.get("reportLink")) {
                    return true;
                }
                return false;
            },
            isLinkInvisible: function() {
                return !this.isLinkVisible();
            },
            makeReport: function (e) {
                var curSklad=this.get("selectedSklad");
                if (!curSklad) {
                    return
                };
                /*
                if (document.getElementsByName('rememberSklad').item(0).checked) {
                    localStorage.setItem('last_sklad',curSklad.id);
                };
                */
                kendo.ui.progress($('.k-content'), true);
                this.dsReport.read({sklad_id: curSklad.sklad_guid,
                    sklad_name:curSklad.sklad_descr});
            },
            showPdf: function (e) {
                var alink=this.get("reportLink");
                if (alink) {
                    var newWin = window.open(alink,"Остатки медикаментов "+this.get("selectedSklad").otd_descr);
                    newWin.focus();
                }
                this.set("reportLink",null);
            },
            close: function() {
                kendoWindow.close();
            },
            open: function() {
//            console.log(editTemplateId);
                kendo.bind(kendoWindow.element,viewModel);
                kendoWindow.open().center();
            }
        });
        kendo.bind($("#"+editTemplateId),viewModel);
        var kendoWindow=$("<div id='medicamOstatReport'/>").kendoWindow({
            title: "Остатки медикаментов на складе",
            modal:true,
            width:500,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
        var onReportCreated=function(data) {
            kendo.ui.progress($('.k-content'), false);
            viewModel.set("reportLink",data.items[0].alink);
        };
        dsSkladList.read();
        proxy.subscribe("medicamOstatReportCreated",onReportCreated);
      return viewModel;
    }
);