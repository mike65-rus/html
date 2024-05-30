define(["kendo.all.min",'kendo-template!views/case','services/proxyService',
        "models/casesModel","dataSources/casesDataSource"
        ],
    function(kendo,editTemplateId,proxy,caseModel,casesDs) {
        "use strict";
        var kendoWindow;
        var dialogSelector="caseDialog";
        var bindableSelector="case-data";
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
//                this.get("parentModel").cancelGrippDonos(this.get("model"));
                kendoWindow.close();
            },
            save:function(e) {
                if (validator.validate()) {
                    //this.get("parentModel").reallySaveMe(this.get("model"),this.get);
                    var that=this;
                    casesDs.add(this.get("model"));
                    casesDs.sync().then(function() {
                        that.get("parentModel").set("caseId",that.get("model").get("case_id"));
                        that.get("parentModel").reallySaveMe(that.get("options"));
                    });
                    this.close();
                }
                else {
                    kendo.alert("<strong>Необходимо исправить ошибки!</strong><hr>"+validator.errors().join('<br>'));
                }
            },
            open: function(data) {
                this.set("parentModel",data.parentModel);
                this.set("options",data.options || {});
                var model=new casesDs.options.schema.model;
                model.set("case_id",kendo.guid());
                model.set("patient_id",this.parentModel.selectedPatient.evn);
                model.set("patient_pin",this.parentModel.selectedPatient.pin);
                model.set("user_id",Number(localStorage['last_user']));
                if (this.options.case_date) {
                    model.set("case_date",this.options.case_date);
                }
				if (this.options.case_end_date) {
                    model.set("case_end_date",this.options.case_end_date);
                }
                this.set("model",model);
                kendoWindow=$("<div id='"+dialogSelector+"'/>").kendoWindow({
                    title: "Прикрепление документа к обращению",
                    actions:[],
                    height:400,
                    width:400,
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
                        }
                    },
                    messages: {
                        datepicker: "Дата неверна!",
                        maxDate: "Дата больше текущей!",
                    }
                }).data("kendoValidator");
            }
        });
        var onVmChange=function(e) {
//            var field=e.field;
        };
        /*
        var casesDsChange=function(e) {
            var action=e.action;
            console.log("action");
            if (action=="sync") {
                var aItems=e.items;
                if (aItems.length==1) {
                    viewModel.get("parentModel").set("caseId",aItems[0].case_id);
                }
            }
        };
        casesDs.bind("change",casesDsChange);
        */
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);