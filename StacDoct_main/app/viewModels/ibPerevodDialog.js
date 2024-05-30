/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/ibPerevodDialog','services/proxyService','alertify',
        'dataSources/ibPerevodOtdelsListDataSource',
        'dataSources/ibPerevodOtdels2ListDataSource',
        'dataSources/ibPerevodDoctorsListDataSource',
        'dataSources/ibCreatePerevodDataSource',
        'dataSources/allOtdelsDataSource'
    ],
    function(kendo,editTemplateId,proxy,alertify,dsOtdels,dsOtdels2,dsDoctors,dsCreate,dsAllOtdels) {
        "use strict";
        var oritCode="ОРИТ";
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            execDs:dsCreate,
            selectedDate:null,
            selectedTime:null,
            otdels:dsOtdels,
            otdels2:dsOtdels2,
            otdelsDoctors:dsDoctors,
            allOtdelsDs:dsAllOtdels,
            getOtdelName: function(sOtdCode) {
                var sRet=sOtdCode;
                var ds=viewModel.allOtdelsDs;
                if (ds._data) {
                    if (ds._data.length) {
                        for (var i=0;i<ds._data.length;i++) {
                            var dataItem=ds.at(i);
                            if (dataItem.code==sOtdCode) {
                                sRet=dataItem.name || "";
                                break;
                            }
                        }
                    }
                }
                return sRet;
            },
            currentDoctorName: function() {
                var selIb=proxy.getSessionObject("selectedIb");
                return (selIb.user_name) ? selIb.user_name : "не назначен";
            },
            currentOtdelName1: function() {
                var sRet="";
                var selIb=proxy.getSessionObject("selectedIb");
                if (selIb) {
                    sRet=selIb.otd1;
                }
                sRet=viewModel.getOtdelName(sRet);
                return (sRet) ? sRet : "не назначено";
            },
            currentOtdelName2: function() {
                var sRet="";
                var selIb=proxy.getSessionObject("selectedIb");
                if (selIb) {
                    sRet=selIb.otd2;
                }
                sRet=viewModel.getOtdelName(sRet);
                return (sRet) ? sRet : "не назначено";
            },
            currentOtdelName: function() {
                var sRet="";
                var selIb=proxy.getSessionObject("selectedIb");
                if (selIb) {
                    sRet=selIb.otd1;
                }
                if (selIb.otd2 && !(selIb.otd2==selIb.otd1)) {
                    sRet=sRet+"/"+selIb.otd2;
                }
                return (sRet) ? sRet : "не назначено";
            },
            selectedOtdel:null,
            selectedOtdel2:null,
            selectedOtdelDoctor:null,
            isDoctorListEnabled:false,
            isExecuteEnabled:false,
            onOtdelChange: function(e) {
                var value=e.sender.value();
                this.set("selectedOtdel2","");
                if ((value /*&& !(value==oritCode)*/)) {
                    var selIb=proxy.getSessionObject("selectedIb");
                    kendo.ui.progress($("#ib-perevod-window"), true);
                    this.otdelsDoctors.read({otd1: value, mode: 1}).then(function () {
                        viewModel.otdels2.read({
                            new_otd1:value,
                            otd1:selIb.otd1,
                            otd2:selIb.otd2,
                            mode: 22
                        }).then(function() {
                            kendo.ui.progress($("#ib-perevod-window"), false);
                            if (!(selIb.otd1==value)) {
                                var otdels2=$("#otdels2").data("kendoDropDownList");
                                try {
                                    otdels2.focus();
                                    otdels2.open();
                                }
                                catch (ex) {

                                }
                            }
                        });
                    });
                }
            },
            onOtdel2Change: function(e) {
                var otdels2=$("#otdels-doctors").data("kendoDropDownList");
                try {
                    otdels2.focus();
                    otdels2.open();
                }
                catch (ex) {

                }

            },
            open: function() {
                viewModel.set("selectedOtdel","");
                viewModel.set("selectedOtdel2","");
                viewModel.set("selectedOtdelDoctor","");
                viewModel.set("selectedOtdelDoctorName","");
                viewModel.set("isExecuteEnabled",false);
                viewModel.set("isExecuted",false);

                var selIb=proxy.getSessionObject("selectedIb");
                viewModel.otdels.read({
                    otd1:selIb.otd1,
                    otd2:selIb.otd2,
                    mode: 21
                }).then(function() {
                    kendo.ui.progress($("#ib-perevod-window"), false);
                    viewModel.set("selectedDate",new Date());
                    viewModel.set("selectedTime",new Date());
                    kendoWindow.open().center();
                    kendo.bind($("#ib-perevod-window"),viewModel);
                    var ds=viewModel.otdels;
                    for (var i=0;i<ds.data().length;i++) {
                        var dataItem=ds.at(i);
                        if (dataItem.code.trim()==selIb.otd1) {
                            viewModel.set("selectedOtdel",dataItem.code.trim());
                            var dropDownList=$("#otdels").data("kendoDropDownList");
                            if (dropDownList) {
                                dropDownList.select(i+1);
                                dropDownList.trigger("change");
                            }
                            break;
                        }
                    }

                });
            },
            validate: function() {
                var dateFieldVal=$("#perevod_date").val();
                var timeFieldVal=$("#perevod_time").val();
                var selIb=proxy.getSessionObject("selectedIb");
                var d0=kendo.parseDate(dateFieldVal,"dd.MM.yyyy");
                if (!d0) {
                    kendo.alert("Дата перевода указана неверно!");
                    return false;
                }
                d0=kendo.toString(d0,"yyyy.MM.dd");
                var selIb=proxy.getSessionObject("selectedIb");
                var d1=kendo.toString(kendo.parseDate(selIb.date_ask),"yyyy.MM.dd");
                var d2=kendo.toString(new Date(),"yyyy.MM.dd");
                if (d0<d1 ) {
                    kendo.alert("Дата перевода не может быть ранее даты госпитализации!");
                    return false;
                }
                if (d0>d2 ) {
                    kendo.alert("Дата перевода не может быть более текущей даты!");
                    return false;
                }
                var d0=kendo.parseDate(timeFieldVal,"HH:mm");
                if (!d0) {
                    kendo.alert("Время перевода указано неверно!");
                    return false;
                }
                if (!viewModel.get("selectedOtdel")) {
                    kendo.alert("Не указано отделение за которым будет закреплен пациент!");
                    return false;
                }
                if (!viewModel.get("selectedOtdel2")) {
                    kendo.alert("Не указано отделение где будет находится пациент!");
                    return false;
                }
                if (!viewModel.get("selectedOtdelDoctor")) {
                    kendo.alert("Не указан врач за которым будет закреплен пациент!");
                    return false;
                }
                if (viewModel.selectedOtdel.code==selIb.otd1 && viewModel.selectedOtdel2.code==selIb.otd2) {
                    kendo.alert("Текущие отделения совпадают с указанными в данных о переводе!");
                    return false;
                }
                return true;
            },
            doCommand: function() {
                if (!(viewModel.validate())) {
                    return;
                }
                var newDoctor=viewModel.get("selectedOtdelDoctor");
                var newDoctorId=(newDoctor) ? newDoctor : 0;
                var selIb=proxy.getSessionObject("selectedIb");
                var otd1=viewModel.get("selectedOtdel");
                var otd2=viewModel.get("selectedOtdel2");
                kendo.ui.progress($("#ib-perevod-window"), true);
                var ds=viewModel.execDs;
                var oldId=0;
                if (ds._data) {
                    if (ds._data.length) {
                        oldId=ds._data[0].id;
                    }
                }
                ds.read({
                    ask_id:selIb.ask_id,
                    date:kendo.toString(viewModel.selectedDate,"yyyyMMdd"),
                    time:kendo.toString(viewModel.selectedTime,"HH:mm"),
                    otd1:otd1,
                    otd2:otd2,
                    new_user_id:newDoctorId
                }).then(function() {
                    kendo.ui.progress($("#ib-perevod-window"), false);
                    if (ds._data.length) {
                        if (!(ds._data[0].id==oldId)) {
                            viewModel.set("isExecuted",true);
                            kendo.alert("Пациент переведен!");
                            kendoWindow.close();
                        }
                    }
                });
//                proxy.publish("perevodIb",{new_otd:viewModel.get("selectedOtdel").code,
//                    new_doctor:newDoctorId, perevodDate:viewModel.selectedDate});
            },
            cancelCommand: function() {
                if (!viewModel.get("isExecuted")) {
                    kendo.confirm("<strong>Пациент еще не переведен!</strong><br>Вы действительно хотите выйти?").
                        then(function() {
                            kendoWindow.close();
                    })
                }
                else {
                    kendoWindow.close();
                }
            }
        });


//        kendo.bind($("#"+editTemplateId),viewModel);

        var kendoWindow=$("<div id='perevodDialog'/>").kendoWindow({
            title: "Перевод пациента",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            },
            width:680,
            actions:[]
        }).data("kendoWindow");

        var onVmChange= function(e) {
            var selOtd=viewModel.get("selectedOtdel");
            var selOtd2=viewModel.get("selectedOtdel2");
            var newDoctor=viewModel.get("selectedOtdelDoctor");
//            var newDoctorId=(newDoctor) ? newDoctor.user_id : 0;
            var perevodDate=viewModel.get("selectedDate");
            var perevodTime=viewModel.get("selectedTime");
            if (e.field=="selectedOtdel") {
                if (!selOtd) {
                    viewModel.set("isDoctorListEnabled",false);
                }
                else {
//                    viewModel.set("isDoctorListEnabled",(!(selOtd.code==oritCode)));
                    viewModel.set("isDoctorListEnabled",true);
                }
            }
            if (!newDoctor) {
                //viewModel.set("isExecuteEnabled",perevodDate && selOtd && (selOtd.code==oritCode));
                viewModel.set("isExecuteEnabled",false);
            }
            else {
                /*
                viewModel.set("isExecuteEnabled",perevodDate && perevodTime
                    && selOtd && (selOtd.code) && selOtd2 && (selOtd2.code) && newDoctor);
                */
                viewModel.set("isExecuteEnabled",perevodDate && perevodTime
                    && selOtd  && selOtd2 && newDoctor);
            }
        };
        viewModel.bind("change",onVmChange);
        return viewModel;
    }

);
