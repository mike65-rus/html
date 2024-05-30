/**
 * Created by 1 on 07.04.2018.
 */
define(['kendo.all.min','kendo-template!views/selectPatientWindow',
    'dataSources/selectPatientDataSource','services/proxyService','utils'],
    function(kendo,viewId,ds,proxy,utils) {
   'use strict';
    var viewModel;
    var kendoWindow;
    var windowSelector="#newPatientWindow";
    var clearModel=function() {
        viewModel.set("selectedPatient",null);
        viewModel.set("currentPatientInList",null);
    };
    var onDsRequestStart=function(e) {
        clearModel();
        kendo.ui.progress($(windowSelector),true);
    };
    var onDsRequestEnd=function(e) {
        kendo.ui.progress($(windowSelector),false);
        utils._onRequestEnd(e);
    };
    var onDsChange=function(e) {
        var items= e.items;
        if (items.length) {
            listBox.refresh();
            listBox.select(listBox.items().first());

        }
    };
    var onCloseNewPatientWindow=function(e) {
        var selector=windowSelector;
        kendo.unbind(selector);
        kendoWindow.destroy();
        $(selector).remove();
        ds.unbind("requestStart");
        ds.unbind("requestEnd");
        ds.unbind("change");
    };
    var listBox;
    var onListBoxChange=function(e) {
        var lb;
        if (e) {
            lb=e.sender;
        }
        else {
            lb=listBox;
        }
        var element = lb.select();
        var dataItem = lb.dataItem(element[0]);
        viewModel.set("currentPatientInList",dataItem);
    };
    var onListBoxDblClick=function(e) {
        onListBoxChange();
        viewModel.selectPatient();
    };
    var bindListBox=function() {
        var customTemplate = '<span class="k-state-default"> #: data.fio # &nbsp; #: data.pin #</span>';
            listBox=$("#patientListBox").kendoListBox({
            dataSource:ds,
            dataTextField: "fio",
            dataValueField:"evn",
            autoBind: false,
            template:customTemplate,
            change: onListBoxChange
        }).data("kendoListBox");
        var lb=$(windowSelector).find(".k-list").first();
        $(lb).on("dblclick","li",onListBoxDblClick);
    };
    var input;
    var showNewPatientWindow=function() {
        clearModel();
        var wndDiv=$("<div id='newPatientWindow'/>");
        kendoWindow=$(wndDiv).kendoWindow({
            title: "Выбор пациента",
            modal:true,
            content: {
                template: $("#"+viewId).html()
            },
            animation: false,
            close: onCloseNewPatientWindow
        }).data("kendoWindow");
        kendo.bind($(wndDiv),viewModel);
        bindListBox();
        ds.bind("requestStart",onDsRequestStart);
        ds.bind("requestEnd",onDsRequestEnd);
        ds.bind("change",onDsChange);
        kendoWindow.center().open();
        input=$("#select-patient-window").find(".k-input").first();
        setTimeout(function() {
            try {
                $(input).keyup(function(event){
                    if(event.keyCode == 13){
                        viewModel.doSearch();
                    }
                });
                $(input)[0].focus();
            }
            catch (ex) {
            }
        },500);
    };
    var callbackNavigateUrl="";
    viewModel= new kendo.data.ObservableObject({
        selectedPatient: null,
        selectedPatientLabel:"",
        currentPatientLabel:"",
        currentPatientInList:null,
        isSelectPatientEnabled:false,
        newPatient: function(postNavigateUrl) {
            callbackNavigateUrl=postNavigateUrl;
            showNewPatientWindow();
        },
        doSearch: function() {
            var inputText=$("#select-patient-window").find(".k-input").first().val().trim();
            if (inputText && inputText.length>=4) {
                if (utils.isPin(inputText.toUpperCase())) {
                    ds.read({
                        pin: inputText.toUpperCase(),
                        fio: ""
                    });
                }
                else {
                    var sFio=inputText.capitalize(true);
                    ds.read({
                        pin: "",
                        fio: sFio
                    });
                }
            }
            else {
                kendo.alert("Длина поисковогоя должна быть не менее 4-х символов!")
            }
        },
        selectPatient: function() {
            var selector=windowSelector;
            viewModel.set("selectedPatient",viewModel.get("currentPatientInList"));
            $(selector).data("kendoWindow").close();
            if (callbackNavigateUrl) {
                proxy.publish("navigateCommand","/"+callbackNavigateUrl+"/"+viewModel.get("selectedPatient").evn.toString());
            }
        },
        cancelSelectPatient: function() {
            var selector=windowSelector;
            $(selector).data("kendoWindow").close();
        }
    });
    var onVmChange=function(e) {
        if (e.field=="currentPatientInList") {
            var patient=viewModel.get("currentPatientInList");
            if (patient) {
                viewModel.set("currentPatientLabel",patient.fio+" "+patient.pin);
                viewModel.set("isSelectPatientEnabled",true);
            }
            else {
                viewModel.set("currentPatientLabel","");
                viewModel.set("isSelectPatientEnabled",false);
            }
        }
    };
    viewModel.bind("change",onVmChange);
    return viewModel;
});
