/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/ibZakreplDialog','services/proxyService','alertify',
        'dataSources/ibZakreplDoctorsListDataSource'],
    function(kendo,editTemplateId,proxy,alertify,dsDoctors) {
        "use strict";
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            doctors:dsDoctors,
            currentDoctorName: function() {
                var selIb=proxy.getSessionObject("selectedIb");
                return (selIb.user_name) ? selIb.user_name : "не назначен";
            },
            selectedDoctor:null,
            open: function() {
                viewModel.set("selectedDoctor",null);
                kendoWindow.open().center();
                kendo.bind($("#ib-zakrepl-window"),viewModel);
            },
            doCommand: function() {
                proxy.publish("zakreplenieIb",viewModel.get("selectedDoctor").user_id);
                kendoWindow.close();
            },
            cancelCommand: function() {
                kendoWindow.close();
            }
        });


//        kendo.bind($("#"+editTemplateId),viewModel);

        var kendoWindow=$("<div id='zakreplDialog'/>").kendoWindow({
            title: "Закрепление пациента",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
        return viewModel;
    }

);
