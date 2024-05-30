/**
 * Created by STAR_06 on 26.01.2016.
 */
define(["kendo.all.min", "docs/DocBase", "services/proxyService", "utils", "alertify", "dataSources/ibDocsListDataSource"],
    function (kendo, DocBase, proxy, utils, alertify, ibDocsDS) {
        var Doc59;
        Doc59 = DocBase.extend({
            partsCount: 0,
            partChooser: null,
            subType: 1,
            parts: null,
            surveyId: null,
            surveyWindowHandle: null,
            timerHandle: null,
            init: function (data, uuid) {
                // public
                DocBase.fn.init.call(this, uuid);
                this.docVid = 59;
                this.dsRead.parentObj = this;
                this.dsCreate.parentObj = this;
                this.dsReadFromSurvey.parentObj = this;
                this.isReadOnly = true;
                this.surveyId = null;
                this.subType = 1;
                this.surveyLink = "";
                this.linkType = 0;
                this.partsCount = 0;
                this.partChooser = null;
                this.parts = null;
                this.surveyWindowHandle = null;
                this.timerHandle = null;
                this.mayPrint = false;
            },
            dsReadFromSurveyOk: function (e) {
                var selIb = proxy.getSessionObject("selectedIb");
                var iIndex = -1;
                var myBody = this.content;
                kendo.ui.progress($("#ibDocs"), false);
                kendo.ui.progress($(myBody), false);
                var iItems = e.items.length;
                this.partsCount = e.items.length;
                this.parts = e.items;
                if (iItems) {
                    if (e.items[0].record_id) {
                        if (this.recordId) {
                            for (var i = 0; i < this.partsCount; i++) {
                                if (this.recordId === e.items[i].record_id) {
                                    iIndex = i;
                                    break;
                                }
                            }
                        }
                        else {
                            this.recordId = e.items[0].record_id;
                        }
                    }
                    if (iIndex < 0) {
                        if (e.items[0].record_id) {
                            this.recordId = e.items[0].record_id;
                        }
                        if (this.subType) {
                            for (var i = 0; i < this.partsCount; i++) {
                                if (this.subType == e.items[i].subtype) {
                                    iIndex = i;
                                    this.recordId = e.items[i].record_id;
                                    break;
                                }
                            }
                        }
                    }
                    if (iIndex < 0) {
                        iIndex = 0;
                    }
                    if (!(e.items[0].ext1) == "") {
                        this.set("surveyId", e.items[0].ext1);
                    }
                    $(myBody.html(e.items[iIndex].doc_html));
                    iIndex = iIndex + 1;
                    this.partChooser.value(iIndex);
                    /*
                    var oldHtml=$(myBody).find(".survey-links");
                    $(oldHtml).removeClass("no-print");
                    $(oldHtml).html(e.items[0].doc_html);
                    */
                    var toolbar = $(this.toolbar).data("kendoToolBar");
                    if (this.get("surveyId")) {
                        toolbar.enable($(".survey-create"), false);
                        if (!this.isDocumentSended(ibDocsDS)) {
                            toolbar.enable($(".survey-edit"), true);
                        }
                        else {
                            toolbar.enable($(".survey-edit"), false);
                        }
                        toolbar.enable($(".doc-print"), true);
                        toolbar.enable($(".doc-print-all"), true);
                        this.partChooser.enable(true);
                    }

                }
                else {
                    //
                }
                ibDocsDS.read({ ask_id: selIb.ask_id });

            },
            dsReadOk: function (e) {
                if (!e.items) {
                    this.doClose();
                    return;
                }
                var iIndex = -1;
                kendo.ui.progress($("#ibDocs"), false);
                this.isLoaded = true;
                this.isSaved = false;
                this.parts = e.items;
                this.partsCount = e.items.length;
                if (e.items[0].record_id) {
                    if (this.recordId) {
                        for (var i = 0; i < this.partsCount; i++) {
                            if (this.recordId === e.items[i].record_id) {
                                iIndex = i;
                                break;
                            }
                        }
                    }
                    this.mayPrint = false;
                    if (e.items[0].ext3) {
                        this.mayPrint = true;
                    }
                }
                else {
                    this.recordId = "";
                }
                if (iIndex < 0) {
                    iIndex = 0;
                }
                if (e.items[iIndex].subtype) {
                    this.subType = e.items[iIndex].subtype;
                }
                if (!(e.items[iIndex].ext1) == "") {
                    //            this.isReadOnly=true;
                    this.set("surveyId",e.items[iIndex].ext1);
                }
                if (!(e.items[iIndex].ext3) == "") {
                    this.isReadOnly = true;
                }
                if (e.items[iIndex].survey_link) {
                    this.surveyLink = e.items[iIndex].survey_link;
                }
                if (e.items[iIndex].link_type) {
                    this.linkType = e.items[iIndex].link_type;
                }

                //this.addToContainer(e.items[iIndex].doc_html);
                var toolbar = $(this.toolbar).data("kendoToolBar");
                if (this.surveyId) {
                    toolbar.enable($(".survey-create"), false);
                    if (!this.isDocumentSended(ibDocsDS)) {
                        toolbar.enable($(".survey-edit"), true);
                    }
                    else {
                        toolbar.enable($(".survey-edit"), false);
                    }
                    if (!this.recordId) {
                        this.recordId = e.items[0].record_id;
                    }
                }
                if (this.recordId) {
                    this.partChooser.enable(true);
                    toolbar.enable($(".doc-print"), true);
                    toolbar.enable($(".doc-print-all"), true);
                }
                else {
                    this.partChooser.enable(false);
                    toolbar.enable($(".doc-print"), false);
                    toolbar.enable($(".doc-print-all"), false);
                }
                iIndex = iIndex + 1;
                this.partChooser.value(iIndex);

            },
            dsReadError: function (e) {
                kendo.ui.progress($("#ibDocs"), false);
                utils.ajax_error(e);
            },
            //addToContainer: function (sHtml) {
            //    var oContainer = this.oContainer;
            //    var newIndex = oContainer.docTabStrip.items().length;
            //    var sUuid = Math.uuid(15);
            //    var toolBarId = "tb_" + sUuid;
            //    var documentId = "doc_" + sUuid;
            //    var sTitle = "ОнкоДок";
            //    if (this.subType == 1) {
            //        //            sTitle="Ф-027-1 ";
            //    }
            //    if (this.subType == 2) {
            //        //            sTitle="Ф-090 ";
            //    }
            //    if (this.subType == 3) {
            //        //            sTitle="Ф-027-2 ";
            //    }
            //    oContainer.docTabStrip.append([{
            //        text: sTitle + newIndex,
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
                var selIb = proxy.getSessionObject("selectedIb");
                if ((selIb.rdonly) || (utils.isViewer())) {
                    $(this.content).find("[contenteditable]").removeAttr("contenteditable");
                }
                else {
                    DocBase.fn.bindEditor.call(this);
                }
            },
            isDocumentSended: function(ds) {
                var data = ds.data();

                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (!(item.doc_id == 59)) {
                        continue;
                    }
                    if (item.ext3) {
                        return true;
                    }
                }
                return false;
            },
            isDocumentSaved: function(ds) {
                var data = ds.data();

                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if ((item.doc_id == 59)) {
                        return true;
                    }
                }
                return false;
            },
            createToolbar: function (bReadOnly) {
                var aTools = new Array();
                var selIb = proxy.getSessionObject("selectedIb");

                if (this.subType >= 1) {
                    if ((!utils.isViewer()) || (!this.isDocumentSended(ibDocsDS)) || (!this.isOldIb()) ) {
                        if (!(selIb.is_ldo)) {
                            aTools.push(
                                { type: "button", text: " Отправить",
                                    attributes: { "data-bind":"enabled:surveyId" , "class": "doc-send faa faa-envelope-o", "rel": "tooltip", "title": "Отправить онко-документацию в кабинет статистики" }, showText: "always" }
                            );
                        }
                    }
                    if (/*(!bReadOnly) &&*/ (!utils.isViewer()) && (!(selIb.is_ldo) && (!this.isOldIb()))) {
//                        aTools.push(
//                            { type: "button", text: " Послать извещение", attributes: { "class": "faa faa-envelope-o", "rel": "tooltip", "title": "Послать извещение" }, showText: "overflow" }
//                        );
                        //        }
                        //        else {
                        /*
                        aTools.push({
                            type: "button", text: " Сохранить без посылки извещения",
                            attributes: {"data-bind":"enabled:surveyId", "class": "faa faa-download", "rel": "tooltip", "title": "Сохранить" }, showText: "overflow"
                        });
                        */
                    //};
                    //            if (!(this.surveyId)) {
						aTools.push({
							type: "button", text: " Создать",
							attributes: { "class": "faa faa-file-o survey-create", "rel": "tooltip", "title": "Создать" }, showText: "both"
						}
						);
						//            }
						//            else {
//                        if (!this.isDocumentSended(ibDocsDS)) {
                            aTools.push({
                                type: "button", text: " Изменить",
                                attributes: {
                                    "class": "faa faa-file-text-o survey-edit",
                                    "rel": "tooltip",
                                    "title": "Изменить"
                                }, showText: "both"
                            });
//                        }
                    }
                    aTools.push({
                        type: "button", text: " Обновить",
                        attributes: { "class": "faa faa-refresh survey-refresh", "rel": "tooltip", "title": "Обновить" }, showText: "both"
                    }
                    );
                    aTools.push({ type: "separator" });
                }
                aTools.push({
                    type: "button", text: " Печать",
                    attributes: {  "data-bind":"enabled:surveyId", "class": "doc-print faa faa-print", "rel": "tooltip", "title": "Печать" }, showText: "overflow"
                });
                aTools.push({ type: "separator" });
                aTools.push({
                    template: "<input class='part-chooser' style='width: 180px;' />",
                    overflow: "never"
                });
                aTools.push({
                    type: "button", text: "Печатать все",
                    attributes: { "class": "doc-print-all", "rel": "tooltip", "title": "Печатать все" }, showText: "always"
                });

                if (/*(!bReadOnly) &&*/ (!utils.isViewer())) {
//					aTools.push(
//						{ type: "button", text: " Отправить", attributes: { "class": "doc-send faa faa-envelope-o", "rel": "tooltip", "title": "Отправить онко-документацию в кабинет статистики" }, showText: "always" }
//					);
				}

                aTools.push({ type: "button", text: " Закрыть", attributes: { "class": "faa faa-close pull-right", "rel": "tooltip", "title": "Закрыть" }, showText: "overflow" });

                $(this.toolbar).kendoToolBar({
                    items: aTools,
                    click: this.fnOnClick(this)
                });
                var toolbar = $(this.toolbar).data("kendoToolBar");
                if (!(this.surveyId)) {
                    toolbar.enable($(".survey-edit"), false);
                }
                this.partChooser = $(this.toolbar).find(".part-chooser").first().kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [
                        { text: "Выписка (027-1/у)", value: 1 },
                        { text: "Извещение (090/у)", value: 2 },
                        { text: "Протокол (027-2/у)", value: 3 }
                    ],
                    change: this.fnOnPartChange(this)
                }).data("kendoDropDownList");
                kendo.bind($(this.toolbar),this);
            },
            fnOnPartChange: function (obj) {
                //      alertify.alert("Part Change");
                var myObj = obj;
                var fnc = function (e) {
                    var myBody = myObj.content;
                    var newVal = Number(this.value());    // value of dropdown
                    myObj.doOnPartChange(myBody, newVal);
                };
                return fnc;
            },
            doOnPartChange: function (myBody, newVal) {
                var parts = this.parts;
                if (newVal) {
                    if (parts.length >= (newVal)) {
                        $(myBody.html(parts[newVal - 1].doc_html));
                    }
                    else {
                        $(myBody.html(""));
                    }
                    this.subType = newVal;
                }
            },
            timerStop: function (obj) {
                if (obj.timerHandle) {
                    clearInterval(obj.timerHandle);
                    obj.timerHandle = null;
                    obj.surveyWindowHandle = null;
                }
            },
            timerStart: function () {
                var that = this;
                this.timerHandle = setInterval(function () {
                    var wHandle = that.surveyWindowHandle;
                    if (wHandle) {
                        try {
                            var survey = wHandle.survey;
                            var isSurveyCompleted = false;
                            if (survey) {
                                isSurveyCompleted = survey.isCompleted;
                            }
                            var isSurveySaved = wHandle.isSurveySaved;
                            if (isSurveyCompleted) {
                                if (isSurveySaved) {
                                    setTimeout(function () {
                                        try {
                                            wHandle.close();
                                        }
                                        catch (e) { }
                                        window.focus();
                                        that.refreshSurvey();
                                    }, 50);
                                    that.timerStop(that);
                                }
                            }
                        }
                        catch (e) {
                            that.timerStop(that);
                        }
                    }
                }, 1000);
            },
            newSurvey: function () {
                var toolbar = $(this.toolbar).data("kendoToolBar");
                toolbar.enable($(".survey-create"), false);
                toolbar.enable($(".survey-edit"), false);

                this.surveyWindowHandle = window.open(this.surveyLink);
                if (!(this.timerHandle)) {
                    this.timerStart();
                }
            },
            editSurvey: function () {
                if (!(this.surveyId)) {
                    alertify.alert("Идентификатор опроса не получен или неверен");
                    return;
                }
                if (this.isDocumentSended(ibDocsDS)) {
                    alertify.alert("Документ отправлен в онко-диспансер.<br>Редактирование невозможно!");
                    return;
                }
                var sLink = location.origin+"/survey/Home/Edit/" + this.surveyId;
                this.surveyWindowHandle = window.open(sLink);
                //while (!(this.surveyWindowHandle)) {

                //}
                if (!(this.timerHandle)) {
                    this.timerStart();
                }
            },
            refreshSurvey: function () {
                var selIb = proxy.getSessionObject("selectedIb");
                if (selIb) {
                    var myBody = this.content;
                    kendo.ui.progress($(myBody), true);

                    var that=this;
                    this.dsReadFromSurvey.read({
                        ask_id: selIb.ask_id,
                        vid: this.docVid,
                        subtype: this.subType,
                        user_id: Number(localStorage['last_user'])
                    }).then(function() {
                        proxy.publish("docSaved",{uuid:that.uuid,record_id:that.recordId});

//                        ibDocsDS.read({ ask_id: selIb.ask_id });

                    })
                }
            },
            prepareContent: function () {
                var myBody = this.content;
                $(myBody).find(".my-sel.sel1").each(function (i) {
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
                        sSel = aOpt[0];
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

            },
            saveContent: function () {
            },
            onContentShown: function () {
                var myObj = this;
                var myBody = this.content;
                $(myBody).find(".my-sel.sel1").first().focus();
                setTimeout(function () { setDocHeight($(myObj.content)) }, 100);
            },
            validate: function () {
                var that=this;
                if (!that.surveyId) {
                    return false;
                }
                return true;
                /*
                var myBody=this.uiContainer.body;
                var bRet;
                bRet=true;
                $(myBody).find("div[data-validate='not-empty']").each(function(i) {
                    if (!($(this).text().trim())) {
                        bRet=false;
                    }
                });
                if (!bRet) {
                    alertify.error("Не все обязательные поля заполнены!");
                }
                return bRet;
                */
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
            getDiagn: function (myBody) {
                var sRet = "";
                var div = $(myBody).find("table[data-ol='1'] tr td div[contenteditable='true']").first();
                if ($(div).length) {
                    sRet = $(div).text().trim();
                }
                return sRet;
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
                    var sDiag = this.getDiagn(myBody);
                    sDiag = sDiag.toUpperCase() + " ";
                    if ((sDiag.search("ПНЕВМОНИЯ")) < 0) {
                        if ((sDiag.search("ГРИПП")) < 0) {
                            bResult = false;
                        }
                    }
                }
                return bResult;
            },
            saveMe: function (iSend) {
                if (this.isDocumentSended(ibDocsDS) && iSend) {
                    kendo.alert("Документ уже был отправлен!")
                    return;
                }
                var selIb = proxy.getSessionObject("selectedIb");
                var myBody = this.content;
                var myObj = this;
                var myData = this.getAllPartsHtml(iSend);
                kendo.ui.progress($(this.toolbar), true);
                $.ajax({
                    url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=59_send_doc&record_id=" + this.recordId + "&survey_id=" + this.surveyId +
                        "&ask_id=" + selIb.ask_id + "&doc_id=" + this.docVid.toString() +
                        "&user_id=" + Number(localStorage['last_user']).toString() + "&send=" + iSend.toString() + 
						"&parts=" + this.partsCount.toString(),
                    type: "POST",
                    data: myData,
                    processData: false,
                    success: function (data, textStatus) {
                        kendo.ui.progress($(myObj.toolbar), false);
                        utils._onRequestEnd(0);
                        if (iSend) {
                            if (data.error) {
                                alertify.alert(data.error);
                            }
                        }
                        ibDocsDS.read({ ask_id: selIb.ask_id });
                    },
                    dataType: "json"
                });

            },
            closeMe: function () {
                var that=this;
                if (this.isDocumentSaved(ibDocsDS) && (!this.isDocumentSended(ibDocsDS))) {
                    kendo.confirm("Документ не был отправлен в онко-диспансер!<br>Отправить сейчас?").
                    then(
                        function(){
                        that.saveMe(1);
                    },
                        function() {
                        that.doClose();
                    }
                    )
                }
                else {
                    that.doClose();
                }
            },
			doClose: function() {
				if (this.timerHandle) {
					this.timerStop(this);
				}
				var that=this;
				proxy.publish("docClose",{uuid:that.uuid,content:$(that.content).html()});
				
				//this.oContainer.closeDocTab(this.oContainer.currentTabStripIndex);
				//this.oContainer.docTabStrip.select("li:last");

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
                    }
                    var disabled=$(e.target).attr("disabled") || "";
                    if (disabled=="disabled") {
                        kendo.alert("Функция '"+btnText+"' в настоящий момент недоступна!");
                        return;
                    }
                    //            console.log("clicked: "+$(e.target))
                    if (btnText == "Создать") {
                        myObj.newSurvey();
                    }
                    if (btnText == "Изменить") {
                        myObj.editSurvey();
                    }
                    if (btnText == "Обновить") {
                        myObj.refreshSurvey();
                    }
                    if (btnText == "Закрыть") {
                        myObj.closeMe();
                    }
                    if (btnText == "Печать") {
                        if (myObj.mayPrint) {
                            if (myObj.validate()) {
                                myObj.printMe();
                            }
                        }
                        else {
                            alertify.alert("Сначала нужно отправить документацию в статистику!");
                        }
                    }
                    if (btnText == "Печатать все") {
                        if (myObj.mayPrint) {
                            if (myObj.validate()) {
                                myObj.printMeAll();
                            }
                        }
                        else {
                            alertify.alert("Сначала нужно отправить документацию в статистику!");
                        }
                    }
                    if (btnText == "Сохранить") {
                        myObj.saveMe(0);
                    }
                    if (btnText == "Отправить онко-документацию в кабинет статистики") {

                        if (myObj.validate()) {
                            myObj.saveMe(1);
                            myObj.mayPrint = true;
                        }
                    }
                };
                return fnc;
            },
            printMe: function () {
                var myBody = this.content;
                $(myBody).jqprint();
            },
            getAllPartsHtml: function (iSend) {
                var theBody = "";
				var prot = "";
				var izv = "";
				var vyp = "";
				var pagebreak = "<div class='survey-page-break'></div>";
                for (var i = 0; i < this.partsCount; i++) {
					if (i == 0) {
						vyp = this.parts[i].doc_html;
					}
					if (i == 1) {
						izv = this.parts[i].doc_html;
					}
					if (i == 2) {
						prot = this.parts[i].doc_html;
					}
					
                    //theBody = theBody + this.parts[i].doc_html;
                    //if (!(i == this.partsCount - 1)) {
                    //    theBody = theBody + "<div class='survey-page-break'></div>";
                    //}
                    //if ((i==2) && iSend) {
                        // при отправке Протокол в 2-х экземплярах
                    //    theBody = theBody + "<div class='survey-page-break'></div>";
                    //    theBody = theBody + this.parts[i].doc_html;
                    //}
                }
				if (iSend) {
					if (prot != "") {
						theBody = theBody + prot + pagebreak + prot + pagebreak;
					}
					if (vyp != "") {
						theBody = theBody + vyp + pagebreak;
					}
					if (izv != "") {
						theBody = theBody + izv;
					}
				}
				else {
					theBody = vyp + izv + prot;
				}
				
                return theBody;
            },
            printMeAll: function () {
                var theBody = this.getAllPartsHtml(0);
                if (theBody) {
                    $(theBody).jqprint();
                }
            },
            dsCreate: new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 15,
                transport: {
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=create_doc",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "doc.rows",
                    total: "records",
                    errors: "error",
                    model: {
                        fields: {
                            doc_id: { type: "number" },
                            doc_html: {
                                type: "string"
                            }
                        }
                    }
                },
                change: function (e) {
                    this.parentObj.dsReadOk(e);
                },
                error: function (e) {
                    this.parentObj.dsReadError(e);
                }
            }),
            dsRead: new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 15,
                transport: {
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ibDoc",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "ibdoc.rows",
                    total: "records",
                    errors: "error",
                    model: {
                        fields: {
                            record_id: { type: "string" },
                            doc_id: { type: "number" },
                            subtype: { type: "number" },
                            doc_html: {
                                type: "string"
                            }
                        }
                    }
                },
                change: function (e) {
                    this.parentObj.dsReadOk(e);
                },
                error: function (e) {
                    this.parentObj.dsReadError(e);
                }
            }),
            dsReadFromSurvey: new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 15,
                transport: {
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ibDocFromSurvey",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "ibdoc.rows",
                    total: "records",
                    errors: "error",
                    model: {
                        fields: {
                            record_id: { type: "string" },
                            doc_id: { type: "number" },
                            subtype: { type: "number" },
                            doc_html: {
                                type: "string"
                            }
                        }
                    }
                },
                change: function (e) {
                    this.parentObj.dsReadFromSurveyOk(e);
                },
                error: function (e) {
                    this.parentObj.dsReadError(e);
                }
            }),
            createDoc: function (askId, userId, recordId) {
                // public
                this.askId = askId;
                if (recordId) {
                    this.recordId = recordId;
                    this.dsRead.read({
                        record_id: recordId,
                        user_id: userId
                    })
                }
                else {
                    this.dsCreate.read({
                        ask_id: askId,
                        user_id: userId,
                        doc_id: this.docVid
                    })
                }
                kendo.ui.progress($("#ibDocs"), true);
            },
            initialize: function (data,allPartsData) {
                DocBase.fn.initialize.call(this, data);
                try {
                    $(this.toolbar).kendo.destroy();
                }
                catch (e) {
                }
                this.saveQuestion="";
                this.changeQuestion="";
                this.set("subtype",data.subtype);
                data.items = allPartsData;
                this.createToolbar(true);
                this.dsReadOk(data);
            }
        });

        return Doc59;
    });