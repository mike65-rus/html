define(["kendo.all.min",'kendo-template!views/grippDonos','services/proxyService'
        ],
    function(kendo,editTemplateId,proxy) {
        "use strict";
        var kendoWindow;
        var dialogSelector="grippDonosDialog";
        var bindableSelector="gripp-donos-data";
        var onClose=function(e) {
            var selector=dialogSelector;
            kendo.unbind("#"+bindableSelector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        var validator;

        var viewModel=new kendo.data.ObservableObject({
            parentModel:null,
            ot58:null,
            isDeath:false,
            close: function(e) {
                this.get("parentModel").cancelGrippDonos(this.get("model"));
                kendoWindow.close();
            },
            save:function(e) {
                if (validator.validate()) {
                    this.get("parentModel").saveGrippDonos(this.get("model"));
                    this.close();
                }
                else {
                    kendo.alert("<strong>Необходимо исправить ошибки!</strong><hr>"+validator.errors().join('<br>'));
                }
            },
            open: function(data) {
                this.set("parentModel",data.parentModel);
                this.set("model",data.model);
                this.set("dsSpr",data.dsSpr);
                kendoWindow=$("<div id='"+dialogSelector+"'/>").kendoWindow({
                    title: "Донесение в РосПотребНадзор. "+data.model.fio,
                    actions:[],
                    height:650,
                    width:800,
                    modal:true,
                    content: {
                        template: $("#"+editTemplateId).html()
                    },
                    animation: false,
                    close:onClose
                }).data("kendoWindow");
                kendoWindow.open().center();
                kendo.bind("#"+bindableSelector,viewModel);
                validator=$("#"+bindableSelector).find("form").first().kendoValidator({
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
                            if (input.is("#date_result")) {
                                var resultDta=input.data("kendoDatePicker").value();
                                var bmDta=$("input#date_issl").data("kendoDatePicker").value();
                                if (bmDta && resultDta) {
                                    if (kendo.toString(resultDta,"yyyyMMdd")<kendo.toString(bmDta,"yyyyMMdd")) {
                                        iRez=false;
                                    }
                                }
                            }
                            return iRez;
                        },
                        gripp: function(input) {
                            var iRez=true;
                            if (input.is("#diag_osn")) {
                                var text=input.val();
                                if (text) {
                                    if (text.toUpperCase().indexOf("ГРИПП")<0) {
                                        // iRez=false;
                                    }
                                }
                            }
                            return iRez;
                        }
                    },
                    messages: {
                        datepicker: "Дата неверна!",
                        maxDate: "Дата больше текущей!",
                        resultDate: "Дата результата меньше даты исследования!",
                        gripp: "В основном диагнозе нет слова Грипп"
                    }
                }).data("kendoValidator");
            }
        });
        var onVmChange=function(e) {
            var field=e.field;
            if (field=='model.date_death') {
                var dta=viewModel.get("model").get("date_death");
                if (dta) {
                    viewModel.set("isDeath",true);
                }
                else {
                    viewModel.set("isDeath",false);
                    viewModel.get("model").set("diag_pat1","");
                    viewModel.get("model").set("diag_pat2","");
                }
            }
        };
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);