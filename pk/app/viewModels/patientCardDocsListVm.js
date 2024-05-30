define(['kendo.all.min','utils','services/proxyService',
        'classes/generalTab',
        'kendo-template!views/patientCardDocsList',
        'viewModels/patientCardDocsVm'
    ],
    function (kendo,utils,proxy,GeneralTab,viewId,listVm) {
        'use strict';
        var tabStrip=null;
        var contentHtml=$("#"+viewId).html();
        var currentTab=0;
        var navigationPath={};
        var suffixNav={
            page:""
        };
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            suffix:""
        });
        var onTabIsCurrent=function(data) {
            bindWidgets();
            viewModel.set("selectedPatient",data.patient);

        };
        var getModelSuffix=function(data) {
            var lastSuffix=viewModel.get("suffix");
            navigationPath=data.navigationPath;
            var navPath=data.navigationPath;
            if (navPath.suffix) {
                viewModel.suffix="";
                viewModel.set("suffix",navPath.suffix);
            }
            var suffix=viewModel.get("suffix");
            return suffix;
        };
        var options={
            level: 0,
            name:"docs",
            parentName:"",
            label:"Документы",
            contentHtml:contentHtml,
            tabStripSelector:"#patient-card-docs-tabstrip",
            viewModel:viewModel,
            onTabIsCurrent: onTabIsCurrent,
            getModelSuffix:getModelSuffix
        };
        var myTab= new GeneralTab(options);

        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null
//            suffix:myTab.tabStripsNames[0]

        });
        var bindWidgets=function() {
            kendo.bind("#patient-card-docs-tabstrip",viewModel);
        };
        var splitSuffix=function(suffix) {
            var oRet={
                page:""
            };
            if (!suffix) {
                return oRet;
            }
            else {
                oRet.page=suffix;
            }
            return oRet;
        };
        var onVmChange=function(e) {

            if (e.field=="selectedPatient") {
                myTab.currentTab=0;
                viewModel.suffix="abc";
                viewModel.set("suffix",myTab.tabStripsNames[0]);
            }
            /*
            if (e.field=="suffix") {
                var suffix=viewModel.get("suffix");
                suffixNav=splitSuffix(suffix);
                if (suffix) {
                    currentTab=myTab.getTabStripIndexFromUrlPage(suffix);
                }
            }
            */
            currentTab=0;
            myTab.viewModel=viewModel;
        };
        viewModel.bind("change",onVmChange);

        return viewModel;

    }
);
