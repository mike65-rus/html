/*
One visit tab
 */
define(['kendo.all.min','utils','kendo-template!views/patientCardVisit',
        'services/proxyService','dataSources/visitsListDataSource',
        'models/visitModel',
        'dataSources/paymentTypesDataSource',
        'dataSources/visitTypesDataSource',
        'dataSources/userSpecialityDataSource',
        'dataSources/autoCompleteMkbDataSource',
        'dataSources/notClosedVisitsDataSource',
        'validators/visitMainFormValidator',
        'viewModels/visitMainVm'
    ],
    function(kendo,utils,viewId,proxy,visitsDs,VisitModel,payTypesDs,visitTypesDs,userSpecDs,matchedMkbDs,
             notClosedVisitsDs,
             mainValidator,
             mainVm) {
        'use strict';
        var myTabStripOrder=3;
        var myTabStripName="visit";
        var myTabStrip=null;
        var tabStrip=null;
        var isMyTabCurrent=false;
//        var tabStripsNames=["main","services","mkb","orders"];  // основная, услуги,диагнозы,направления
        var tabStripsNames=["main"];  // основная, услуги,диагнозы,направления
        var tabStripsCount=tabStripsNames.length;
        var currentTab=0;
        var lastSelectedTab=0;
        var gridDs=notClosedVisitsDs;
        var gridSelector="#not_closed_visits_grid";
        var mainFormValidator=null;
        var backUrl="";
        var lastSuffix="";
        var navigationPath={};
        var suffixNav={
            id:0,
            page:""
        };


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
            tabStrip=$("#patient-card-visit-tabstrip").kendoTabStrip({
                animation: {
                    open:false
                },
                activate: onInternalTabActivate
            }).data("kendoTabStrip");
        };
        var createTabStrips=function() {
            if ((tabStrip.items().length)<tabStripsCount) {
                for (var i=0;i<tabStripsCount;i++) {
                    proxy.publish("patientVisitVisible",
                        {parentModel:viewModel,
                            tabStrip: tabStrip, order:i, currentTab:currentTab});
                }
                setTimeout(function(){
                    try {
                        tabStrip.select(currentTab);
                    }
                    catch (ex) {

                    }
                },100);

            };
            setTimeout(function(){
                try {
                    tabStrip.select(currentTab);
                }
                catch (ex) {
              }
            },100);
        };
        var cancelVisitUpdate=function(e) {
            viewModel.set("suffix","");
            viewModel.mode="abc";
            viewModel.set("mode","");
            viewModel.set("visit",new VisitModel());
            changeTabName(myTabStrip);
            var url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+"/"+((backUrl==="") ? myTabStripName:backUrl);
//            var url="/patient_card/"+viewModel.selectedPatient.evn.toString()+"/"
            proxy.publish("navigateCommand",url);
        };
        var saveMainVisit=function(e) {
            var vi=viewModel.get("visit");
            if (!vi) {
                return;
            }
            if (!(vi.dirty)) {
                return;
            }
            var isNew=vi.isNew();
            if (isNew) {
                var dataItem = visitsDs.add(viewModel.get("visit"));
            }
            visitsDs.sync()
            .then(function() {
                utils._onRequestEnd();
                if (isNew) {
                    var newItem=visitsDs.getByUid(dataItem.uid);
                    if (newItem) {
                        var url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+"/"+myTabStripName+"/"+
                            newItem.id.toString()+"/"+tabStripsNames[0];
                        proxy.publish("navigateCommand",url);
                    }
                }
            });
        };

        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedVisit:null,
            gridDs:gridDs,
            suffix:"",
            visit:new VisitModel(),
            isVisitNotSelected:true,
            isVisitSelected:false,
            payTypesDs:payTypesDs,
            visitTypesDs:visitTypesDs,
            userSpecDs:userSpecDs,
            matchedMkbDs:matchedMkbDs,
            mode:"",
            notClosedVisitsGridTitle:"Посещения, не сформированные в талоны",
            isNotClosedVisitsGridCommandsVisible:true,
            createNewVisit: function(e) {
                backUrl="";
                var suffix="0";
                var url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+"/"+myTabStripName+"/"+suffix+"/"+tabStripsNames[0];
                proxy.publish("navigateCommand",url);
            },
            onCancelButtonClicked: function(e) {
                cancelVisitUpdate(e);
            },
            onSaveButtonClicked: function(e) {
                if (mainFormValidator.validate()) {
                    saveMainVisit(e);
                }
            }

        });
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
            viewModel.onEditButtonClicked(e);
        };
        var bindWidgets=function() {
            kendo.bind("#patient-card-visit",viewModel);
            kendo.bind("#exams-not-closed-visits-toolbar",viewModel);
        };
        var onInternalTabActivate=function(e) {
            // when internal tab of visit activated
            var idx=$(e.item).index();
            if (!(idx==currentTab)) {
                var url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+
                    "/"+myTabStripName+"/"+viewModel.visit_id.toString()+"/"+tabStripsNames[idx];
                proxy.publish("navigateCommand",url);
                e.preventDefault;
            }
            else {
                var contentElement=myTabStrip.contentElement(myTabStripOrder);
                $(e.contentElement).css("height",($(contentElement).height()-80)+"px");
                proxy.publish("visitInternalTabActivated",
                    {index:idx, element: e.item, content: e.contentElement,parentModel:viewModel});
                lastSelectedTab=idx;
            }
        };
        var onPatientCardVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            var name=data.name;
            var currentTab=data.currentTab;
            if (!(name==myTabStripName)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripName);
            var tabStrip=data.tabStrip;
            var contentHtml=$("#"+viewId).html();
            myTabStrip = tabStrip.append({
                text: "Посещение "+getModeText(viewModel.mode),
                content: contentHtml
            });
            viewModel.set("selectedPatient", data.patient);
            if (isMyTabCurrent) {
                    myTabStripOrder=order;
                    createTabStrip();
                    bindWidgets();
            }
        };
        var doQuery=function(iPatientId,dDateEnd){
            if (!iPatientId) {
                return;
            }
            if (!dDateEnd) {
                return;
            }
            $(gridSelector).hide();
            kendo.ui.progress($("#visit-main-tab"),true);
            viewModel.gridDs.read({
                patient_id: iPatientId,
                date_end: dDateEnd
            }).
            then(function() {
                kendo.ui.progress($("#visit-main-tab"),false);
                try {
                    $(gridSelector).show();
                    $(gridSelector).data("kendoGrid").resize();
                }
                catch (ex) {

                }
                utils._onRequestEnd();
            });
        };
        var getModeText=function(sMode) {
            if (!sMode) {
                return "";
            }
            if (sMode=="add") {
                return "(нов)";
            }
            if (sMode=="edit") {
                return "(ред)";
            }
            return "("+sMode+")";
        } ;
        var changeTabName=function(myTabStrip) {
            if (myTabStrip) {
                myTabStrip.tabGroup
                    .find("li:eq("+myTabStripOrder.toString()+") .k-link")
                    .text("Посещение "+getModeText(viewModel.mode));
            }
        };
        var splitSuffix=function(suffix) {
            var oRet={
                id:0,
                page:""
            };
            if (!suffix) {
                return oRet;
            }
            var aSuffix=suffix.split("/");
            if (!isNaN(aSuffix[0])) {
                oRet.id=Number(aSuffix[0]);
            }
            if (aSuffix.length>1) {
              oRet.page=aSuffix[1];
            }
            return oRet;
        };
        var initNewVisit=function(v) {
            var pat=viewModel.get("selectedPatient");
            v.set("patient_id",pat.id);
            v.set("patient_name",pat.fio);
            v.set("patient_pin",pat.pin);
            v.set("visit_date",new Date());
            v.user_id = Number(localStorage['last_user']);
            v.otd_id = userSpecDs.data()[0].notdid;
            v.spec_id = userSpecDs.data()[0].nspecid;
            return v;
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                viewModel.suffix="abc";
                viewModel.set("suffix","");
                viewModel.set("visit",new VisitModel());
                viewModel.mode="abc";
                viewModel.set("mode","");
                changeTabName(myTabStrip);
                backUrl="";
            }
            if (e.field=="suffix") {
                var suffix=viewModel.get("suffix")
                suffixNav=splitSuffix(suffix);
                if (suffix) {
                    if (!suffixNav.id) {
                        viewModel.mode="";
                        viewModel.set("mode","add");
                        var v=viewModel.get("visit");
                        if (!v.id) {
                            if (!(v.patient_id===navigationPath.id)) {
                                v=new VisitModel();
                                v=initNewVisit(v);
                                viewModel.set("visit",v);
                            }
                        }
                    }
                    else {
                        var v=viewModel.get("visit");
                        if (!(v.id===suffixNav.id)) {
                            viewModel.mode="";
                            viewModel.set("mode","edit");
                            var dataItem=visitsDs.get(suffixNav.id);
                            if (dataItem) {
                                viewModel.set("visit", dataItem);
                            }
                        }
                    }
                }
                viewModel.isVisitSelected=!(viewModel.suffix);
                viewModel.set("isVisitSelected",viewModel.suffix);
            }
            if (e.field=="isVisitSelected") {
                viewModel.set("isVisitNotSelected",!(viewModel.isVisitSelected));
                if (viewModel.get("isVisitSelected")) {
                    createTabStrips();
                }
            }
            if (e.field=="mode") {
                viewModel.set("isNotClosedVisitsGridCommandsVisible",!(viewModel.mode));
                changeTabName(myTabStrip);
            }
        };
        var onTabActivated=function(data) {
            var idx=data.index;
            if (!(name==myTabStripName)) {
                return true;
            }
            myTabStripOrder=idx;
            // resize grid
            var contentElement=data.content;
            $(gridSelector).css("height",($(contentElement).height()-5)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
            //
            lastSuffix=viewModel.get("suffix");
            navigationPath=data.navigationPath;
            var navPath=data.navigationPath;
            if (navPath.suffix) {
                var aSuffix=navPath.suffix.split("/");
                if (!(isNaN(aSuffix[0]))) {
                    viewModel.suffix="";
                    viewModel.set("suffix",navPath.suffix);
                }
            }
            var suffix=viewModel.get("suffix");
            if (suffix) {
                var aSuffix=suffix.split("/");
                var url=window.location.href;
                if (!(url.endsWith(myTabStripName+"/"+suffix))) {
                    url="/"+navigationPath.topic+"/"+navigationPath.id.toString()+"/"+myTabStripName+"/"+suffix;
                    proxy.publish("navigateCommand",url);
                }
                else {
                    viewModel.suffix="";
                    viewModel.set("suffix",suffix);
                }
            }
        };
        var onCreateValidator=function(data) {
            mainFormValidator=mainValidator.create(data);
        };
        //
        proxy.subscribe("patientCardVisible",onPatientCardVisible);
        proxy.subscribe("patientCardTabActivated",onTabActivated);
        proxy.subscribe("createMainFormValidator",onCreateValidator);
        proxy.subscribe("visitsBackUrl",function(data) {
            backUrl=data.backUrl;
        });
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);