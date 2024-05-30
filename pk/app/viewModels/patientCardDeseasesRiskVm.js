define(['kendo.all.min','utils','kendo-template!views/patientCardDeseasesRisk',
        'services/proxyService'
    ],
    function(kendo,utils,viewId,proxy) {
        'use strict';
        var myTabStripOrder=2;
        var myTabStrip=null;
        var isMyTabCurrent=false;
        var contentHtml=$("#"+viewId).html();

        var getPatientLabel=function() {
            var pat=viewModel.get("selectedPatient");
            var sRet="<Пациент не выбран>"
            if (!pat) {
                return sRet;
            }
            else {
                sRet=pat.fio+" "+pat.sex+" "+pat.pin+" ";
                try {
                    sRet=sRet+" "+pat.birt.toLocaleString().substr(0,10);
                }
                catch (e) {
                    sRet=pat.fio+" "+pat.sex+" "+pat.pin;
                }
                return sRet;
            }
        };

        var tryShowResults = function (sHtml) {
            var resultsHtml = sHtml;
            proxy.publish("navigateCommand", {path: "/show_results", data: resultsHtml});    // subscribed in router
        };

        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
        });
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
        };

        var bindWidgets=function() {
            kendo.bind($("#deseases-tab-risk"),viewModel);
            restoreState();
        };

        var onPatientCardVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            if (!(order==myTabStripOrder)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripOrder);
            var tabStrip=data.tabStrip;
            myTabStrip = tabStrip.append({
                text: "ФакторыРиска",
                content: (isMyTabCurrent) ? contentHtml: "<div></div>"
            });
        };
        var doQuery=function(iPatientId,dDateEnd){
        };

        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {
                }
            }
        };

        var onTabActivated=function(data) {
            var idx=data.index;
            if (!(idx==myTabStripOrder)) {
                return;
            }
            // resize grid
            /*
            var contentElement=data.content;
            $(gridSelector).css("height",($(contentElement).height()-5)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
            */
            //
            if (isMyTabCurrent) {
                viewModel.set("selectedPatient",data.parentModel.selectedPatient);
                bindWidgets();
            }
        };


        proxy.subscribe("patientDeseasesVisible",onPatientCardVisible);
        proxy.subscribe("deseasesInternalTabActivated",onTabActivated);

        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);