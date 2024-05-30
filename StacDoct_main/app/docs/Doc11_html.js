/**
 * Created by 1 on 11.12.2015.
 */
define(["kendo.all.min","docs/DocBase","docs/mySelObject","services/proxyService","utils"],
    function(kendo,DocBase,mySelObject,proxy,utils){
    var Doc11;
    Doc11 = DocBase.extend({
        init: function (data,uuid) {
            DocBase.fn.init.call(this, uuid);
            this.docVid=11;
            this.data=data;
            this.docSub=data.subtype;
        },
        publishDocChanged: function() {
            proxy.publish("docChanged",{uuid:this.uuid,content:$(this.content).html()});
        },
        bindEditor: function() {
            var selIb=proxy.getSessionObject("selectedIb");
            if (selIb.rdonly) {
                $(this.content).find("[contenteditable]").removeAttr("contenteditable");
            }
            else {
                DocBase.fn.bindEditor.call(this);
            }
        },
        createToolbar: function () {
            var that=this;
            var items=[];
            var selIb=proxy.getSessionObject("selectedIb");
            if (!selIb.rdonly) {
                items.push(
                    {type: "button", text: " Сохранить", attributes: { "class": "faa faa-download", "rel": "tooltip", "title": "Сохранить" }, showText: "overflow"}
                );
            }
            items.splice(items.length,0,
                {type: "button", text: " Печать", attributes: { "class": "faa faa-print", "rel": "tooltip", "title": "Печать" }, showText: "overflow"},
                {type: "button", text: " Показать результат", attributes: { "class": "faa faa-file-text-o", "rel": "tooltip", "title": "Показать результат" }, showText: "overflow"},
                { type: "separator" },
                {type:"button", text:"Экспорт в формат PDF", attributes: { "class": "faa faa-file-pdf-o","rel":"tooltip","title":"Экспорт в формат PDF" }, showText: "overflow"},
                /*
                {
                    type: "splitButton",
                    text: "Экспорт",
                    menuButtons: [
                        { text: "Adobe Reader (pdf)", attributes: { "rel": "tooltip", "title": "PDF"} },
                        { text: "Clinical document (xml)", attributes: { "rel": "tooltip", "title": "XML"} }
                    ]
                },
                */
                //
                {type: "button", text: " Закрыть", attributes: { "class": "faa faa-close pull-right", "rel": "tooltip", "title": "Закрыть" }, showText: "overflow"}
            );
            $(this.toolbar).kendoToolBar({
                items: items,
                click: this.fnOnClick(this)
            });
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
                ;
                if (btnText == "Закрыть") {
                    myObj.closeMe();
                }
                if (btnText == "Сохранить") {
                    myObj.saveMe(false);
                }
                if (btnText == "Печать") {

                    if (myObj.validate()) {
                        myObj.printMe();
                    }
                }
                if (btnText == "Показать результат") {
                    myObj.showHideText();
                }

                if (btnText == "Экспорт в формат PDF") {
                    if (myObj.validate()) {
                        myObj.exportPDF();
                    }
                }
                if (btnText == "XML") {
                    if (myObj.validate()) {
                        myObj.exportXML();
                    }
                }
            };
            return fnc;

        },
        validate: function () {
            return true;
        },
        savePart: function (sDocRecordId, sAskId, iFieldType, sText, sHtml) {
            // Saves one field to ib_fields table
            $.ajax({
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc_part&record_id=" + sDocRecordId +
                    "&ask_id=" + sAskId + "&field_id=" + iFieldType.toString() +
                    "&user_id=" + Number(localStorage['last_user']),
                type: "POST",
                data: "!1!" + sText + "!2!" + sHtml,
                processData: false,
                success: function (data, textStatus) {
//                _onRequestEnd(0);
                },
                dataType: "json"
            });
        },
        saveParts: function (myObj,bClose) {
            for (var i = 0; i < myObj.aAnamnez.length; i++) {
                if (myObj.aAnamnez[i].text) {
                    myObj.savePart(
                        myObj.recordId,
                        myObj.selIb.ask_id,
                            Number(myObj.aAnamnez[i].razdel), myObj.aAnamnez[i].text, myObj.aAnamnez[i].html
                    );
                }
            }
        },
        saveMe: function(bClose) {

            var that=this;
            var selIb=this.selIb;
            var mainDiv = $(that.content).find("div.document-div").first();
            var inputs=$(mainDiv).find("div.doc-date-time").find("form").find("input");
            var dDate=new Date();
            var tTime=new Date();
            if (inputs.length==2) {
                dDate=$(inputs[0]).data("kendoDatePicker").value();
                tTime=$(inputs[1]).data("kendoTimePicker").value();
            }
            var sHtml = this.prepareText();
            var sZag=this.prepareZag();
            var sDateTime=this.prepareDateTime();
            var printDiv = $(that.content).find("div.for-print");
            $(printDiv).html(sZag + sDateTime + sHtml);
            this.unbindEditor();
//            this.storeDateTime();

            var printable=that.printable;
            $(printable).html($(this.content).html());
            $(printable).find("div.doc-date-time").remove();
            $(printable).find("p.doc-name").remove();
            $(printable).find("p.doc-patient").remove();
            var data=$(printable).html();
            $.ajax({
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc&record_id=" + this.recordId +
                    "&ask_id=" + selIb.ask_id + "&doc_id=" + this.docVid.toString() +
                    "&doc_subtype=" + this.docSub.toString() +
                    "&doc_date="+kendo.toString(dDate,"yyyyMMdd")+
                    "&doc_time="+kendo.toString(tTime,"HH:mm")+
                    "&user_id=" + Number(localStorage['last_user']),
                type: "POST",
                data: data,
                processData: false,
                success: function (data, textStatus) {
                    that.recordId = data.doc.rows[0].record_id;
                    proxy.publish("docSaved",{uuid:that.uuid,record_id:that.recordId});
                    if (bClose) {
                        setTimeout(function(){
                            that.closeMe();
                        },500);
                    }
                    that.saveParts(that,bClose);
                    /*
                    kendo.ui.progress($(myObj.uiContainer.toolBar), false);
                    myObj.isSaved = true;
                    myObj.savedContent = $(myBody).html();
                    myObj.saveParts(myObj);
//                $(myObj.uiContainer.body).html(myObj.savedContent);
                    myObj.prepareContent();
                    ibDocsDS.read({ask_id: ibModel.get('selectedIb').ask_id});
                    _onRequestEnd(0);
                    myObj.oContainer.bindEditor($(myObj.uiContainer.body))
//                ibDocsModel.afterSaveDoc();
                    */
                },
                dataType: "json"
            });

        },
        getFormElement: function (iFormIndex, iElIndex) {
            var oRet = null;
            var myBody = this.content;
            var mainDiv = $(myBody).find("div.document-div").first();
            $(mainDiv).find("form").each(function (i) {
                if (i == iFormIndex) {
                    $(this).find("input").each(function (j) {
                        if (j == iElIndex) {
                            oRet = $(this);
                        }
                    })
                }
            });
            return oRet;
        },
        changeRawServerContent: function() {
            var that=this;
            var myBody = this.content;
            try {
                // remove unused forms, because this is in toolbar now
//            $(myBody).find("form.k-content.k-toolbar").remove();
            }
            catch (e) {
            }
            // set Date and Time

            var mainDiv = $(myBody).find("div.document-div").first();
            if (!($(mainDiv).find("div.doc-date-time").length)) {
                var sForm = "<div class='doc-date-time'><form class='form-inline'><label>Дата:<input/></label><span>&nbsp;&nbsp;</span><label>Время:<input/></label></form></div>";
                $(mainDiv).find("div").first().before("<p class='doc-name'>" + $(mainDiv).attr("data-docname") + "</p>");
                $(mainDiv).find("div").first().before(sForm);
            }
            var datePicker = $(this.getFormElement(0, 0));
            var timePicker = $(this.getFormElement(0, 1));
            var d = new Date();
            var d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
            var sDateTime = $(mainDiv).attr("data-date");
            if (!(sDateTime === "")) {
                var aDateTime = sDateTime.split(";")
                d = new Date(
                    Number(aDateTime[0]),
                        Number(aDateTime[1]) - 1,
                    Number(aDateTime[2]),
                    Number(aDateTime[3]),
                    Number(aDateTime[4]),
                    0);
                d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0);
            }
            $(datePicker).kendoDatePicker({
                change: function(e) {
                    that.publishDocChanged();
                }
            });
            $(timePicker).kendoTimePicker({
                change: function(e) {
                    that.publishDocChanged();
                }
            });
            $(datePicker).attr("readonly", "readonly");
            $(timePicker).attr("readonly", "readonly");
            $(datePicker).data("kendoDatePicker").max(new Date());
            try {
                $(datePicker).data("kendoDatePicker").min(kendo.parseDate(that.selIb.date_ask));
            }
            catch (e) {
            }
            if (this.data.doc_date) {
                d=this.data.doc_date;
            }
            if (this.data.doc_time) {
                d2=this.data.doc_time;
            }
            $(datePicker).data("kendoDatePicker").value(d);
            $(timePicker).data("kendoTimePicker").value(d2);
            //
            var dateForm = $(mainDiv).find("form").first();
            $(dateForm).find("label").each(function (i) {
                if (i === 0) {
                    $(this).click(function (e) {
                        try {
//                        $(datePicker).data("kendoDatePicker").close();
                        }
                        catch (e) {
                        }
                        setTimeout(function () {
                            try {
                                $(datePicker).data("kendoDatePicker").open();
                            }
                            catch (e) {
                            }
                        }, 100);
                    });
                }
                if (i === 1) {
                    $(this).click(function (e) {
                        try {
                            //                      $(timePicker).data("kendoTimePicker").close();
                        }
                        catch (e) {
                        }
                        setTimeout(function () {
                            try {
                                $(timePicker).data("kendoTimePicker").open();
                            }
                            catch (e) {
                            }
                        }, 100);
                    });
                }
            });
            //
//        var bNeedButton=($(mainDiv).find("button.my-sel-btn").length==0);
            var pacSex=that.selIb.sex;
            if (pacSex=="м") {
                $(myBody).find("[data-sex='ж']").hide();
            }
            if (pacSex=="ж") {
                $(myBody).find("[data-sex='м']").hide();
            }
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
                    if (event.keyCode === KeyEvent.DOM_VK_SPACE) {
                        mySelObject.clickMySel(this,that.uuid);
                        event.preventDefault();
                    }
                });
                $(this).click(function (event) {
                    mySelObject.clickMySel(this,that.uuid);
                    event.preventDefault();
                });
//            $(this).after("<button class='my-sel-btn'>...</button>");
            });
//        $(".my-sel-btn").attr("tabindex",-1);
            // 21/10/2015
            $(mainDiv).find(".doc-mode-switch").each(function (i) {
                $(this).prop("checked",$(this).attr("checked") );
            });
            $(mainDiv).find(".doc-mode-switch").click(function (e) {
                var bMode = $(this).prop("checked");
                $(this).attr("checked",$(this).prop("checked"));
                var oParent = $(this).closest("div.doc-razdel");
                var sClassName = "doc-invisible";
                $(oParent).find("div.forma").each(function (i) {
                    if (bMode) {
                        if ($(this).hasClass(sClassName)) {
                            $(this).removeClass(sClassName);
                        }
                    }
                    else {
                        if (!$(this).hasClass(sClassName)) {
                            $(this).addClass(sClassName);
                        }
                        setTimeout(function () {
                            try {
                                $(oParent).find("div.no-forma").first().children("[contenteditable]").focus();
                            }
                            catch (e) {
                            }
                        }, 500);
                    }
                })
            }).attr("tabindex", -1);
            // add paragraphs
            $(mainDiv).find("div.forma").each(function (i) {
                if (!$(this).find("div.para").length){
                    $(this).find("div.new-line").each(function(j) {
                        $(this).get(0).outerHTML="<div class='para'>"+$(this).get(0).outerHTML+"</div>";
                    });
//                $(this).html("<div class='para'>"+$(this).html()+"<div>");
                };
            });
            that.publishDocChanged();
            setTimeout(function() {
                that.changeCount=0;
            },50);

        },
        publishDocChanged: function() {
            proxy.publish("docChanged",{uuid:this.uuid,content:$(this.content).html()});
        },
        selObjectChanged: function() {
            this.publishDocChanged();
        },
        storeDateTime: function () {
            var myBody = this.content;
            var mainDiv = $(myBody).find("div.document-div").first();
            var datePicker = $(this.getFormElement(0, 0));
            var timePicker = $(this.getFormElement(0, 1));
            var d1 = $(datePicker).data("kendoDatePicker").value();
            var d2 = $(timePicker).data("kendoTimePicker").value();
            var d = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(),
                d2.getHours(), d2.getMinutes(), 0);
            var s = d.getFullYear().toString();
            s = s + ";" + (d.getMonth() + 1).toString();
            s = s + ";" + d.getDate().toString();
            s = s + ";" + d.getHours().toString();
            s = s + ";" + d.getMinutes().toString();
            $(mainDiv).attr("data-date", s);
            return d;
        },
        getDateTimeString: function () {
            var myBody = this.content;
            var mainDiv = $(myBody).find("div.document-div").first();
            var d = this.storeDateTime();
            var sDateTime = "<p class='doc-p'>Дата:" + d.toLocaleDateString();
            sDateTime = sDateTime + "<span>&nbsp;&nbsp;&nbsp;</span>";
            var s = d.toLocaleTimeString();
            if (s.length < 8) {
                s = "0" + s;
            }
            s = s.substr(0, 5);
            sDateTime = sDateTime + "Время:" + s;
            sDateTime = sDateTime + "</p>";
            return sDateTime;
        },
        prepareZag: function() {
            var myBody = this.content;
            var mainDiv=$(myBody).find("div.document-div").first()
            var sZag = "<p class='doc-name'>" + $(mainDiv).attr("data-docname") + "</p>";
            sZag=sZag+"<p class='doc-patient'> № ИБ: "+this.selIb.niib.toString()+"-"+this.selIb.yea.toString()+"&nbsp;&nbsp;&nbsp;&nbsp;  Пациент: "+this.selIb.fio+"</p>";
            return sZag;
        },
        getDoctor: function() {
            if (this.data.user_name) {
                return this.data.user_name.fio2();
            }
            else {
                return $("#username").text().trim().fio2();
            }
        },
        prepareDoctorName: function() {
            return "<div style='margin-top:1em;'><p class='doc-p'>Врач:&nbsp;&nbsp;"+this.getDoctor()+"</p></div>";
        },
        exportPDF: function() {
            var that=this;
            this.printMe(true);
            var sData = $(this.printable).html();
            $.ajax({
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_PDF&" +
                    "CSS=html/css/vyp-print.css&" +
                    "top=10&bottom=5&left=15&right=5&zoom=1.10",
                type: "POST",
                data: sData,
                processData: false,
                success: function (data, textStatus) {
//                console.log(data);
                    if (data.error == '') {
                        var curIb = that.selIb;
                        var sFile = '' + '' + curIb.yea + '-' + curIb.niib;
                        var pom = document.getElementById('pom_pdf_downloader');
                        if (!pom) {
                            pom = document.createElement('a');
                            pom.setAttribute('id', 'pom_pdf_downloader');
                        }
                        pom.setAttribute('href', data.alink);
                        pom.setAttribute('download', sFile + '_' + curIb.fio.replaceAll(' ', '_')+"_осмотр" + ".pdf");
                        setTimeout(function () {
                            pom.click();
                        }, 2000);

                    }
                    else {
                        utils.ajax_error({error: data.error});
                    }
                    utils._onRequestEnd(0);
                },
                dataType: "json"
            });

        },
        printMe: function (bPdf) {
            var myBody = this.content;
            var mainDiv = $(myBody).find("div.document-div").first();
            var sHtml = this.prepareText();
            var sZag=this.prepareZag();
            var sDateTime=this.prepareDateTime();
//            var printDiv = $(myBody).find("div.for-print").first();
            var printDiv=this.printable;
            $(printDiv).html(sZag + sDateTime + sHtml);
            $(printDiv).html($(printDiv).html() +this.prepareDoctorName());

//            $(printDiv).toggle(true);
            if (!bPdf) {
                $(printDiv).jqprint();
            }
//            $(printDiv).toggle(false);
//            $(mainDiv).toggle(true);
        },
        prepareDateTime: function() {
            var d = this.storeDateTime();
            var sDateTime = this.getDateTimeString();
            return sDateTime;
        },
        showHideText: function () {
            var myBody = this.content;
            var mainDiv = $(myBody).find("div.document-div").first();
            var sHtml = this.prepareText();
            var sZag=this.prepareZag();
            var sDateTime=this.prepareDateTime();
            var printDiv = $(myBody).find("div.for-print");
            $(printDiv).html(sZag + sDateTime + sHtml);
            /*
            $(printDiv).toggle();
            $(mainDiv).toggle();
            */
            var div=document.createElement("DIV");
            $(div).html($(printDiv).html());
            $(div).kendoWindow({modal:true,title:"Просмотр текста",maxHeight:700});
            $(div).data("kendoWindow").open().center();
            this.publishDocChanged();
        },
        findRazdel: function(sId,myObj) {
            for (var i=0;i<myObj.aAnamnez.length;i++) {
                if (myObj.aAnamnez[i].razdel==sId) {
                    return i;
                }
            }
            return -1;
        },
        prepareText: function () {
            var myObj = this;
            var that=this;
            var myBody = this.content;
            var sHtml = "";
            this.aAnamnez = new Array();   // здесь будут строки для созранения в Parts
            var aHtml = new Array(100);
            for (var i = 0; i < aHtml.length; i++) {
                aHtml[i] = {razdel0:"",razdel:"", html:""};
            }

            var aEmptyRazdels = [];
            var sCurRazdelHeader = "";
            var nCurPartFld = 0;
            var mainDiv = $(myBody).find("div.document-div").first();
            $(mainDiv).find("div.doc-razdel").each(razdelVisitor);
            function razdelVisitor(idx) {
                var razdelFld=$(this).attr("data-field");
                var razdelName=$(this).attr("data-header");
                var razdelId=that.findRazdel(razdelFld,that);
                if (razdelId<0) {
                    that.aAnamnez.push({
                        razdel:razdelFld,
                        name:razdelName || "",
                        text:"",
                        html:""
                    });
                    razdelId=that.aAnamnez.length-1;
                }
                sHtml = "";
                if ($(this).children("div.doc-razdel").length > 0) {
                    aEmptyRazdels.push($(this).attr("data-header"));
                }
                else {
                    sCurRazdelHeader = $(this).attr("data-header");
                    try {
                        nCurPartFld = Number($(this).attr("data-field").trim());
                    }
                    catch (e) {
                        nCurPartFld = 0;
                    }
                    var bForma = false;
                    var myForm = ($(this).find("div.forma").first());
                    if (myForm.length > 0) {
                        bForma = !($(myForm).hasClass("doc-invisible"));
                    }
                    var sFormHtml = "";
                    if (bForma) {
                        var FormHtml="";
                        $(this).find("div.para").each(paraVisitor);
                        function paraVisitor(m) {
                            var sParaText = "";
                            $(this).find("div.no-empty").each(noEmptyVisitor);
                            function noEmptyVisitor(i) {
                                $(this).find(".no-blank").each(noBlankVisitor);
                                function noBlankVisitor(j) {
                                    var sTmp = "";
                                    var sZag = $(this).justText().trim();
                                    $(this).children().each(function (k) {
                                        if ($(this).hasClass("my-sel")) {
                                            var sSel = $(this).attr("data-sel");
                                            if (sSel) {
                                                if (!(sSel === "...")) {
                                                    if (sTmp.trim() === "") {
                                                        sTmp = " " + sZag;
                                                    }
                                                    var sSmb = ".";
                                                    if ($(this).hasAttr("data-end")) {
                                                        sSmb = $(this).attr("data-end");
                                                    }
                                                    if (sTmp.endsWith(".")) {
                                                        sTmp = sTmp.substring(0, sTmp.length - 1) + ", ";
                                                    }
                                                    sTmp = sTmp + " " + sSel + sSmb;
                                                }
                                            }
                                        }
                                        if ($(this).hasAttr("contenteditable")) {
                                            sSel = $(this).text().trim();
                                            if (sSel) {
                                                if ($(this).hasClass("i-edit")) {
                                                    if (sTmp.endsWith(".")) {
                                                        sTmp = sTmp.substring(0, sTmp.length - 1) + " ";
                                                    }
                                                }
                                                if (sTmp.trim() === "") {
                                                    sTmp = " " + sZag;
                                                }
                                                sTmp = sTmp + " " + sSel;
                                                var sSmb = "";
                                                if ($(this).hasAttr("data-end")) {
                                                    sSmb = $(this).attr("data-end");
                                                    if (!(sTmp.trim().endsWith(sSmb))) {
                                                        sTmp=sTmp+sSmb;
                                                    }
                                                }
                                            }
                                        }
                                        if ($(this).hasAttr("data-post")) {
                                            sSel = $(this).attr("data-post");
                                            if (!(sTmp.trim() === "")) {
                                                if (sSel === ".") {
                                                    if (!(sTmp.endsWith("."))) {
                                                        sTmp = sTmp + sSel;
                                                    }
                                                }
                                                else {
                                                    sTmp = sTmp + " " + sSel;
                                                }
                                            }
                                        }
                                    });
                                    sParaText = sParaText + " " + sTmp.trim();
                                }

                                sParaText = sParaText.replace(/\.\./g, ".");
                                sParaText = sParaText.replace(/Хрипы нет/g, "Хрипов нет");
                            }

                            if (sParaText.trim()) {
                                sHtml = sHtml + "<p class='doc-p'>" + sParaText + "</p>";
                            }
                        }
                    }
                    $(this).find(".no-forma").find("[contenteditable]").each(function (index) {
                        if ($(this).text) {
                            sHtml = sHtml + "<div class='doc-edt'>" + $(this).html() + "</div>";
                        }
                    })
                }
                aHtml[idx].html = sHtml;

                if ($(sHtml).text().trim()) {
                    if (sCurRazdelHeader) {
                        var sHtml2 = "<p class='doc-razd'>" + sCurRazdelHeader + "</p>";
                        aHtml[idx].razdel=sHtml2;
                        sCurRazdelHeader = "";
                    }
                    var sPop=aEmptyRazdels.pop();
                    if (sPop) {
                        var sHtml3="<p class='doc-razd0'>" + sPop + "</p>";
                        aHtml[idx].razdel0=sHtml3;
                    }
                    that.aAnamnez[razdelId].html += sHtml;
                    if (that.aAnamnez[razdelId].text) {
                        that.aAnamnez[razdelId].text += "\n";
                    }
                    that.aAnamnez[razdelId].text += utils.htmlToText(sHtml,false).trim();
                }
                sHtml = "";
            }

            sHtml = "";
            for (var i = 0; i < aHtml.length; i++) {
                sHtml = sHtml + aHtml[i].razdel0+aHtml[i].razdel+aHtml[i].html;
            }
            return sHtml;
        },
        closeMe: function() {
            var that=this;
            proxy.publish("docClose",{uuid:that.uuid,content:$(that.content).html()});
        },
        initialize: function(data) {
            var that=this;
            DocBase.fn.initialize.call(this,data);
            try {
                $(this.toolbar).kendo.destroy();
            }
            catch (e) {
            }
            this.createToolbar();
            this.changeRawServerContent();
            $(this.content).find('span[contenteditable]').on("input",function(e){
                that.publishDocChanged();
            });

        }

    });
    return Doc11;
});