/**
 * Created by 1 on 11.12.2015.
 */
define(["kendo.all.min","docs/DocBase", "docs/mySelObject", "services/proxyService", "services/SessionService","utils",
        "dataSources/ibDocDataSource","dataSources/allUsersDataSource",
        'dataSources/allOtdelsDataSource',
        'dataSources/allShefsDataSource',
    ],
function(kendo, DocBase, mySelObject, proxy, sessionService, utils,ibDocsDs,allUsersDs,allOtdelsDs,allShefsDs){

    var Doc70;
	
    Doc70 = DocBase.extend({

        dsGetTemplates: ibDocsDs.dsGetTemplates,
        dsGetById: ibDocsDs.dsGetById,
        init: function (data,uuid) {
            DocBase.fn.init.call(this, uuid);
            this.docVid = 70;
            this.data = data;
            this.docSub = data.subtype;
			this.surveyId = null;
			this.subType = 1;
		    this.html_link=data.html_link;
            this.html_template=data.html_template;
            this.json_template=data.json_template;
        },
        makeCopy:function(subType) {
            var that=this;
            this.dsGetTemplates.read({
                ask_id:that.selIb.ask_id,
                user_id:Number(localStorage['last_user']),
                doc_id:this.docVid,
                doc_sub:subType
            }).then(function() {
                var data=that.dsGetTemplates._data;
                that.html_link=data[0].html_link;
                that.html_template=data[0].html_template;
                that.json_template=data[0].json_template;
                that.set("subType",subType);
                that.openFormWindow("copy");
            });
        },
        showCopyDialog: function() {
            var that=this;
            that.makeCopy(1);
        },
        createToolbar: function () {
            var selIb = proxy.getSessionObject("selectedIb");
			var aTools = new Array();
			var toolbar;
			if ((!utils.isViewer()) && (!(selIb.is_ldo))) {
                if (!this.recordId) {
                    aTools.push({type: "button", text: " Создать",
                        attributes: { "class": "faa faa-file-o survey-create", "rel": "tooltip", "title": "Создать" }, showText: "both"}
                    );
                }
                else {
                    aTools.push({type: "button", text: " Изменить",
                        attributes: { "class": "faa faa-file-o survey-edit", "rel": "tooltip", "title": "Изменить" }, showText: "both"}
                    );
                    aTools.push({type: "button", text: " Создать на основании",
                        attributes: { "class": "faa faa-file-o survey-edit", "rel": "tooltip", "title": "Создать новый документ на основании текущего" }, showText: "both"}
                    );
                }
            }

			aTools.push({type:"button", text:" Печать",
				attributes: { "class": "doc-print faa faa-print","rel":"tooltip","title":"Печать" }, showText: "overflow"});
			aTools.push({type: "separator"});
            aTools.push({type:"button", text:" Экспорт Word",
                attributes: { "class": "doc-print faa faa-word","rel":"tooltip","title":"Экспорт в Word" }, showText: "overflow"});
            aTools.push({type: "separator"});

			aTools.push({type:"button", text:" Закрыть", attributes: { "class": "faa faa-close pull-right","rel":"tooltip","title":"Закрыть" }, showText: "overflow"});

			$(this.toolbar).kendoToolBar({
				items: aTools,
				click: this.fnOnClick(this)
			});
			
			toolbar = $(this.toolbar).data("kendoToolBar");
			
        },
		openFormWindow: function(mode) {
            sessionService.dummyRequest();
            var that = this;
            var url = location.origin + "/gb2/" + this.html_link;
            var patient=this.selIb;
            var title = "Дневник. " + patient.fio;
            var wndDiv = $("<div id='iframe-doc-window'></div>");
            var oUser= allUsersDs.get(Number(localStorage['last_user']));
            var openData={
                mode:mode,
                patient:patient,
                doc:{id:this.docVid,subType:this.subType,record_id:this.recordId,
                    jsonTemplate:this.json_template,htmlTemplate:this.html_template},
                user:{id:oUser.id,name:oUser.name,fio:oUser.fio,role:sessionStorage['last_user_role']},
                departments: allOtdelsDs,
                shefs: allShefsDs,
				proxy: proxy
            };
            var iInterval=setInterval(function() {
                try {
                    sessionService.dummyRequest();
                }
                catch (ex) {

                }
            },1000*15);
            var kendoWindow = $(wndDiv).kendoWindow({
                title: title,
                modal: true,
                animation: false,
                actions:[],
                iframe: true,
                content: url,
                refresh: function (e) {
                    var windowElement = $("#iframe-doc-window");
                    var iframeDomElement = windowElement.children("iframe")[0];
                    var iframeWindowObject = iframeDomElement.contentWindow;

                    var iframeDocumentObject = iframeDomElement.contentDocument;
                    // which is equivalent to
                    // var iframeDocumentObject = iframeWindowObject.document;

                    var iframejQuery = iframeWindowObject.$; // if jQuery is registered inside the iframe page, of course
                    iframejQuery("#close-button").on("click", function (e) {
                        var record_id=iframeWindowObject.saver.record_id;
                        if (record_id) {
                            clearInterval(iInterval);
                            that.dsGetById.read({record_id:record_id}).then(function(){
                                var ds=that.dsGetById;
                                if (ds._data) {
                                    if (ds._data.length) {
                                        that.recordId=ds._data[0].record_id;
                                        var myBody = that.content;
//                                        var mainDiv = $(myBody).find("div.document-div").first();
                                        var mainDiv=myBody;
                                        $(mainDiv).html(ds._data[0].doc);
                                        try {
                                            $(that.toolbar).data("kendoToolBar").destroy();
                                            kendo.destroy($(that.toolbar));
                                            $(that.toolbar).html("");
                                            that.createToolbar();
                                        }
                                        catch (e) {
                                        }
                                        proxy.publish("dnevSaved",{uuid:that.uuid,record_id:that.recordId});

                                    }
                                }
                            });
                            kendoWindow.close();
                        }
                        else {
                            kendo.confirm("Документ не сохранен! Все равно закрыть?").
                                then(function() {
                                    clearInterval(iInterval);
                                    kendoWindow.close();
                            }, function() {

                            });
                        }
                    });
                    var observable = iframeWindowObject.viewModel;
                    observable.initialize(openData);
                },
                close: function(e) {
                    var windowElement = $("#iframe-doc-window");
                    var kendoWindow=$(windowElement).data("kendoWindow");
                    kendoWindow.destroy();
                    var iframeDomElement = windowElement.children("iframe");
                    $(iframeDomElement).remove();
                    $(windowElement).remove();
                }
            }).data("kendoWindow");
            kendoWindow.open().maximize();

        },
       exportDocx: function() {
           if (!this.recordId) {
               kendo.alert("Документ не сохранен!");
               return;
           }
           var that=this;
//           var myBody = this.content;
//           this.prepareForPrint(this, this.content);

//           var sData = $(this.printable).html();
           var selIb = proxy.getSessionObject("selectedIb");

           var sData=this.recordId;
           $.ajax({
               url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_DOCX&record_id="+sData,
               type: "POST",
               data: sData,
               processData: false,
               success: function (data, textStatus) {
//                console.log(data);
                   if (data.error == '') {
                       var curIb = selIb;
                       var sFile = '' + '' + curIb.yea + '-' + curIb.niib;
                       var pom = document.getElementById('pom_pdf_downloader');
                       if (!pom) {
                           pom = document.createElement('a');
                           pom.setAttribute('id', 'pom_pdf_downloader');
                       }
                       pom.setAttribute('href', data.alink);
                       pom.setAttribute('download', sFile + '_' + curIb.fio.replaceAll(' ', '_')+'_Осмотр' + ".docx");
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
                if (btnText=="Создать") {
                    myObj.openFormWindow("create");
                }
                if (btnText=="Изменить") {
                    myObj.openFormWindow("edit");
                }
                if (btnText=="Создать новый документ на основании текущего") {
                    myObj.showCopyDialog();
                }
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
                if (btnText == "Экспорт в Word") {

                    if (myObj.validate()) {
                        myObj.exportDocx();
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
                    proxy.publish("dnevSaved",{uuid:that.uuid,record_id:that.recordId});
                    if (bClose) {
                        setTimeout(function(){
                            that.closeMe();
                        },500);
                    }
                    that.saveParts(that,bClose);
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
        publishDocChanged: function() {
            proxy.publish("dnevChanged",{uuid:this.uuid,content:$(this.content).html()});
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
                    "CSS=html/css/vyp-print.css;html/StacDoct_main/app/css/app-print.css&" +
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
        prepareForPrint: function(myBody) {
            var sHtml=$(myBody).html();
            sHtml="<div class='osmotr-print'>"+sHtml+"</div>";
            $(myBody).html(sHtml);
            $(myBody).removeAttr("style");
        },

        printMe: function () {
            //        console.log("Печать");
            var myBody = this.content;
            var savedStyle=$(myBody).attr("style");

            var sHtml = $(myBody).html();
            this.prepareForPrint(myBody);
//            DocBase.fn.makeNotSignedPrintContent.call(this,myBody);
            $(myBody).jqprint();
            $(myBody).html(sHtml);
            $(myBody).attr("style",savedStyle);
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
            proxy.publish("dnevClose",{uuid:that.uuid,content:$(that.content).html()});
        },
        initialize: function(data) {
            var that=this;
            DocBase.fn.initialize.call(this,data);
            this.saveQuestion="";
            this.changeQuestion="";
            if (data.subtype) {
                this.subType=data.subtype ;
            }
            else {
                if (data.doc_sub) {
                    this.subType=data.doc_sub;
                }
            }
            this.dsGetTemplates.read({
                ask_id:that.selIb.ask_id,
                user_id:Number(localStorage['last_user']),
                doc_id:this.docVid,
                doc_sub:this.subType
            }).then(function() {
                var data=that.dsGetTemplates._data;
                that.html_link=data[0].html_link;
                that.html_template=data[0].html_template;
                that.json_template=data[0].json_template;
                that.createToolbar();
                if (!that.recordId) {
                    that.openFormWindow();
                }
            });

            try {
                $(this.toolbar).kendo.destroy();
            }
            catch (e) {
            }

        }

    });
    return Doc70;
});