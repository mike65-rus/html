define(['kendo.all.min','kendo-template!views/patientCardPacs','dataSources/pacsResultsDataSource','services/proxyService'],
    function(kendo,viewId,ds,proxy) {
        'use strict';
        var pacsDs=ds;
        var myTabStripOrder=2;
        var myTabStrip=null;
        var contentHtml=$("#"+viewId).html();
        var isMyTabCurrent=false;

        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            pacsHtml:"",
            pacsQuery: function(e) {
                pacsQuery(e);
            }
        });
        var bindWidgets=function() {
            kendo.bind("#exams-pk-pacs",viewModel);
            kendo.bind("#pacs-data",viewModel);
        };
        var pacsQuery=function(e) {
            var oPers=viewModel.get("selectedPatient");
            if (!(oPers)){
                return;
            }
            var d2="";
            var sFioSexBirt="";
            sFioSexBirt=sFioSexBirt+oPers.fam.trim()+';';
            sFioSexBirt=sFioSexBirt+oPers.ima.trim()+';';
            sFioSexBirt=sFioSexBirt+oPers.otch.trim()+';';
            sFioSexBirt=sFioSexBirt+oPers.sex.trim()+';';
            sFioSexBirt=sFioSexBirt+oPers.birt2.trim();
            kendo.ui.progress($("#exams-pk-pacs"),true);
            pacsDs.read({
                global_vn:oPers.pin,
                ask_id:"",
                birt:kendo.toString(oPers.birt,"yyyyMMdd"),
                d1:"20140101",
                d2:d2,
                sFioSexBirt:sFioSexBirt
            }).then(function() {
                kendo.ui.progress($("#exams-pk-pacs"),false);
                if (pacsDs.data().length) {
                    viewModel.set("pacsHtml",pacsDs.data()[0].ahtml);
                }
                else {
                    viewModel.set("pacsHtml","");
                }
            });
        };
        var onPatientCardVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            if (!(order==myTabStripOrder)) {
                return;
            }
            viewModel.set("selectedPatient",data.patient);
            isMyTabCurrent=(currentTab==myTabStripOrder);
            var tabStrip=data.tabStrip;
            myTabStrip = tabStrip.append({
                text: "PACS",
                content: (isMyTabCurrent) ? contentHtml: "<div></div>"
            });
            setTimeout(function(){
                bindWidgets();
            },10);
        };

        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                viewModel.set("pacsHtml","");
            }
        };
        var onTabActivated=function(data) {
            var idx=data.index;
            if (!(idx==myTabStripOrder)) {
                return;
            }
            if (isMyTabCurrent) {
                viewModel.set("selectedPatient",data.parentModel.selectedPatient);
                bindWidgets();
            }
        };

        viewModel.bind("change",onVmChange);
        proxy.subscribe("patientIssledVisible",onPatientCardVisible);
        proxy.subscribe("issledInternalTabActivated",onTabActivated);

        return viewModel;
    }
);