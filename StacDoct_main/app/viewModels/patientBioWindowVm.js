/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","services/proxyService",
        "dataSources/patientBioDataSource",
        "dataSources/bloodSprDataSource",
        'kendo-template!templates/patientBioWindow',
        "models/patientBioModel",
        "utils"
        ],
    function(kendo,proxy,bioDs,bloodDs,editTemplateId,Model,utils) {
        'use strict';
        var kendoWindow;
        var viewModel;
        var sTitle="";
        viewModel= new kendo.data.ObservableObject({
            dataSource:bioDs,
            bloodGroupDs:bloodDs.groups,
            bloodRezusDs:bloodDs.rezus,
            bloodFenotypeDs:bloodDs.fenotypes,
            bioModel:null,
            imt:null,
            imtLabel:"",
            isSaveVisible:false,
            close:function(e) {
                kendoWindow.close();
            },
            saveData:function(e) {
                kendo.ui.progress($("#patient_bio_window"),true);
                viewModel.dataSource.sync().then(function() {
                    kendo.ui.progress($("#patient_bio_window"),false);
                    proxy.publish("bioDataChanged",viewModel.dataSource._data[0]);    // subscribed in ib.js
//                    viewModel.close();
                });
            },
            clearBio1: function (e) {
                var vm=viewModel;
                vm.set("bioModel.height",null);
                vm.set("bioModel.weight",null);
                vm.set("imt",null);
                vm.set("imtLabel","");
            },
            clearBio2: function (e) {
                var vm=viewModel;
                vm.set("bioModel.blood_group",null);
                vm.set("bioModel.blood_rezus",null);
                vm.set("bioModel.blood_fenotype",null);
            }

        });
        var closeWindow=function(e) {
            var selector="#patientBioWindow";
            kendo.unbind("#patient_bio_window");
            kendoWindow.destroy();
            $(selector).remove();
        };
        var showWindow=function() {
            kendoWindow=$("<div id='patientBioWindow'/>").kendoWindow({
                title: sTitle,
                modal:true,
                /*
                animation:false,
                width:1000,
                maxWidth:1000, */
                width:500,
                animation: false,
                content: {
                    template: $("#"+editTemplateId).html()
                },
                close: closeWindow
            }).data("kendoWindow");
            kendo.bind("#patient_bio_window",viewModel);
            kendoWindow.open().center();
        };
        var onShowBioWindow=function(data) {
            sTitle=data.fio;
           var ask_id=data.ask_id;
           var ves=data.ves;
           var rost=data.rost;
           var curUserId=Number(localStorage['last_user']);
           viewModel.set("isSaveVisible",((data.user_id==curUserId) || data.user2_id==curUserId));
           kendo.ui.progress($("#ib"),true);
           viewModel.dataSource.read({ask_id:data.ask_id}).then(function() {
               kendo.ui.progress($("#ib"),false);
               var ds=viewModel.dataSource;
               var data=ds._data;
               if (!data.length) {
                   var model=new Model();
                   model.set("ask_id",ask_id);
                   ds.add(model)
               }
               viewModel.set("bioModel",ds._data[0]);
               if (!viewModel.bioModel.height) {
                   viewModel.set("bioModel.height",rost);
               }
               if (!viewModel.bioModel.weight) {
                   viewModel.set("bioModel.weight",ves);
               }
               var imt=utils.calculateImt(viewModel.get("bioModel.height"),viewModel.get("bioModel.weight"));
               viewModel.set("imt",imt);
               viewModel.set("imtLabel",utils.describeImt(imt));
               showWindow();
           });
        };
        var onVmChange=function(e) {
            var field=e.field;
            if ((field=="bioModel.height") || (field=="bioModel.weight")) {
                var imt=utils.calculateImt(viewModel.get("bioModel.height"),viewModel.get("bioModel.weight"));
                viewModel.set("imt",imt);
                viewModel.set("imtLabel",utils.describeImt(imt));
            }
        };
        proxy.subscribe("showBioWindow",onShowBioWindow);
        viewModel.set("dataSource",bioDs);
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);