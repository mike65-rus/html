define('viewModels/ot58DialogVm', ["kendo.all.min", 'kendo-template!views/ot58', 'dataSources/grippSprDataSource', 'services/proxyService',
    'viewModels/mkbKsgChooserVm'],
    function (kendo, editTemplateId, dsSpr, proxy, mkbKsgChooser) {
        "use strict";
        var kendoWindow;
        var dialogSelector = "ot58Dialog";
        var bindableSelector = "doc-058-dop-data";
        var onClose = function (e) {
            //            return;
            var selector = dialogSelector;
            kendo.unbind("#" + bindableSelector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        var getDsTypes58 = function () {
            var newArr = [];
            newArr.push({ id: 1, name: "COVID" });
            newArr.push({ id: 2, name: "Пневмония (без COVID)" });
            newArr.push({ id: 3, name: "Грипп" });
            newArr.push({ id: 4, name: "Другое" });
            var newDs = new kendo.data.DataSource({ data: newArr });
            newDs.read();
            return newDs;
        };
        var getCovidDs = function (ds) {
            var newArr = [];
            for (var i = 0; i < ds._data.length; i++) {
                var item = ds._data[i];
                if (item.id.startsWith("U")) {
                    var newItem = { id: item.id, name: item.id + " " + item.name, mkb_name: item.name };
                    newArr.push(newItem);
                }
            }
            var newDs = new kendo.data.DataSource({ data: newArr });
            newDs.read();
            return newDs;
        };
        var getPnevmDs = function (ds) {
            var newArr = [];
            for (var i = 0; i < ds._data.length; i++) {
                var item = ds._data[i];
                for (var j = 2; j <= 8; j++) {
                    if (item.id.startsWith("J1" + j.toString())) {
                        var newItem = { id: item.id, name: item.id + " " + item.name, mkb_name: item.name };
                        newArr.push(newItem);
                    }
                }
            }
            var newDs = new kendo.data.DataSource({ data: newArr });
            newDs.read();
            return newDs;
        };
        var getGrippDs = function (ds) {
            var newArr = [];
            for (var i = 0; i < ds._data.length; i++) {
                var item = ds._data[i];
                for (var j = 0; j <= 1; j++) {
                    if (item.id.startsWith("J1" + j.toString())) {
                        var newItem = { id: item.id, name: item.id + " " + item.name, mkb_name: item.name };
                        newArr.push(newItem);
                    }
                }
            }
            var newDs = new kendo.data.DataSource({ data: newArr });
            newDs.read();
            return newDs;
        };
        var getZDs = function (ds) {
            var newArr = [];
            for (var i = 0; i < ds._data.length; i++) {
                var item = ds._data[i];
                if (item.id.startsWith("Z")) {
                    var newItem = { id: item.id, name: item.id + " " + item.name, mkb_name: item.name };
                    newArr.push(newItem);
                }
            }
            var newDs = new kendo.data.DataSource({ data: newArr });
            newDs.read();
            return newDs;
        };
        var validate = function (model) {
            model.set("validationError", "");
            var mainDiag = model.get("mkbMain");
            var secondDiag = model.get("mkbSecond");
            if (!mainDiag) {
                model.set("validationError", "Основной диагноз не указан!");
                return false;
            }
            var type = model.get("type58");
            if (type == 1) {
                if (!mainDiag.startsWith("U")) {
                    model.set("validationError", "Для COVID указан неверный диагноз!");
                    return false;
                }
                if (!secondDiag) {
                    model.set("validationError", "Для COVID должен быть указан дополнительный диагноз!");
                    return false;
                }
                else {
                    if (secondDiag.startsWith("J")) {
                        model.isCovidPnevm = "1";
                    }
                    else {
                        model.isCovidPnevm = "0";
                    }
                }
            }
            return true;
        };
        var viewModel = new kendo.data.ObservableObject({
            parentModel: null,
            ot58: null,
            dsSpr: dsSpr,
            validationError: "",
            isBeremEnabled: function () {
                2
                return (this.get("patientSex") == "ж");
            },
            close: function (e) {
                kendoWindow.close();
            },
            save: function (e) {
                if (!validate(this)) {
                    return;
                }
                var that = this;
                var data = {
                    ot58Type: that.get("type58"),
                    isCovidPnevm: that.get("isCovidPnevm"),
                    mainMkb: that.get("mkbMain"),
                    mainMkbName: that.get("mkbMainName"),
                    secondMkb: that.get("mkbSecond"),
                    secondMkbName: that.get("mkbSecondName") || ""
                };
                that.get("parentModel").saveGpOtchet(JSON.stringify(data));
                that.close();
            },
            bindWidgets: function () {
                var that = this;
                $("#ot-58-001").kendoDropDownList({
                    height: 400,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: this.get("parentModel").dsGpMkb,
                    template: "#: data.id # #: data.name #",
                    valueTemplate: "#: data.id # #: data.name #",
                    value: that.get("parentModel.ot58.sMkb"),
                    optionLabel: {
                        id: "",
                        name: "Это не грипп и не пневмония"
                    },
                    change: function (e) {
                        that.set("parentModel.ot58.sMkb", this.value());
                    }
                });
                $("#ot-58-002").kendoDropDownList({
                    height: 200,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: [
                        { id: "1", name: "Легкая" },
                        { id: "2", name: "Средняя" },
                        { id: "3", name: "Тяжелая" }
                    ],
                    value: that.get("parentModel.ot58.nStepen"),
                    template: "#: data.id # #: data.name #",
                    valueTemplate: "#: data.id # #: data.name #",
                    optionLabel: {
                        id: "",
                        name: "Не указана"
                    },
                    change: function (e) {
                        that.set("parentModel.ot58.nStepen", this.value());
                    }
                });
                $("#ot-58-003").kendoDropDownList({
                    height: 200,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: [
                        { id: "1", name: "Нет" },
                        { id: "2", name: "Да" }
                    ],
                    value: that.get("parentModel.ot58.nBerem"),
                    template: "#: data.id # #: data.name #",
                    valueTemplate: "#: data.id # #: data.name #",
                    optionLabel: {
                        id: "",
                        name: "Не указано"
                    },
                    change: function (e) {
                        that.set("parentModel.ot58.nBerem", this.value());
                    }
                });
                var sSex = this.get("patientSex");
                if (sSex == "ж") {
                    $("#ot-58-003").data("kendoDropDownList").enable(true);
                }
                else {
                    $("#ot-58-003").data("kendoDropDownList").enable(false);
                }
            },
            showMkbDialog: function (e) {
                var that = viewModel;
                that.set("callerUuid", kendo.guid());
                mkbKsgChooser.open({ onlyMkb: true, dnst: 0, callerUuid: that.get("callerUuid") });
            },
            onItemSelected: function (e) {
                var item = e.sender.dataItem() || { mkb_name: "" };
                var that = viewModel;
                that.set("mkbMainName", item.mkb_name);
            },
            open: function (data) {
                this.set("parentModel", data.parentModel);
                this.selectedIb = data.selectedIb;
                this.patientSex = data.selectedIb.sex;
                if (!this.get("dsCovid")) {
                    this.set("dsCovid", getCovidDs(this.parentModel.dsGpMkb));
                    this.set("dsPnevm", getPnevmDs(this.parentModel.dsGpMkb));
                    this.set("dsGripp", getGrippDs(this.parentModel.dsGpMkb));
                    this.set("dsZ", getZDs(this.parentModel.dsGpMkb));
                    this.set("dsType58", getDsTypes58());
                }
                this.set("type58", undefined);
                this.set("isCovidPnevm", undefined);
                this.set("isCovidPnevmEnabled", false);
                this.set("mkbMain", "");
                this.set("mkbMainName", "");
                this.set("secondMkb", "");
                this.set("secondMkbName", "");
                if (data.jsonData) {
                    var jsonData = JSON.parse(data.jsonData);
                    this.set("type58", jsonData.ot58Type);
                    this.set("isCovidPnevm", jsonData.isCovidPnevm);
                    this.set("mkbMain", jsonData.mainMkb);
                    this.set("mkbMainName", jsonData.mainMkbName);
                    this.set("mkbSecond", jsonData.secondMkb);
                    this.set("mkbSecondName", jsonData.secondMkbName || "");
                }

                this.set("validationError", "");
                kendoWindow = $("<div id='" + dialogSelector + "'/>").kendoWindow({
                    title: "Выбор кодов МКБ для извещения",
                    height: 400,
                    width: 900,
                    modal: true,
                    content: {
                        template: $("#" + editTemplateId).html()
                    },
                    animation: false,
                    close: onClose
                }).data("kendoWindow");
                kendoWindow.open().center();
                //this.bindWidgets();
                kendo.bind("#" + bindableSelector, viewModel);

                setTimeout(function () {
                    /*
                    if (viewModel.get("type58")) {
                        var typeInput=$("#type-058").data("kendoDropDownList");
                        if (typeInput) {
                            typeInput.value(viewModel.get("type58"));
                            typeInput.trigger("change");
                        }
                    }
                    */
                    if (!viewModel.get("type58")) {
                        var typeInput = $("#type-058").data("kendoDropDownList");
                        if (typeInput) {
                            typeInput.focus();
                            typeInput.open();
                        }
                    }
                });
            }
        });
        var setVisibleInvisible = function (vm, sFields, bVisible) {
            var aFields = sFields.split(",");
            for (var i = 0; i < aFields.length; i++) {
                vm.set(aFields[i], bVisible);
            }
        };
        var onViewModelChange = function (e) {
            var fld = e.field;
            var that = viewModel;
            var value = that.get(fld);
            var sFields = "isCovid,isPnevm,isGripp,isOthers";
            var aFields = sFields.split(",");
            if (fld == "type58") {
                setVisibleInvisible(that, sFields, false);
                if (value) {
                    setVisibleInvisible(that, aFields[value - 1], true);
                    that.set("mkbMain", "");
                    that.set("mkbSecond", "");
                }
            }
            if (aFields.indexOf(fld) >= 0) {
                if (!value) {
                    that.set("mkbMain", "");
                }
                else {
                    var mkbCovidInput = undefined;
                    if (fld == "isCovid") {
                        mkbCovidInput = $("#mkb-covid").data("kendoDropDownList");
                    }
                    if (fld == "isPnevm") {
                        mkbCovidInput = $("#mkb-pnevm").data("kendoDropDownList");
                    }
                    if (fld == "isGripp") {
                        mkbCovidInput = $("#mkb-gripp").data("kendoDropDownList");
                    }
                    if (mkbCovidInput) {
                        setTimeout(function () {
                            if (mkbCovidInput) {
                                mkbCovidInput.focus();
                                mkbCovidInput.open();
                            }
                        }, 5);
                    }

                }
            }
            if (fld == "isCovidPnevm") {
                if (value == "0") {
                    that.set("isCovidPnevmListEnabled", false);
                    that.set("mkbSecond", "Z22.8");
                    that.set("mkbSecondName", "Носительство возбудителя другой инфекционной болезни");
                }
                else {
                    that.set("mkbSecond", "");
                    if (value == "1") {
                        that.set("isCovidPnevmListEnabled", true);
                        if (!that.get("mkbSecond")) {
                            var mkbCovidInput = $("#mkb-covid-pnevm").data("kendoDropDownList");
                            if (mkbCovidInput) {
                                mkbCovidInput.focus();
                                mkbCovidInput.open();
                                mkbCovidInput.search("J12.8");
                            }
                        }
                    }
                }
            }
        };
        var onMkbOnlySelected = function (data) {
            var that = viewModel;
            var myGuid = that.get("callerUuid");
            if (data.callerUuid == myGuid) {
                that.set("mkbMain", data.mkb);
                that.set("mkbMainName", data.mkb_name);
            }
        };
        viewModel.bind("change", onViewModelChange);
        proxy.subscribe("mkbOnlySelected", onMkbOnlySelected);

        return viewModel;
    }
);