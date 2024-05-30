define(['kendo.all.min','utils','services/proxyService',
        'kendo-template!views/patientCardIssled',
        'viewModels/patientCardKdlVm',
        'viewModels/patientCardLdoVm',
        'viewModels/patientCardPacsVm',
        'viewModels/patientCardNaprLdoVm'
    ],
    function (kendo,utils,proxy,viewId,KdlVm,LdoVm,PacsVm,NaprLdoVm) {
        'use strict';
        var myTabStripOrder=2;
        var myTabStripName="issled";
        var myTabStrip=null;
        var tabStrip=null;
        var isMyTabCurrent=false;
        var tabStripsNames=["kdl","ldo","pacs","napr-ldo"];
        var tabStripsCount=tabStripsNames.length;
        var contentHtml=$("#"+viewId).html();
        var currentTab=0;
        var lastSelectedTab=0;
        var navigationPath={};
        var suffixNav={
            page:""
        };
        var lastSuffix="";
        var tabStripSelector="#patient-card-issled-tabstrip";
        var getTabStripIndexFromUrlPage=function(page) {
            var idx=0;
            if (!page) {
                return idx;
            }
            if (tabStripsNames.indexOf(page)<0) {
                return idx;
            }
            return tabStripsNames.indexOf(page);
        };
        var createTabStrip=function() {
            tabStrip=$(tabStripSelector).kendoTabStrip({
                animation: {
                    open:false
                },
                activate:onInternalTabActivate
            }).data("kendoTabStrip");
        };
        var createTabStrips=function() {
            if ((tabStrip.items().length)<tabStripsCount) {
                for (var i=0;i<tabStripsCount;i++) {
                    proxy.publish("patientIssledVisible",
                        {parentModel:viewModel,
                            tabStrip: tabStrip, order:i, currentTab:currentTab});
                }
                setTimeout(function(){
                    try {
                        if (!$(tabStripSelector).data("kendoTabStrip") ) {
                            // hack for initialize after browser page reload (F5)
                            kendo.init(tabStripSelector);
                            tabStrip=$(tabStripSelector).data("kendoTabStrip");
                            tabStrip.bind("activate",onInternalTabActivate);
                        }
                        tabStrip.select(currentTab);
                    }
                    catch (ex) {

                    }
                },10);

            }
        };
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            suffix:tabStripsNames[0]

        });
        var bindWidgets=function() {
            kendo.bind("#patient-card-issled-tabstrip",viewModel);
        };
        var onInternalTabActivate=function(e) {
            // when internal tab of visit activated
            var idx=$(e.item).index();
            if (!(idx==currentTab)) {
                var url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+
                    "/"+myTabStripName+"/"+tabStripsNames[idx];
                proxy.publish("navigateCommand",url);
                e.preventDefault;
            }
            else {
                var contentElement=myTabStrip.contentElement(myTabStripOrder);
                $(e.contentElement).css("height",($(contentElement).height()-80)+"px");
                proxy.publish("issledInternalTabActivated",
                    {index:idx, element: e.item, content: e.contentElement,parentModel:viewModel});
                lastSelectedTab=idx;
            }
        };
        var onTabActivated=function(data) {
            var idx=data.index;
            var name=data.name;
            if (!(name==myTabStripName)) {
                return true;
            }
            myTabStripOrder=idx;
            //
            lastSuffix=viewModel.get("suffix");
            navigationPath=data.navigationPath;
            var navPath=data.navigationPath;
            if (navPath.suffix) {
                    viewModel.suffix="";
                    viewModel.set("suffix",navPath.suffix);
            }
            var suffix=viewModel.get("suffix");
            if (suffix) {
                var url=window.location.href;
                if (!(url.endsWith(myTabStripName+"/"+suffix))) {
                    url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+"/"+myTabStripName+"/"+suffix;
                    proxy.publish("navigateCommand",url);
                }
                else {
//                    viewModel.suffix="";
//                    viewModel.set("suffix",suffix);
                }
                createTabStrips();
            }
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
                viewModel.suffix="abc";
                viewModel.set("suffix",tabStripsNames[0]);
            }
            if (e.field=="suffix") {
                var suffix=viewModel.get("suffix");
                suffixNav=splitSuffix(suffix);
                if (suffix) {
                    currentTab=getTabStripIndexFromUrlPage(suffix);
                }
            }
        };
        var onPatientCardVisible=function(data) {
            var order=data.order;
            var name=data.name;
            var currentTab=data.currentTab;
            if (!(name==myTabStripName)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripName);
            var tabStrip=data.tabStrip;
            myTabStrip = tabStrip.append({
                text: "Исследования",
                content: (isMyTabCurrent) ? contentHtml: "<div></div>"
            });
            if (isMyTabCurrent) {
                myTabStripOrder=order;
                bindWidgets();
                createTabStrip();
                viewModel.set("selectedPatient",data.patient);
            }
        };

        proxy.subscribe("patientCardVisible",onPatientCardVisible);
        proxy.subscribe("patientCardTabActivated",onTabActivated);
        viewModel.bind("change",onVmChange);

        return viewModel;

    }
);
