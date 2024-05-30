/**
 * Created by 1 on 11.12.2015.
 */
define(["kendo.all.min","docs/DocBase", "docs/mySelObject", "services/proxyService", "services/SessionService","utils",
        "dataSources/ibDocDataSource","dataSources/allUsersDataSource",
        'dataSources/allOtdelsDataSource',
        'dataSources/allShefsDataSource',
        'dataSources/ibFieldsDataSource',
		'dataSources/ibDocsListDataSource'
    ],
function(kendo, DocBase, mySelObject, proxy, sessionService, utils,ibDocsDs,allUsersDs,
         allOtdelsDs,allShefsDs,ibFieldsDs,ibDocsListDs){

	function Fiscal(obj) {
		if (!(this instanceof Fiscal)) return new Fiscal(obj);
		this.isxod=Number(obj.isxod);
		this.result=Number(obj.result);
		this.ksg=obj.ksg;
		this.inVyp=obj.in_vyp;
		this.otkaz=obj.otkaz;
		this.summa=obj.summa;
		this.mkb=obj.mkb;
		this.czab=Number(obj.czab); // код характера заболевания

		this.mkb_name=obj.mkb_name;
		this.mkb_vers=Number(obj.mkb_vers);
		this.ksg_name=obj.ksg_name;
		this.usl_list=obj.usl_list;

		$("#fiscal_mkb_code").text(this.mkb);
		$("#fiscal_mkb_name").text(this.mkb_name);
		$("#fiscal_mkb_vers").text(this.mkb_vers.toString());
		$("#fiscal_ksg_code").text(this.ksg);
		$("#fiscal_ksg_name").text(this.ksg_name);
		$("#fiscal_usl_list").text(this.usl_list);

		try {
			this.ksgNum = obj.ksg.substr(2);
		}
		catch (e) {

		}
		if (obj.sluch_id=="") {
			this.inVyp=0;
			this.otkaz=0;
			this.ksgNum="000";
		}
	}
	var getFssInoeName=function (sCode) {
        var ds=fssSpr.inoe;
        for (var i=0; i<ds._data.length;i++) {
            if (ds._data[i].code==sCode) {
                return ds._data[i].name;
            }
        }
        return "";
    };

    var onChange=function(e) {
	    var field=e.field;
	    if (field=="fiscal") {
	        var fiscal=this.fiscal;
	        if (fiscal) {
                var myBody = this.content;
                if (fiscal.fss_answer==2) {
                    $(myBody).find("div[rel='vyp_052']").first().text(fiscal.fss_num);
                    $(myBody).find("div[rel='vyp_053']").first().text(kendo.toString(fiscal.fss_d1,"dd.MM.yyyy") || "");
                    fss_d2_d3=$(myBody).find("div[rel='vyp_054']").first();
                    $(fss_d2_d3).text((kendo.toString(fiscal.fss_d2,"dd.MM.yyyy") || "") +
                        ((fiscal.fss_inoe) ? " ("+getFssInoeName(fiscal.fss_inoe)+")" : ""));
                    if (fiscal.fss_d3) {
                        $(fss_d2_d3).text($(fss_d2_d3).text()+ " /к труду с "+kendo.toString(fiscal.fss_d3,"dd.MM.yyyy")+"/");
                    }
                    proxy.publish("docChanged", {uuid: this.uuid, content: $(this.content).html()});
                }
            }
        }
    };

    var Doc61;
	
    Doc61 = DocBase.extend({

        dsGetTemplates: ibDocsDs.dsGetTemplates,
        dsIbFields: ibFieldsDs,
        dsGetById: ibDocsDs.dsGetById,
        init: function (data,uuid) {
            DocBase.fn.init.call(this, uuid);
            this.docVid = 61;
            this.data = data;
            this.docSub = data.subtype;
			this.surveyId = null;
			this.subType = 1;
		    this.html_link=data.html_link;
            this.html_template=data.html_template;
            this.json_template=data.json_template;
			this.cancerCheckStartDate=new Date(2019,5,20);
			this.cancerCancelledCount=0;
			this.maxCancerCancelledCount=65000;
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
            $("<div id='CopyDialog'></div>").kendoDialog({
                width:"500px",
                title: "Выбор шаблона для нового документа",
                closable:false,
                modal:true,
                content:"<p>Выберите шаблон для нового документа</p>",
                actions:[
                    {text:'Терапевтический',primary:(this.subType==1),
                    action: function(e) {
                        that.makeCopy(1);
                    }},
                    {text:"Неврологический",primary:(this.subType==2),
                    action: function(e) {
                        that.makeCopy(2);
                    }},
                    {text:"Отказ"}
                ],
                close: function(e) {
                    $("#CopyDialog").data("kendoDialog").destroy();
                }

            }).data("kendoDialog").open();
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
                    /*
                    aTools.push({type: "button", text: " Создать на основании",
                        attributes: { "class": "faa faa-file-o survey-edit", "rel": "tooltip", "title": "Создать новый документ на основании текущего" }, showText: "both"}
                    );
                    */
					aTools.push({type: "button", text: " Данные о результате лечения",
                        attributes: { "class": "faa faa-rub","rel":"tooltip", "title":"Данные о результате лечения" }, showText: "overflow"}
                    );
                }
            }

			aTools.push({type:"button", text:" Печать",
				attributes: { "class": "doc-print faa faa-print","rel":"tooltip","title":"Печать" }, showText: "overflow"});
			aTools.push({type:"button", text:" Печать диагноза",  attributes: { "class": "faa faa-tasks","rel":"tooltip","title":"Печать диагноза" }, showText: "overflow"});
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
            var title = "Посмертный эпикриз. " + patient.fio;
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
                extData: that.dsIbFields
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
                                        proxy.publish("docSaved",{uuid:that.uuid,record_id:that.recordId});

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
		printDiag: function() {
			var sText2 = $("#q-niib").text();
			var ibDia = $("#q-diagnosis3");
			var initialHtml = ibDia.html();			
			var header = '11. Диагноз заключительный клинический'+' (№ '+sText2+')    (ксг:'+this.fiscal.ksg+((this.fiscal.mkb.trim()) ? ' мкб:'+this.fiscal.mkb : '')+')';
            var sHtml = "<div class='vyp-diag-div'><div class='vyp-edt-big'>" + header + "</div>" + initialHtml + "</div>";			
			ibDia.html(sHtml);
			ibDia.jqprint();
			ibDia.html(initialHtml);
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
				if (btnText == "Данные о результате лечения") {
                    myObj.doFiscalReport()
                }
				if (btnText == "Печать диагноза") {
                    if (myObj.validate()) {
                        myObj.printDiag();
                    }
                }
            };
            return fnc;

        },
		getDateFromContent: function(sKind) {
            var myBody=this.content;
            var sD=$(myBody).find(sKind).first().text().trim();
            return kendo.parseDate(sD);
        },
		get59SendedCount: function() {
            var docsData=ibDocsListDs.data();
            var cnt59=0;
            for (var i=0; i<docsData.length;i++) {
                if (docsData[i].doc_id==59) {
                    if (docsData[i].ext3) {
                        cnt59=cnt59+1;
                    }
                }
            }
            return cnt59;
        },
        get59Count: function() {
            var docsData=ibDocsListDs.data();
            var cnt59=0;
            for (var i=0; i<docsData.length;i++) {
                if (docsData[i].doc_id==59) {
                    cnt59=cnt59+1;
                }
            }
            return cnt59;
        },
        validate: function () {
			
			//РАК
			var myBody = this.content;
			var dD2=this.getDateFromContent("#q-date");
			if (dD2>=this.cancerCheckStartDate) {
                var selIb=proxy.getSessionObject("selectedIb");
                var cancerSendedCount=this.get59SendedCount();
                var cancerCount=this.get59Count();
                var sMsg="";
                if ((!cancerCount) || (!cancerSendedCount)) {
                    // проверка на рак в МКБ диагноза
                    var sCancerMkb=utils.isMkbCancer(this.fiscal.mkb);
                    if (sCancerMkb || selIb.cancer_num) {
                        if (!cancerCount) {
                            sMsg="<div style='text-align:center;font-weight:bold;margin-bottom:10px'>";
                            if (!cancerCount) {
                                if (selIb.cancer_num) {
                                    sMsg=sMsg+"Пациент зарегистрирован в краевом Cancer-регистре!<br>";
                                    sMsg=sMsg+"Необходимо сформировать онко-документацию!"+
                                        "<hr>Сформировать онко-документацию сейчас?</div>";
                                }
                                else {
                                    sMsg=sMsg+"Код МКБ "+sCancerMkb+" в результате лечения сигнализирует об онко-заболевании!<br>";
                                    sMsg=sMsg+"Необходимо сформировать онко-документацию!"+
                                        "<hr>Сформировать онко-документацию сейчас?</div>";
                                }
                            }
                        }
                        else {  // !cancerSendedCount
                            sMsg="<div style='text-align:center;font-weight:bold;margin-bottom:10px'>";
                            sMsg=sMsg+"Онко-документация сформирована, но не отправлена в онко-диспансер!<br>";
                            sMsg=sMsg+"Необходимо отправить онко-документацию в онко-диспансер!"+
                                "<hr>Перейти к онко-документации чтобы вы выполнили отправку?</div>";
                        }
                            kendo.confirm(sMsg).then(function(){
                                var selIb = proxy.getSessionObject("selectedIb");
                                var oSuffix={goto:"ib-docs","doc_id":59,"doc_sub":1};
                                //                            proxy.publish("navigateCommand","#/ib-docs/"+selIb.ask_id+"/"+JSON.stringify(oSuffix));
                                window.location.href=
                                    window.location.origin+window.location.pathname+window.location.search+
                                    "#/"+"ib-docs"+"/" + selIb.ask_id+"/"+JSON.stringify(oSuffix);
                        });

                        return false;
                    }
                    // проверка на stop слова онкологии
                    var aCancer=[];
                    var aCancerDiaTypes=["Заключительный клинический диагноз"];
                    var sMsg2="";
					
					var el=$(myBody).find("#q-diagnosis3");
					if (el) {
						if (el.length) {
							var sText=utils.htmlToText($(el)[0],true);
							var sFoundedCancer=utils.findCancer(sText);
							if (sFoundedCancer) {
								aCancer.push({dType:aCancerDiaTypes[0],foundedCancer:sFoundedCancer});
								sMsg2=sMsg2+aCancerDiaTypes[0]+":";
								sMsg2=sMsg2+sText+'\n';
								sMsg2=sMsg2+"Стоп слово: "+sFoundedCancer+"\n";
							}
						}
					}
                    
                    if (aCancer.length )  {
//                    if (aCancer.length && (this.cancerCancelledCount<=this.maxCancerCancelledCount))  {
                        sMsg = "<div style='text-align:center;font-weight:bold;margin-bottom:10px'>";
                        if (!cancerCount) {

                            sMsg=sMsg+"Найдены сигнальные слова онкологического диагноза!<br>Необходимо сформировать онко-документацию!" + "</div>";
                            for (var i = 0; i < aCancer.length; i++) {

                                sMsg = sMsg + "<div>" + aCancer[i].dType + "&nbsp;&nbsp;<span style='font-weight:bold'>" + aCancer[i].foundedCancer + "</span></div>";
                            }
                            sMsg = sMsg + "<hr><div style='text-align:center;font-weight:bold'>Сформировать онко-документацию сейчас?</div>";
//                            sMsg = sMsg + "<div style='font-style:italic;font-weight:normal'>" +
//                                "В случае троекратного отказа документ будет напечатан, но Ваш отказ будет зафиксирован в системном журнале</div>";
                        }
                        else {  // !cancerSendedCount
                            sMsg=sMsg+"Онко-документация сформирована, но не отправлена в онко-диспансер!<br>";
                            sMsg=sMsg+"Необходимо отправить онко-документацию в онко-диспансер!"+
                                "<hr>Перейти к онко-документации чтобы вы выполнили отправку?</div>";
                        }
                        var that=this;
                        kendo.confirm(sMsg).then(function(){
                            var selIb = proxy.getSessionObject("selectedIb");
                            var oSuffix={goto:"ib-docs","doc_id":59,"doc_sub":1};
//                            proxy.publish("navigateCommand","#/ib-docs/"+selIb.ask_id+"/"+JSON.stringify(oSuffix));
                            window.location.href=
                                window.location.origin+window.location.pathname+window.location.search+
                                "#/"+"ib-docs"+"/" + selIb.ask_id+"/"+JSON.stringify(oSuffix);
                        }, function() {
                            if (cancerCount) {
                                return;
                            }
                            that.set("cancerCancelledCount",that.get("cancerCancelledCount")+1);
                            if (that.get("cancerCancelledCount")>that.maxCancerCancelledCount) {
                                that.tryPrintMe(false);
                                var selIb = proxy.getSessionObject("selectedIb");
                                var model=new SysEventsModel();
                                model.set("event_id",59);
                                model.set("user_id",Number(localStorage['last_user']));
                                model.set("ask_id",selIb.ask_id);
                                model.set("ext1",sMsg2);
                                sysEventsDs.add(model);
                                sysEventsDs.sync();
                            }
                        });
                        return false;
                    }
                }
            }
			
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
		doFiscalReport: function(bForceReadFss) {
            var that=this;
            var selIb = proxy.getSessionObject("selectedIb");

			var dateAsk = kendo.parseDate(selIb.date_ask);
			var dateOut = kendo.parseDate(selIb.date_out);
            //var dateAsk=kendo.parseDate($(that.content).find(".vyp-pac-dateask").text().trim(),"dd.MM.yyyy");
            //var dateOut=kendo.parseDate($(that.content).find(".vyp-pac-dateout").text().trim(),"dd.MM.yyyy");
            var otd=that.data.ext1;
            if (!otd) {
                if (that.fiscal) {
                    otd=that.fiscal.otd || "";
                }
            }
            proxy.publish("openFiscal",{uuid:this.uuid,fiscal:that.fiscal,date_ask:dateAsk,date_out:dateOut,
                otd:otd,perevod:that.data.ext2,forceReadFss:bForceReadFss});
        },
		changeDateOut: function(data) {
            
        },
		isFiscalComplete: function() {
            if (!this.fiscal) {
                return false;
            }
            if (!(this.fiscal.isxod)) {
                return false;
            }
            if ((this.fiscal.isxod!=103)) {
                // не умер
                if (!(this.fiscal.result)) {
                    return false;
                }
            }
            if (this.fiscal.ksg=="") {
                return false;
            }
            if (this.fiscal.ksg=="000") {
                return false;
            }
            /*
            if (this.fiscal.otkaz) {
                return true;
            }
            if (this.fiscal.summa>0) {
                return true;
            }
            */
            return true;
        },
        fiscalError: function() {
            alertify.error("Справка о результате лечения не заполнена или заполнена не полностью!");
        },
		dsReadFiscal: new kendo.data.DataSource({
		    serverPaging: false,
			serverSorting: false,
			pageSize: 15,
			transport: {
				read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_fiscal",
				dataType: "json"
			},
			requestEnd: utils._onRequestEnd,
			schema: {
				data: "fiscal.rows",
				total: "records",
				errors: "error",
				model: {
					fields: {
						sluch_id: {type: "string"},
						isxod: {type: "number"},
						result: {type: "number"},
						ksg: {type: "string"},
						in_vyp: {type: "number"},
						otkaz: {type:"number"},
						summa: {type: "number"},
						mkb: {type:"string"},
						mkb_name:{type:"string"},
						mkb_vers: {type:"number"},
						ksg_name:{type:"string"}
					}
				}
			},
			change: function(e) {
				this.parentObj.fiscal=new Fiscal(e.items[0]);
				if (!(this.parentObj.recordId)) {
					// auto-open Fiscal
	//                this.parentObj.doFiscalReport();
				}
			},
			error: function(e) {
	//            this.parentObj.dsReadError(e);
			}
		}),
        closeMe: function() {
            var that=this;
            proxy.publish("docClose",{uuid:that.uuid,content:$(that.content).html()});
        },
        initialize: function(data) {
            var that=this;
            DocBase.fn.initialize.call(this,data);
//            if (!this.html_link) {
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
                    that.dsIbFields.read({ask_id:that.selIb.ask_id}).then(function(){
                        that.openFormWindow();
                    });
                }
            });
//            }

            try {
                $(this.toolbar).kendo.destroy();
            }
            catch (e) {
            }

        }

    });
    return Doc61;
});