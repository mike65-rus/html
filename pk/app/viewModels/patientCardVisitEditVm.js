define(['kendo.all.min','utils','kendo-template!views/patientCardVisitEdit',
        'kendo-template!views/patientCardVisitAdd',
        'services/proxyService',
        'models/visitModel',
        'dataSources/paymentTypesDataSource',
        'dataSources/visitTypesDataSource',
        'dataSources/userSpecialityDataSource',
        'dataSources/autoCompleteMkbDataSource',
        'dataSources/visitsListDataSource',
    ],
    function(kendo,utils,viewId,viewIdAdd,proxy,VisitModel,payTypesDs,visitTypesDs,userSpecDs,matchedMkbDs,mainVisitsDs) {
        'use strict';
        var backUrl="";
        var mySuffixPattern="edit";
        var visitsDs=null;
        var goBack=function(e) {
            proxy.publish("visitNavigationBack",
                {backUrl:backUrl,recordId:viewModel.recordId});
        };
        var save=function(e) {
            var dataItem=visitsDs.add(viewModel.get("visit"));
            visitsDs.sync().then(function() {
                utils._onRequestEnd();
                var newItem=visitsDs.getByUid(dataItem.uid);
                if (newItem) {
//                    kendo.alert(newItem.visit_id);
                    viewModel.set("selectedPatient",null);
                    backUrl=backUrl+"/edit/"+newItem.visit_id.toString();
                    goBack();
                }
            }
            );
        };
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            visit_id:0,
            visit:null,
            recordId:null,
            payTypesDs:payTypesDs,
            visitTypesDs:visitTypesDs,
            userSpecDs:userSpecDs,
            matchedMkbDs:matchedMkbDs,
            onBackToListButtonClicked:function(e) {
                goBack(e);
            },
            onCancelButtonClicked: function(e) {
                goBack(e);
            },
            onSaveButtonClicked: function(e) {
                save(e);
            }
        });
        var bindWidgets=function() {
            kendo.bind("#visits-add",viewModel);
            $("#mkb").on("keypress",utils.rusLatMkbEventListener);
            var autoComplete=$("#mkb").data("kendoAutoComplete");
            if (autoComplete) {
                autoComplete.list.width(800);
            }
        };
        var afterMainDsReaded=function(data) {
            backUrl=data.backUrl;
            var tabStrip=data.tabStrip;
            var order=data.order;
            viewModel.set("selectedPatient",data.selectedPatient);
            var content=tabStrip.contentElement(order);
            $(content).html($("#"+viewId).html());
            $(content).find("#left-pane").first().html($("#"+viewIdAdd).html());
            var aSuffix=data.suffix.split("/");
            if (aSuffix.length<2) {
                viewModel.set("visit_id",0);
            }
            else {
                viewModel.set("visit_id",Number(aSuffix[1]));
            }
            kendo.init("#visit_edit");
            bindWidgets();
        };
        var onActivate= function(data) {
            var suffix=data.suffix;
            var iPos=suffix.indexOf(mySuffixPattern);
            if (iPos==0) {
                visitsDs=data.visitsDs;
                if ((!visitsDs) || (!(visitsDs.data().length))) {
                    visitsDs=mainVisitsDs;
                    var d1=utils.addDays(new Date(),0-(31*12*3));
                    visitsDs.read({
                        patient_id: data.selectedPatient.evn,
                        date_end: d1
                    }).then(function() {
                        afterMainDsReaded(data)
                    });
                }
                else {
                    afterMainDsReaded(data);
                }
            }
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {

                }
            }
            if (e.field=="visit_id") {
                var dataItem=visitsDs.get(viewModel.visit_id);
                if (dataItem) {
                    viewModel.set("visit",dataItem);
                }
            }
        };
        var onTabActivated=function(data) {
            var idx=data.index;
            if (!(idx==91)) {
                return;
            }
            // resize grid
            var contentElement=data.content;
            $(contentElement).find(".k-splitter").each(function(idx,el) {
                $(el).css("height",($(contentElement).height()-5)+"px");
                kendo.resize($(el));
            });
        };
        proxy.subscribe("suffixChanged",onActivate);
        proxy.subscribe("suffixTabActivated",onTabActivated);
        viewModel.bind("change",onVmChange);

        return viewModel;
    }
);