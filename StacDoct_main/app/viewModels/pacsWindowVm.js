/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/pacsWindow','services/proxyService',
        'dataSources/pacsDataSource','utils'],
    function(kendo,editTemplateId,proxy,dsPacs,utils) {
        "use strict";
        var viewModel;
        var kendoWindow=null;
        var validator=null;
        var onClose=function(e) {
            var selector="#pacsWindow-open";
            kendo.unbind($("#pacs-window"));
            kendo.unbind($("#toolbar-pacs"));
            kendoWindow.destroy();
            $(selector).remove();
        };
        viewModel= new kendo.data.ObservableObject({
            dataSource: dsPacs.pacsDs,
            issuersDs:dsPacs.issuersDs,
            dateStart:new Date(),
            dateEnd: new Date(),
            issuer: dsPacs.issuersDs._data[0].id,
            validate: function() {
                var bRet=true;
                var vm=viewModel;
                var iDays=utils.getDaysBetweenDates(vm.get("dateStart"),vm.get("dateEnd"));
                if (iDays>31) {
                    bRet=false;
                    kendo.alert("Период не может быть более одного месяца!");
                }
                return bRet;
            },
            doQuery: function(e) {
                var bRet=validator.validate();
                if (bRet) {
                    if (viewModel.validate()) {
                        viewModel.dataSource.read({
                            d1:viewModel.get("dateStart"),
                            d2:viewModel.get("dateEnd"),
                            issuer:viewModel.get("issuer")
                        })
                    }
                }
            },
            onIssuerChange:function(e) {
              viewModel.doQuery();
            },
            onGridRowChange: function(e) {
                var grid=e.sender;
                if (grid) {
                    var row=grid.select();
                    if (row) {
                        var dataItem=grid.dataItem(row);
                        if (dataItem.httplink) {
                            openInNewTab(dataItem.httplink);
                        }
                    }
                }
            },
            open: function() {
                kendoWindow=$("<div id='pacsWindow-open'/>").kendoWindow({
                    title: "ПАКС",
                    modal:true,
                    /*
                    width:800,
                    height:600,
                    */
                    animation: false,
                    close:onClose,
                    content: {
                        template: $("#"+editTemplateId).html()
                    }
                }).data("kendoWindow");
                kendoWindow.open().maximize();
                setTimeout(function() {
                    var height=($(document).height()-50-100).toString()+"px";
                    $("div#pacs-content").css("height",height);
                    //.css("overflow-y","scroll");
                },10);
                kendo.bind($("#pacs-window"),viewModel);
                kendo.bind($("form#pacs-form"),viewModel);
                validator=$("form#pacs-form").kendoValidator({
                    validateOnBlur:false,
                    rules: {
                        datepicker: function(input) {
                            var iRez=true;
                            if (input.is("[data-role=datepicker]")) {
                                if (input.attr("required")) {
                                    iRez= input.data("kendoDatePicker").value();
                                }
                                else {
                                    if (input.val()) {
                                        iRez= input.data("kendoDatePicker").value();
                                    }
                                }
                            }
                            return iRez;
                        },
                        maxDate: function(input) {
                            if (input.is("[data-role=datepicker]")) {
                                return (kendo.toString(input.data("kendoDatePicker").value(),"yyyyMMdd")<=kendo.toString(new Date(),"yyyyMMdd"));
                            }
                            else {
                                return true;
                            }
                        },
                        resultDate: function(input) {
                            var iRez=true;
                            if (input.is("#date-end")) {
                                var resultDta=input.data("kendoDatePicker").value();
                                var bmDta=$("input#date-start").data("kendoDatePicker").value();
                                if (bmDta && resultDta) {
                                    if (kendo.toString(resultDta,"yyyyMMdd")<kendo.toString(bmDta,"yyyyMMdd")) {
                                        iRez=false;
                                    }
                                }
                            }
                            return iRez;
                        },
                    },
                    messages: {
                        datepicker: "Дата неверна!",
                        maxDate: "Дата больше текущей!",
                        resultDate: "Дата окончания меньше даты начала!",
                    }
                }).data("kendoValidator");
            }
         });


        //
//        console.log(autoTemplateId);
        return viewModel;
    }

);
