define(['kendo.all.min','utils','kendo-template!views/patientCardVisitAdd',
        'services/proxyService',
        'models/visitModel',
        'dataSources/paymentTypesDataSource',
        'dataSources/visitTypesDataSource',
        'dataSources/userSpecialityDataSource',
        'dataSources/autoCompleteMkbDataSource'
    ],
    function(kendo,utils,viewId,proxy,VisitModel,payTypesDs,visitTypesDs,userSpecDs,matchedMkbDs) {
        'use strict';
        var backUrl="";
        var mySuffixPattern="add";
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
            var autoComplete=$("#mkb").data("kendoAutoComplete");
            if (autoComplete) {
                autoComplete.list.width(800);
            }
        };
        var onActivate= function(data) {
            var suffix=data.suffix;
            var iPos=suffix.indexOf(mySuffixPattern);
            if (iPos==0) {
                backUrl=data.backUrl;
                var tabStrip=data.tabStrip;
                var order=data.order;
                visitsDs=data.visitsDs;
                var content=tabStrip.contentElement(order);
                $(content).html($("#"+viewId).html());
                viewModel.set("selectedPatient",data.selectedPatient);
                bindWidgets();
            }
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {
                    var v=new VisitModel();
                    v.patient_id=viewModel.selectedPatient.evn;
                    v.patient_pin=viewModel.selectedPatient.pin;
                    v.patient_name=viewModel.selectedPatient.fio;
                    v.visit_date=new Date();
                    v.user_id=Number(localStorage['last_user']);
                    v.otd_id=userSpecDs.data()[0].notdid;
                    v.spec_id=userSpecDs.data()[0].nspecid;

                    viewModel.set("visit",v);
                }
            }
        };

        proxy.subscribe("suffixChanged",onActivate);
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);