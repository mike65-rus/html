/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/doc58SesPhoneDialog','services/proxyService','alertify'
        ],
    function(kendo,editTemplateId,proxy,alertify) {
        "use strict";
        var viewModel;
        var kendoWindow;
        viewModel= new kendo.data.ObservableObject({
            isPhoneCallVisible:true,
            isCallResultVisible:false,
            isCallResultVisible2:false,
            isFioVisible:false,
            isDoEnabled:false,
            phoneTime:null,
            open: function(callerUuid) {
                viewModel.set("isPhoneCallVisible",true);
                viewModel.set("isCallResultVisible",false);
                viewModel.set("isCallResultVisible2",false);
                viewModel.set("isFioVisible",false);
                viewModel.set("fio","");
                viewModel.set("isDoEnabled",false);
                viewModel.set("callerUuid",callerUuid);

                kendoWindow=$("<div id='doc58SesPhone'/>").kendoWindow({
                    title: "Сообщение в СЭС",
                    modal:true,
                    content: {
                        template: $("#"+editTemplateId).html()
                    },
                    position: {
                        top:0,
                        left:0
                    },
                    close: function(e) {
                        kendo.unbind($("#doc-58-ses-phone-window"));
                        kendoWindow.destroy();
                        $("#doc58SesPhone").remove();
                    }

                }).data("kendoWindow");
                kendoWindow.open();
                kendo.bind($("#doc-58-ses-phone-window"),viewModel);
            },
            doPhoneCall:function(e) {
                viewModel.set("phoneTime",new Date());
                viewModel.set("isPhoneCallVisible",false);
                viewModel.set("isCallResultVisible",true);
                viewModel.set("isCallResultVisible2",true);
            },
            redoCall: function(e) {
                viewModel.set("phoneTime",null);
                viewModel.set("isPhoneCallVisible",true);
                viewModel.set("isCallResultVisible",false);
                viewModel.set("isCallResultVisible2",false);
                viewModel.set("isFioVisible",false);
                viewModel.set("isDoEnabled",false);
            },
            callAborted: function(e) {
                viewModel.set("isFioVisible",false);
                viewModel.set("isCallResultVisible2",false);
                viewModel.set("isDoEnabled",true);

            },
            callResponsed: function(e) {
                viewModel.set("isFioVisible",true);
                viewModel.set("isCallResultVisible",false);
                viewModel.set("isCallResultVisible2",false);
                viewModel.set("isDoEnabled",true);
                setTimeout(function() {
                    $("#fio-person-ses").focus();
                },10);
            },
            doCommand: function() {
                if (viewModel.get("isFioVisible")) {
                    if (!(viewModel.get("fio").trim())) {
                        kendo.alert("Необходимо указать ФИО сотрудника СЭС, принявшего сообщение");
                        return;
                    }
                }
                proxy.publish("doc58SesPhoneData",
                    {callerUuid:viewModel.get("callerUuid"),cancelled:false,
                    phoneTime:viewModel.get("phoneTime"),
                    fio:viewModel.get("fio").trim()});
                kendoWindow.close();
            },
            cancelCommand: function() {
                proxy.publish("doc58SesPhoneData",
                    {callerUuid:viewModel.get("callerUuid"),
                    cancelled:true});
                kendoWindow.close();
            }
        });


//        kendo.bind($("#"+editTemplateId),viewModel);

        return viewModel;
    }

);
