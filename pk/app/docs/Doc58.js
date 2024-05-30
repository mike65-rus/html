/**
 * Created by STAR_06 on 26.01.2016.
 */
define(["kendo.all.min", "docs/DocBase", "services/proxyService", "utils", "alertify",
        "dataSources/pkDocsListDataSource","docs/mySelObject","viewModels/ot58DialogVm",
        "dataSources/grippMkbDataSource",
        "dataSources/grippDonosDataSource",'viewModels/grippDonosVm',
        "dataSources/usersListDataSource",
        "dataSources/grippSprDataSource",
        "viewModels/caseVm",
		"dataSources/sesDiagsDataSource"
    ],
    function (kendo, DocBase, proxy, utils, alertify, ibDocsDS,mySelObject,ot58Dialog,ot58Mkb,
              grippDonosDs,grippDonosDialog,allUsersDs,grippSprDs,caseDialog,sesDiagsDataSource) {
        var Doc58;
		var sesDiags;
        var dsGpMkb=ot58Mkb;
        Doc58 = DocBase.extend({
            init: function (data, uuid,subtype) {
                // public
                DocBase.fn.init.call(this, uuid);
                this.data = data;
                this.docVid = 58;
                this.docSub=subtype;
                //this.dsRead.parentObj = this;
                //this.dsCreate.parentObj = this;
//                this.dsOt58.parentObj = this;
                this.isReadOnly = false;
                this.ot58 = {
                    isReaded: false,
                    isExists: false,
                    sMkb: "",
                    nStepen: "",
                    nBerem: ""
                }
				
				$.ajax({
                    url: location.origin + "/Medsystem/Gb2Ajax/home/sesDiags",
                    type: "GET",
                    success: function (data, textStatus) {
						sesDiags = data;
                    },
                    dataType: "json"
                });
            },
            dsReadOk: function (e) {
                kendo.ui.progress($("#ibDocs"), false);
                this.isLoaded = true;
                this.isSaved = false;
                if (e.items[0].record_id) {
                    this.recordId = e.items[0].record_id;
                }
                if (!(e.items[0].ext3) == "") {
                    this.isReadOnly = true;
                }
                //this.addToContainer(e.items[0].doc_html);
                var that=this;
                /*
                var selIb=proxy.getSessionObject("selectedIb");
                this.dsGpMkb.read().then(function() {
                    that.dsOt58.read({
                        ask_id: selIb.ask_id
                    }).then(function() {
                        grippDonosDs.read({ask_id: selIb.ask_id})
                    }).then(function() {
                        that.set("gridDonosReaded",true);
                    });
                });
                */
            },
            dsReadError: function (e) {
                kendo.ui.progress($("#ibDocs"), true);
                utils.ajax_error(e);
            },
            ds58ReadOk: function (e) {
                kendo.ui.progress($("#ibDocs"), false);
                this.ot58.isReaded = true;
                if (e.sender._data.length) {
                    var item=e.sender._data[0];
                    this.ot58.isExists = true;
                    this.ot58.sMkb = item.mkb;
                    this.ot58.nStepen = item.stepen;
                    this.ot58.nBerem = item.berem;
                }
                else {
                    this.ot58.isExists = false;
                    this.ot58.sMkb = "";
                    this.ot58.nStepen = "";
                    this.ot58.nBerem = "";
                }
            },
            //addToContainer: function (sHtml) {
            //    var oContainer = this.oContainer;
            //    var newIndex = oContainer.docTabStrip.items().length;
            //    var sUuid = Math.uuid(15);
            //    var toolBarId = "tb_" + sUuid;
            //    var documentId = "doc_" + sUuid;
            //    oContainer.docTabStrip.append([{
            //        text: "Извещение " + newIndex,
            //        content: "<div id='" + toolBarId + "'></div><div class='ib-doc-div' id='" + documentId + "'>" + sHtml + "</div>"
            //    }]);
            //    this.uiContainer = new uiContainer({ body: $("#" + documentId), toolBar: $("#" + toolBarId) });
            //    this.createToolBar(this.isReadOnly);
            //    oContainer.addDocModel(this);
            //    this.prepareContent();
            //    this.saveContent();
            //    this.bindEditor();
            //    oContainer.docTabStrip.select("li:last");
            //    this.onContentShown();
            //    //        oContainer.refreshNotes();
            //},
            bindEditor: function () {
                if ((!this.isReadOnly)  && (!utils.isViewer())) {
                    //this.oContainer.bindEditor(this.uiContainer.body);
	                DocBase.fn.bindEditor.call(this);
                }
            },
            createToolbar: function (bReadOnly) {
                var that = this;
                var aTools = new Array();
                if ((!bReadOnly) && (!utils.isViewer())) {
                    aTools.push(
                        { type: "button", text: " Послать извещение", attributes: { "class": "faa faa-envelope-o", "rel": "tooltip", "title": "Послать извещение" }, showText: "overflow" }
                    );
                    //        }
                    //        else {
                    /*
                    aTools.push({
                        type: "button", text: " Сохранить без посылки извещения", attributes: { "class": "faa faa-download", "rel": "tooltip", "title": "Сохранить" }, showText: "overflow"
                    });
                    */
                };
                /*
                aTools.push({
                    type: "button", text: "Данные для отчета",
                    attributes: { "class": "doc-otchet", "rel": "tooltip", "title": "Данные для отчета" }, showText: "always"
                });

                aTools.push({
                    type: "button", text: "Донесение о гриппе",
                    attributes: { "class": "doc-otchet", "rel": "tooltip", "title": "Донесение о гриппе" }, showText: "always"
                });
                */
                aTools.push({
                    type: "button", text: "Донесение в РосПотребНадзор",
                    attributes: { "class": "doc-otchet", "rel": "tooltip", "title": "Донесение в РосПотребНадзор" }, showText: "always"
                });
				aTools.push({
                    type: "button", text: " Печать",
                    attributes: {  "class": "doc-print faa faa-print", "rel": "tooltip", "title": "Печать" }, showText: "overflow"
                });

                aTools.push({ type: "button", text: " Закрыть", attributes: { "class": "faa faa-close pull-right", "rel": "tooltip", "title": "Закрыть" }, showText: "overflow" });

                $(this.toolbar).kendoToolBar({
                    items: aTools,
                    click: that.fnOnClick(that)
                });
            },
            saveGpOtchet: function (data) {
                /*
                var ot58 = this.ot58;
                this.dsOt58.read({
                    save: "1",
                    ask_id: this.askId,
                    mkb: ot58.sMkb,
                    stepen: ot58.nStepen,
                    berem: ot58.nBerem,
                    user_id: Number(localStorage['last_user']).toString()
                });
                */
                var myBody = this.content;
                $(myBody).find(".mkb-json-container").text(data);
                var oData=JSON.parse(data);
                var sMkb=oData.mainMkb;
                if (oData.secondMkb) {
                    sMkb=sMkb+","+oData.secondMkb;
                }
                $(myBody).find(".mkb-display").text(sMkb);
            },
            isGpOtchetExists: function () {
                var ot58 = this.ot58;
                return (ot58.isReaded && ot58.isExists);
            },
            isThisOkonchat: function () {
                var bResult = true;
                var myBody = this.content;
                var sOpt = this.getFirstSecond(myBody);
                if ((sOpt.search("ОКОНЧАТЕЛЬНОЕ") < 0)) {
                    bResult = false;
                }
                return bResult;
            },
            mayOpenGrippDonos: function() {
                var bResult = true;
                var aErrors=[];
                if (!(this.isThisOkonchat())) {
                    aErrors.push("Данные для Донесения заполняются в окончательном извещении!");
                }
  //              if (!this.get("gridDonosReaded")) {
//                    aErrors.push("Данные о Донесении еще не прочитаны!.Повторите попытку позже!");
//                }
                var diag=this.getDiagn(this.content);
                if (diag.toUpperCase().indexOf("ГРИПП")<0) {
//                    aErrors.push("Слово 'Грипп' не найдено в диагнозе!");
                }
                if (aErrors.length) {
                    bResult=false;
                    var sErrors=aErrors.join('<br>');
                    kendo.alert(sErrors);
                }
                return bResult;
            },
            reallyOpenGrippDonos: function(that) {
                var selIb=that.get("selectedPatient");
                var model;
                var myBody = that.content;
                var iRecs=grippDonosDs._data.length;
                if (!iRecs) {
                    var userId = Number(localStorage["last_user"]);
                    var department=3;
                    var userName=that.getUserName(userId);
                    var diag=that.getDiagn(that.content);
                    var address=that.getAddress(that.content);
//                    var rabota=selIb.soc_stat.toLowerCase()+", "+((selIb.work1) ? selIb.work1:"не работает") ;
                    var rabota=((selIb.work) ? selIb.work : "не работает") ;
                    var oDates=that.getDates(that.content);
                    var privivka=that.getPrivivka(that.content);
                    var diagObr=that.getDiagn2(that.content) || "ОРВИ?";
                    var sJsonData="";
                    try {
                        sJsonData=$(myBody).find(".mkb-json-container").text();
                    }
                    catch(ex) {
                        sJsonData="";
                    }
                    var sMkb="";
                    if (sJsonData) {
                        var oJsonData=JSON.parse(sJsonData);
                        if (oJsonData.mainMkb) {
                            sMkb=sMkb+oJsonData.mainMkb;
                        }
                        if (oJsonData.secondMkb) {
                            sMkb=sMkb+","+oJsonData.secondMkb;
                        }
                    }

                    model=new grippDonosDs.options.schema.model;
                    model.set("ask_id",selIb.pin) ;
                    model.set("ib_no",selIb.pin);
                    model.set("fio",selIb.fio);
                    model.set("otd","Терапевтическое");
                    model.set("sex",selIb.sex);
                    model.set("address",address);
                    model.set("age",selIb.age);
                    model.set("rabota",rabota);
                    model.set("date_hosp",kendo.parseDate(selIb.date_ask));
                    model.set("diag_obr",diagObr);
                    model.set("diag_osn",diag);
                    model.set("date_zabol",oDates.date_zabol);
                    model.set("date_obr",oDates.date_first_obr);
                    model.set("date_result",oDates.date_diag);
                    model.set("diag_soput","");    // в сопутствующий диагноз приемника
                    model.set("privivka",privivka);
                    model.set("laboratoria",grippSprDs.labs._data[0]);
                    model.set("user_id",userId);
                    model.set("user_name",userName);
                    model.set("virus_type",grippSprDs.types._data[0]);
                    model.set("ivl",grippSprDs.ivl._data[0]);
                    model.set("mkb",sMkb);
                    model.set("department",department);
                }
                else {
                    var id=grippDonosDs._data[0].id;
                    model=grippDonosDs.get(id);
                }
                grippDonosDialog.open({parentModel:this,model:model,dsSpr:grippSprDs})

            },
            openGrippDonos: function() {
                if (!this.mayOpenGrippDonos()) {
                    return;
                }
                var selIb=this.get("selectedPatient");
                var that=this;
                grippDonosDs.read({ask_id:selIb.pin}).then(function() {
                    that.reallyOpenGrippDonos(that);
                });
            },
            saveGrippDonos:function(model) {
                var isNew = model.isNew();
                if (isNew) {
                    grippDonosDs.add(model);
                    grippDonosDs.sync().then(function () {
                        if (grippDonosDs._data.length) {
                            if (isNew) {
                                kendo.alert("Донесение о гриппе сохранено!");
                            }
                        }
                    });
                }
                else {
                    if (model.dirty) {
                        grippDonosDs.sync().then(function() {
                            if (grippDonosDs._data.length) {
                                if (!(grippDonosDs.at(0).dirty)) {
                                    kendo.alert("Донесение о гриппе сохранено!");
                                }
                            }
                        });
                    }
                }
            },
            cancelGrippDonos: function(model) {
                var isNew = model.isNew();
                if (!isNew) {
                    grippDonosDs.cancelChanges(model);
                }
            },
            checkIfGrippDonos: function (myBody) {
                var bResult = true;
                var sOpt = this.getFirstSecond(myBody);
                if (sOpt.indexOf('ОКОНЧАТЕЛЬНОЕ')>=0) {
                    var sDiag = this.getDiagn(myBody);
                    sDiag = sDiag.toUpperCase();
                    // + " ";
                    if ((sDiag.indexOf("ГРИПП")) >= 0) {
                        if (!(grippDonosDs._data.length)) {
                            bResult=false;
                        }
                    }
                }
                return bResult;
            },
            mayOpenGpOtchet: function () {
                var bResult = true;
                if (!(this.isThisOkonchat())) {
                   // bResult = false;
                    //alertify.alert("Данные для отчета заполняются в окончательном извещении!");
                }
                return bResult;
            },
            openGpOtchet: function () {
                if (!(this.mayOpenGpOtchet())) {
                    return;
                }
                var that = this;
                /*
                if (!(this.ot58.isReaded)) {
                    alertify.alert("Данные для отчета еще не прочитаны.Повторите попытку позже!");
                    return;
                }
                */
//                var selIb = proxy.getSessionObject("selectedIb");
                var selIb=this.selectedPatient;
                var sSex = selIb.sex;
                var data={parentModel:this,selectedIb:selIb};
                that.dsGpMkb=dsGpMkb;
                var dsData=that.dsGpMkb.data();
                if (!dsData.length) {
                    that.dsGpMkb.read().then(function(){
                        ot58Dialog.open(data);
                    });
                }
                else {
                    ot58Dialog.open(data);
                }
                /*
                $("#my-doc-058-dop-data").kendoWindow({
                    modal: true,
                    height: 300,
                    width: 600
                });
                $("#ot-58-001").kendoDropDownList({
                    height: 400,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: this.dsGpMkb,
                    template: "#: data.id # #: data.name #",
                    valueTemplate: "#: data.id # #: data.name #",
                    optionLabel: {
                        id: "",
                        name: "Это не грипп и не пневмония"
                    },
                    change: function (e) {
                        that.ot58.sMkb = this.value();
                    }
                });
                $("#ot-58-001").data("kendoDropDownList").value(this.ot58.sMkb);

                $("#ot-58-002").kendoDropDownList({
                    height: 200,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: [
                        { id: "1", name: "Легкая" },
                        { id: "2", name: "Средняя" },
                        { id: "3", name: "Тяжелая" }
                    ],
                    template: "#: data.id # #: data.name #",
                    valueTemplate: "#: data.id # #: data.name #",
                    optionLabel: {
                        id: "",
                        name: "Не указана"
                    },
                    change: function (e) {
                        that.ot58.nStepen = this.value();
                    }

                });
                $("#ot-58-002").data("kendoDropDownList").value(this.ot58.nStepen);

                $("#ot-58-003").kendoDropDownList({
                    height: 200,
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: [
                        { id: "1", name: "Нет" },
                        { id: "2", name: "Да" }
                    ],
                    template: "#: data.id # #: data.name #",
                    valueTemplate: "#: data.id # #: data.name #",
                    optionLabel: {
                        id: "",
                        name: "Не указано"
                    },
                    change: function (e) {
                        that.ot58.nBerem = this.value();
                    }
                });
                $("#ot-58-003").data("kendoDropDownList").value(this.ot58.nBerem);
                if (sSex == "ж") {
                    $("#ot-58-003").data("kendoDropDownList").enable(true);
                }
                else {
                    $("#ot-58-003").data("kendoDropDownList").enable(false);
                }
                var wnd = $("#my-doc-058-dop-data").data("kendoWindow");
                $("#ot-58-close").off();
                $("#ot-58-close").on("click", function (e) {
                    wnd.close();
                });
                $("#ot-58-save").off();
                $("#ot-58-save").on("click", function (e) {
                    that.saveGpOtchet();
                    wnd.close();
                });
                wnd.title("Дополнительные данные для отчета").open().center();
                */
            },
            prepareContent: function (bReadOnly) {
                var that=this;
                var myBody = this.content;
                if (!bReadOnly) {
                    try {
                        kendo.bind($(myBody).find(".ot58-dialog"),this);
                    }
                    catch (ex) {

                    }
                }
                else {
                    try {
                        $(myBody).find(".ot58-dialog").find("button").first().addClass("no-display");
                    }
                    catch (ex) {

                    }
                }

                //var mkbInputDiv=$(myBody).find("div.mkb-input");
                if (bReadOnly) {
                    $(myBody).find("div").removeAttr("contenteditable");
                    $(myBody).find("span").removeAttr("contenteditable");
                    $(myBody).find("span.my-sel").each(function(i) {
                        var sSel = $(this).attr("data-sel");
                        if (sSel) {
                            $(this).text(sSel);
                        }
                        $(this).removeClass("my-sel");
                    });
                    $(myBody).find(".easy-sign").removeClass("div-invisible");
                    $(myBody).find(".text-date").removeClass("no-display");
                    $(myBody).find(".text-date-td").removeClass("no-display");
                    $(myBody).find(".kendo-date").addClass("no-display");
                    return;
                }
                $(myBody).find(".my-sel.sel1").each(function (i) {
                    var that=this;
                    var sOpt = $(this).attr("data-opt");
                    var aOpt = sOpt.split(";");
                    var sSel = $(this).attr("data-sel");
                    if (sSel) {
                        var aSel = sSel.split(",");
                        //            var ind=-1;
                        for (var i = 0; i < aSel.length; i++) {
                            if (aOpt.indexOf(aSel[i].trim()) < 0) {
                                sOpt = sOpt + ";" + aSel[i].trim();
                            }
                        }
                    }
                    else {
                        // sSel = aOpt[0];
                        sSel="";
                    }
                    $(this).attr("data-sel", sSel);
                    $(this).attr("title", sOpt);
                    if (aOpt.indexOf("...") < 0) {
                        sOpt = sOpt + ";...";
                    }
                    aOpt = sOpt.split(";");
                    //            ind=aOpt.indexOf(sSel);
                    $(this).attr("data-opt", sOpt);
                    //            $(this).attr("data-ind",ind);
                    $(this).attr("tabindex", 0);

                    $(this).keydown(function (event) {
                        if (event.keyCode === 32) {
                            mySelObject.clickMySel(this);
                            event.preventDefault();
                        }
                    });
                    $(this).click(function (event) {
                        mySelObject.clickMySel(this);
                        event.preventDefault();
                    });
                    //            $(this).after("<button class='my-sel-btn'>...</button>");
                });
//                if ((mkbInputDiv.length) && (!bReadOnly)) {
                    //this.createMkbInput(mkbInputDiv);
//                }
                $("input.kendo-date").each(function(i,el) {
                    var input=$(el);
                    var td=$(input).closest("td");
                    $(td).html(($(input)[0]).outerHTML);
                    input=$(td).find("input");
                    var kendoDatePicker=$(input).removeClass("k-input").data("kendoDatePicker");
                    if (!kendoDatePicker) {
                        kendoDatePicker=$(input).kendoDatePicker({
                            max:new Date(),
                            min:utils.addDays(new Date(),-90),
                            change: function() {
                                var value=this.value();
                                var textEl=$(input).closest("td").prev("td").find("div").first();
                                var theDate=kendo.toString(value,"dd.MM.yyyy");
                                if (!theDate) {
                                    this.value(null);
                                }
                                var oldText=$(textEl).text();
                                var newText=theDate || "";
                                $(textEl).text(newText);
                                if (!(oldText==newText)) {
                                    proxy.publish("docChanged",{uuid:that.uuid,content:$(that.content).html()});
                                }
                            }
                        }).data("kendoDatePicker");
                        $(input).on("blur",function(e){
                            var text=$(input).val();
                            var theDate=kendo.parseDate(text,"dd.MM.yyyy");
                            if ((!theDate) || (theDate>kendoDatePicker.max()) || (theDate<kendoDatePicker.min())) {
                                $(input.text(""));
                                if (kendoDatePicker) {
                                    kendoDatePicker.value(null);
                                }
                            }
                        })
                    }

                    var textEl=$(input).closest("td").prev("td").find("div").first();
                    kendoDatePicker.value(kendo.parseDate($(textEl).text(),"dd.MM.yyyy"));
                });

            },
            destroyMkbInput: function(mkbInput) {
  //              $(mkbInput).html("");
                /*
                if ($(mkbInput).data("kendoAutoComplete")) {
                    $(mkbInput).data("kendoAutoComplete").destroy();
                }
                */
            },
            createMkbInput: function(mkbInput) {
                return;
                var that=this;
                var myBody=that.content;
                var mkbInputSpan=$(myBody).find("span.mkb-input-span");
                that.destroyMkbInput(mkbInput);
                var sHtml='<span class="mkb-label-container-2">' +
                    '<span class="mkb-label mkb-label-2 no-print required">Код диагноза по МКБ</span>';
                sHtml=sHtml+'<input class="mkb-input" onkeyup="this.value = this.value.toUpperCase();"/>';
                sHtml=sHtml+"</span>";
                $(mkbInput).html(sHtml);
                var mkbInputInput=$(mkbInput).find("input.mkb-input");
                var kendoMkbInput=$(mkbInputInput).kendoAutoComplete({
                    autoWidth:true,
                    ignoreCase:true,
                    height:400,
                    minLength:1,
                    dataTextField:"id",
                    dataValueField:"id",
                    template:"#: id # - #: name #",
                    dataSource: {
                        serverFiltering: true,
                        transport: {
                            read: {
                                url:"default.aspx?action=pk/cases_AJAX&action2=get_matched_mkb",
                                dataType: "json"
                            },
                            parameterMap: function(data,type) {
                                return "filter="+kendo.stringify(data.filter.filters[0]);
                            }
                        },
                        schema: {
                            data: "mkb.rows",
                            total: "records",
                            errors: "error",
                            model: {
                                id:"id",
                                fields: {
                                    id:{type:"string"},
                                    name:{type:"string"}
                                }
                            }
                        }
                    },
                    change: function(e) {
//                        console.log(this.value());
                        var value=this.value();
                        var newValue=value;
                        var ds=this.dataSource;
                        if (value.length<3) {
                            $(mkbInputSpan).text(value);
                            $(mkbInputSpan).attr("data-value",value);
                            proxy.publish("docChanged",{uuid:that.uuid,content:$(that.content).html()});
                            return;
                        }
                        if (value.length<5) {
                            var v3=value.substr(0,3);
                            for (var i=9;i>=0;i--) {
                                if (ds.get(v3+"."+i.toString())) {
                                    newValue=v3+"."+i.toString();
                                    break;
                                }
                            }
                        }
                        if (!(value===newValue)) {
                            this.value(newValue);
                        }

                        var item=ds.get(newValue);
                        if (item) {
                            var div=that.getDiagnDiv(myBody);
                            if (div.length) {
                                if (!$(div).text().trim()) {
                                    $(div).text(item.name);
                                }
                                else {
                                    kendo.confirm("Изменить диагноз?").then(function(){
                                        $(div).text(item.name);
                                        proxy.publish("docChanged",{uuid:that.uuid,content:$(that.content).html()});
                                    });
                                }
                            }
                        }
                        $(mkbInputSpan).text(newValue);
                        $(mkbInputSpan).attr("data-value",newValue);
                        proxy.publish("docChanged",{uuid:that.uuid,content:$(that.content).html()});
                    }
                }).data("kendoAutoComplete");
                kendoMkbInput.value($(mkbInputSpan).text());
                $(mkbInputInput).on("keypress",utils.rusLatMkbEventListener);
            },
            saveContent: function () {
            },
            onContentShown: function () {
                var myObj = this;
                var myBody = this.body;
                $(myBody).find(".my-sel.sel1").first().focus();
                setTimeout(function () { setDocHeight($(myObj.body)) }, 100);
            },
            validate: function () {
                var myBody = this.content;
                var bRet;
                
				if (utils.isViewer()) {
					return true;
				}
				
				bRet = true;
                $(myBody).find("div[data-validate='not-empty']").each(function (i) {
                    if (!($(this).text().trim())) {
                        bRet = false;
                    }
                });
                $(myBody).find("span[data-validate='not-empty-span']").each(function (i) {
                    var sText="";
                    try {
                        sText=$(this).attr("data-sel").trim();
                    }
                    catch (ex) {
                        sText=$(this).text().trim();
                    }
                    if ((!sText) || (sText.startsWith("..."))) {
                        bRet = false;
                    }
                });
                if (!bRet) {
                    alertify.error("Не все обязательные поля заполнены!");
                }
                return bRet;
            },
            checkDates: function (myBody) {
                var bResult = true;
                var i = 0;
                var dates = $(myBody).find("table[data-ol='7'] tr td div[contenteditable='true']").each(function () {
                    if (!bResult) {
                        return;
                    }
                    var dDta = null;
                    var sDta = $(this).text().trim();
                    if (sDta) {
                        dDta = kendo.parseDate(sDta, "dd.MM.yyyy");
                        if (!(dDta)) {
                            bResult = false;
                        }
                    }
                    i = i + 1;
                });
                if (!bResult) {
                    alertify.alert("Неверная дата в пункте 7! № поля=" + i.toString());
                }
                return bResult;
            },
            getType: function (myBody) {
                var sRet = "";
                var span = $(myBody).find("span[rel='type_58']");
                if ($(span).length) {
                    sRet = $(span).attr('data-sel');
                }
                return sRet;
            },
            getFirstSecond: function (myBody) {
                var sRet = "";
                var span = $(myBody).find("span[rel='first_second']");
                if ($(span).length) {
                    sRet = $(span).attr('data-sel');
                }
                return sRet;
            },
            getDiagnDiv:function(myBody) {
                var div = $(myBody).find("table[data-ol='1'] tr td div[contenteditable='true']").first();
                if ($(div).length) {
                    return div;
                }
                return [];
            },

            getDiagn: function (myBody) {
                var sRet = "";
//                var div = $(myBody).find("table[data-ol='1'] tr td div[contenteditable='true']").first();
                var div = $(myBody).find("table[data-ol='1'] tr td div[data-role='editor']").first();
                if ($(div).length) {
                    sRet = $(div).text().trim();
                }
                return sRet;
            },
            getDiagn2: function (myBody) {
                var sRet = "";
//                var div = $(myBody).find("table[data-ol='1'] tr td div[contenteditable='true']").first();
                var theTable=$(myBody).find("table[data-ol='1']");
                var nextTable=$(theTable).next('table');
                var div = $(nextTable).find("tr td div").last();
                if ($(div).length) {
                    sRet = $(div).text().trim();
                }
                return sRet;
            },

            getAddress: function(myBody) {
                var sRet = "";
//                var div = $(myBody).find("table[data-ol='5'] tr td div[contenteditable='true']").first();
                var div = $(myBody).find("table[data-ol='5'] tr td div[data-role='editor']").first();
                if ($(div).length) {
                    sRet = $(div).text().trim();
                }
                return sRet;
            },
            getDates: function(myBody) {
                var oDates={date_zabol:null,date_first_obr:null,date_diag:null};
//                var div = $(myBody).find("table[data-ol='7'] tr td div[contenteditable='true']").first();
                var div = $(myBody).find("table[data-ol='7'] tr td div[data-role='editor']").first();
                if ($(div).length) {
                    var sDate = $(div).text().trim();
                    oDates.date_zabol=utils.tryParseDate(sDate);
//                    div=div.closest("tr").next("tr").find("div[contenteditable='true']").first();
                    div=div.closest("tr").next("tr").find("div[data-role='editor']").first();
                    if ($(div.length)) {
                        var sDate = $(div).text().trim();
                        oDates.date_first_obr=utils.tryParseDate(sDate);
//                        div=div.closest("tr").next("tr").find("div[contenteditable='true']").first();
                        div=div.closest("tr").next("tr").find("div[data-role='editor']").first();
                        if ($(div.length)) {
                            var sDate = $(div).text().trim();
                            oDates.date_diag=utils.tryParseDate(sDate);
                        }

                    }
                }
                return oDates;
            },
            getPrivivka: function(myBody) {
                var sRet="";
//              var span = $(myBody).find("table[data-ol='1']").first().next("table").find("span.my-sel").last();
                var span = $(myBody).find("table[data-ol='1']").first().next("table").find("span.sel1").last();
                if ($(span).length) {
                    sRet = $(span).attr('data-sel');
                }
                return sRet;
            },
            getUserName:function(iUserId) {
                var ds=allUsersDs;
                return ds.get(iUserId).name || "";

            },
            checkType: function (myBody) {
                var bResult = true;
                var sOpt = this.getType(myBody);
                if (!(sOpt == 'об инфекционном заболевании')) {
                    bResult = false;
                }
                return bResult;
            },
            checkIfExistsPervich: function (myBody, ds) {
                var bResult = true;
                var sOpt = this.getFirstSecond(myBody);
                if (sOpt == 'ОКОНЧАТЕЛЬНОЕ') {
                    bResult = false;

                    var data = ds.data();

                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if (!(item.doc_id == 58)) {
                            continue;
                        }
                        if ((item.ext2.search("ПЕРВИЧНОЕ") >= 0)) {
                            bResult = true;
                        }
                    }
                }
                return bResult;
            },
            checkDiag: function (myBody) {
                var bResult = true;
                var sOpt = this.getFirstSecond(myBody);
                if (sOpt == 'ПЕРВИЧНОЕ') {
					bResult = false;
                    var sDiag = this.getDiagn(myBody);
                    sDiag = sDiag.toUpperCase() + " ";
                    for (i = 0; i < sesDiags.records; i++) {
						if (sDiag.search(sesDiags.rowlist.rows[i].searchstring)  >= 0) {
							bResult = true;
							break;
						}
					}
                }
                return bResult;
            },
            reallySaveMe: function(data) {
                var iSend=0;
                if (data.send) {
                    iSend=1;
                }
                var myBody = this.content;
                var myObj = this;
                var mkbInputDiv=$(myBody).find("div.mkb-input");
                this.destroyMkbInput(mkbInputDiv);
//                var data={selIb:null};
//                proxy.publish("getCurrentPatient",data);    // subscribed on patientCardDocsVm
//                var selIb = this.data.selIb;
                $(myBody).find(".cur-date").html(kendo.toString(new Date(),"dd.MM.yyyy г. HHч mm мин."));
                $(myBody).find(".cur-date-2").html(kendo.toString(new Date(),"dd.MM.yyyy - HH:mm"));

                kendo.ui.progress($(this.toolbar), true);
                $.ajax({
                    url: "default.aspx?action=pk/PKDOCS_AJAX&action2=save_doc&record_id=" + this.recordId +
                    "&evn=" + this.data.selectedPatient.evn.toString() + "&doc_id=" + this.docVid.toString() +
                    "&doc_subtype="+this.docSub.toString() +
                    "&user_id=" + Number(localStorage['last_user']).toString() + "&case_id="+this.caseId +
                    "&send=" + iSend.toString(),
                    type: "POST",
                    data: $(myBody).html(),
                    processData: false,
                    success: function (data, textStatus) {
                        kendo.ui.progress($(myObj.toolbar), false);
                        myObj.recordId = data.doc.rows[0].record_id;
                        myObj.caseId=data.doc.rows[0].case_id;
                        myObj.isSaved = true;
                        proxy.publish("docSaved",{uuid:myObj.uuid,record_id:myObj.recordId});
                        myObj.prepareContent(iSend);

                    },
                    dataType: "json"
                });

            },
            saveMe: function (iSend) {
                var myBody = this.content;
                var myObj = this;
                if (!this.checkType(myBody)) {
                    alertify.alert("Не предусмотрено формирование указанного вами вида извещения!");
                    return;
                }
				//06.09.2022
                //if (!this.checkIfExistsPervich(myBody, ibDocsDS)) {
                //    alertify.alert("ОКОНЧАТЕЛЬНОЕ извещение не может быть без ПЕРВИЧНОГО!");
                //    return;
                //}
                if (!this.checkDiag(myBody)) {
                    //alertify.alert("ПЕРВИЧНОЕ извещение должно быть о пневмонии или гриппе!");
					alertify.alert("В поле Диагноз в ПЕРВИЧНОМ извещении должно быть инфекционное заболевание!");
                    return;
                }
                if (!this.checkIfGrippDonos(myBody)) {
                    alertify.alert("Не заполнены данные для Донесения о гриппе!");
                    return;
                }
                if (!this.checkDates(myBody)) {
                    return;
                }
                /* for debug
                this.prepareContent(true);
                return;
                */
                if (this.isThisOkonchat()) {
                    this.docSub=2;
                }
                if (!this.caseId) {
                    var oDates=this.getDates(myBody);

                    caseDialog.open({parentModel:this,options:{send:iSend,case_date:oDates.date_first_obr}});
                }
                else {
                    myObj.reallySaveMe({send:1});
                }
            },
			printMe: function () {
                var myBody = this.content;
                $(myBody).jqprint();
            },
            closeMe: function () {
                var that = this;
                proxy.publish("docClose", { uuid: that.uuid, content: $(that.content).html() });
            },
            fnOnClick: function (obj) {
                var myObj = obj;
                var fnc = function (e) {
                    var btnText;
                    try {
                        btnText = $(e.target).attr("title").trim();
                    }
                    catch (e) {
                        btnText = "";
                    };
                    //            console.log("clicked: "+$(e.target))
                    if (btnText == "Закрыть") {
                        myObj.closeMe();
                    }
                    if (btnText == "Сохранить") {
                        if (myObj.validate()) {
                            myObj.saveMe(0);
                        }
                    }
                    if (btnText == "Послать извещение") {

                        if (myObj.validate()) {
                            kendo.confirm("После отправки извещения оно станет недоступно для изменения!").
                            then(function() {
                                myObj.saveMe(1);
                            });

                        }
                    }
                    if (btnText == "Данные для отчета") {
                        myObj.openGpOtchet();
                    }
                    if (btnText == "Донесение в РосПотребНадзор") {
                        myObj.openGrippDonos();
                    }
					if (btnText == "Печать") {
                        if (myObj.validate()) {
                            myObj.saveMe(0);
							myObj.printMe();
                        }
                    }
                };
                return fnc;
            },
            //doClose: function () {
            //    this.oContainer.closeDocTab(this.oContainer.currentTabStripIndex);
            //    this.oContainer.docTabStrip.select("li:last");

            //},
            //dsCreate: new kendo.data.DataSource({
            //    type: "json",
            //    serverPaging: false,
            //    serverSorting: false,
            //    pageSize: 15,
            //    transport: {
            //        read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=create_doc",
            //        dataType: "json"
            //    },
            //    requestEnd: utils._onRequestEnd,
            //    schema: {
            //        data: "doc.rows",
            //        total: "records",
            //        errors: "error",
            //        model: {
            //            fields: {
            //                doc_id: { type: "number" },
            //                doc_html: {
            //                    type: "string"
            //                }
            //            }
            //        }
            //    },
            //    change: function (e) {
            //        this.parentObj.dsReadOk(e);
            //    },
            //    error: function (e) {
            //        this.parentObj.dsReadError(e);
            //    }
            //}),
            //dsRead: new kendo.data.DataSource({
            //    type: "json",
            //    serverPaging: false,
            //    serverSorting: false,
            //    pageSize: 15,
            //    transport: {
            //        read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ibDoc",
            //        dataType: "json"
            //    },
            //    requestEnd: utils._onRequestEnd,
            //    schema: {
            //        data: "ibdoc.rows",
            //        total: "records",
            //        errors: "error",
            //        model: {
            //            fields: {
            //                record_id: { type: "string" },
            //                doc_id: { type: "number" },
            //                doc_html: {
            //                    type: "string"f
            //                }
            //            }
            //        }
            //    },
            //    change: function (e) {
            //        this.parentObj.dsReadOk(e);
            //    },
            //    error: function (e) {
            //        this.parentObj.dsReadError(e);
            //    }
            //}),
            //dsGpMkb:ot58Mkb,
            /*
            dsGpMkb: new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 100,
                transport: {
                    read: "default.aspx?action=StacDoct_main/MKB_AJAX&action2=get_gripp_pnevm",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "gp.rows",
                    total: "records",
                    errors: "error",
                    model: {
                        fields: {
                            id: { type: "string" },
                            name: { type: "string" }
                        }
                    }
                }
            }),
            */
            //createDoc: function (askId, userId, recordId) {
            //    // public
            //    this.askId = askId;
            //    if (recordId) {
            //        this.dsRead.read({
            //            record_id: recordId,
            //            user_id: userId
            //        })
            //    }
            //    else {
            //        this.dsCreate.read({
            //            ask_id: askId,
            //            user_id: userId,
            //            doc_id: this.docVid
            //        })
            //    }
            //    kendo.ui.progress($("#ibDocs"), true);
            //},
            initialize: function (data) {
                var bReadOnly=false;
                DocBase.fn.initialize.call(this, data);
                try {
                    $(this.toolbar).kendo.destroy();
                }
                catch (e) {
                }
                if (data.ext3) {
                    bReadOnly=true;
                }
                this.createToolbar(bReadOnly);
                data.items=[data];
                /*
                this.set("dsOt58",new kendo.data.DataSource({
                    serverPaging: false,
                    serverSorting: false,
                    pageSize: 100,
                    transport: {
                        read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ot58",
                        dataType: "json"
                    },
                    requestEnd: utils._onRequestEnd,
                    schema: {
                        data: "ot58.rows",
                        total: "records",
                        errors: "error",
                        model: {
                            fields: {
                                mkb: { type: "string" },
                                stepen: { type: "number" },
                                berem: { type: "number" }
                            }
                        }
                    },
                    change: function (e) {
                        this.parentObj.ds58ReadOk(e);
                    }

                }));
                this.set("dsOt58.parentObj",this);
                this.set("askId",proxy.getSessionObject("selectedIb").ask_id);
                */
                this.dsReadOk(data);
                //
                // prepare content
                this.prepareContent(bReadOnly);  // ibitialize mySelObject
                /*
                this.dsRead.read({
                    record_id: this.recordId,
                    user_id: this.userId
                })
                */
            }

        });
        return Doc58;
    });