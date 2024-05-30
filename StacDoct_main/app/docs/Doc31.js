/**
/**
* Created by STAR_06 on 22.12.2014.
* Документ: Направление
*/
define(["kendo.all.min", "docs/DocBase", "services/proxyService", "utils", "alertify",
    "dataSources/ibDocsListDataSource", "docs/mySelObject", "rangy",'viewModels/mkbKsgChooserVm',],
    function (kendo, DocBase, proxy, utils, alertify, ibDocsDS, mySelObject, rangy,mkbKsgChooserVm) {
        var Doc31;
        Doc31 = DocBase.extend({
            dsLpu: new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 1000,
                transport: {
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_lpu_list",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "lpu_list.rows",
                    total: "records",
                    errors: "error",
                    model: {
                        fields: {
                            id: { type: "number" },
                            name: {
                                type: "string"
                            },
                            full_name: {
                                type: "string"
                            },
                            address: {
                                type: "string"
                            },
                            blank_name: {
                                type: "string"
                            }

                        }
                    }
                },
                change: function (e) {
                    //             this.parentObj.dsReadOk(e);
                },
                error: function (e) {
                    //             this.parentObj.dsReadError(e);
                }
            }),
            makeReadOnly: function(signs) {
                DocBase.fn.makeReadOnly.call(this,signs);
                try {
                    this.lpuDropDown.enable(false);
                }
                catch(ex) {

                }
                // make empty inline edits (i-edit) normal height
                $(this.content).find(".i-edit").each(function(index,el){
                    if (!($(el).text())) {
                        $(el).html("&nbsp;");
                    }
                });
            },
            onLpuChange: function (e) {
                var myBody = this.parentObj.content;
                var dataItem = this.dataItem();
                if (dataItem) {
                    this.parentObj.selectedLpu = dataItem;
                    $(myBody).find('.lpu_id').text((dataItem.id).toString());
                    $(myBody).find('.lpu_adr').text(dataItem.address);
                    try {
                        $(myBody).find('.lpu').html((dataItem.blank_name).replace(/(?:\r\n|\r|\n)/g, '<br />'));
                    }
                    catch (er) {

                    }
                }
            },
            init: function (data, uuid) {
                this.lduDropDown = null;
                this.savedDivs = null;
                this.savedSelActiveElement = null;
                this.savedSel = null;
                this.sManual = "";
                this.askId = "";
                this.isDateoutEditable = false;
                this.selectedLpu = null;

                DocBase.fn.init.call(this, uuid);
                this.docVid = 31;
                //this.dsRead.parentObj = this;
                //this.dsCreate.parentObj = this;
			    amplify.subscribe("selectedLpu", this, this.onLpuSelect);


            },
            validate: function () {
                return true;
            },
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
            onDeactivate: function () {
                // public
                //      console.log("onHide...");

                //this.saveSelection();
            },
            onActivate: function () {
                //        console.log("onActivate...");

                //this.restoreSelection();
            },
            dsReadOk: function (e) {
                kendo.ui.progress($("#ibDocs"), false);
                this.isLoaded = true;
                this.isSaved = false;
                if (e.items[0].record_id) {
                    this.recordId = e.items[0].record_id;

                }
                //        this.dsReadFiscal.parentObj=this;
                //        this.dsReadFiscal.read({ask_id:this.askId});
                //this.addToContainer(e.items[0].doc_html);
            },
            dsReadError: function (e) {
                kendo.ui.progress($("#ibDocs"), true);
                ajax_error(e);
            },
            //addToContainer: function(sHtml) {
            //    var oContainer=this.oContainer;
            //    var newIndex=oContainer.docTabStrip.items().length;
            //    var sUuid=Math.uuid(15);
            //    var toolBarId="tb_"+sUuid;
            //    var documentId="doc_"+sUuid;
            //    oContainer.docTabStrip.append([{
            //        text:"Направление "+newIndex,
            //        content:"<div id='"+toolBarId + "'></div><div class='ib-doc-div' id='"+documentId+"'>"+sHtml+"</div>"
            //    }]);
            //    this.uiContainer=new uiContainer({body:$("#"+documentId), toolBar:$("#"+toolBarId)});
            //    this.createToolbar();
            //    oContainer.addDocModel(this);
            //    this.prepareContent();
            //    this.saveContent();
            //    this.bindEditor();
            //    oContainer.docTabStrip.select("li:last");
            //    this.onContentShown();
            //    oContainer.refreshNotes();
            //},
            onContentShown: function () {
                var myObj = this;
                var myBody = this.content;
                //        $(myBody).find("div[contenteditable='true']").first().focus();
                try {
                    $(myBody).find("span.i-active").first().focus();

                }
                catch (e) {

                }

                setTimeout(function () { setDocHeight($(myObj.content)) }, 100);
            },
            bindEditor: function () {
                var selIb = proxy.getSessionObject("selectedIb");
                if (/*(selIb.rdonly) ||*/ (utils.isViewer() || this.isOldIb())) {
                    $(this.content).find("[contenteditable]").removeAttr("contenteditable");
                    $(this.content).find("span.my-sel").removeClass("my-sel");
                }
                else {
                    DocBase.fn.bindEditor.call(this);
                }
            },
            fnOnLpuChange: function (obj) {

            },
            createToolbar: function () {
                // this.dsLpu.read();
				var selIb=proxy.getSessionObject("selectedIb");
				var items=[];
				if (/*(selIb.rdonly) ||*/ (utils.isViewer()) || (selIb.is_ldo) || this.isOldIb()) {
					$(this.toolbar).kendoToolBar({
						items: [
							//if ((!selIb.rdonly) && (!utils.isViewer())) {
							//	{ type: "button", text: " Сохранить", attributes: { "class": "faa faa-download", "rel": "tooltip", "title": "Сохранить" }, showText: "overflow" },
							//}
							{ type: "button", id:"print-all-"+this.uuid, text: " Печать", attributes: { "class": "faa faa-print", "rel": "tooltip", "title": "Печать" }, showText: "overflow" },
							{ type: "separator" },
                            /*
							{
							    id:"export-all-"+this.uuid,
								type: "splitButton",
								text: "Экспорт",
								menuButtons: [
									{ text: "Adobe Reader (pdf)", attributes: { "rel": "tooltip", "title": "PDF" } }
								]
							},
							*/
							{ type: "separator" },
                            {type:"button", text:"Экспорт в формат PDF", attributes: { "class": "faa faa-file-pdf-o","rel":"tooltip","title":"Экспорт в формат PDF" }, showText: "overflow"},
                            /*
							{ template: "<label>Учреждение:</label>" },
							{
								template: "<input class='lpu-dropdown' style='width: 400px;' />",
								overflow: "never"
							},*/
							{ type: "button", text: " Закрыть", attributes: { "class": "faa faa-close pull-right", "rel": "tooltip", "title": "Закрыть" }, showText: "overflow" }
						],
						click: this.fnOnClick(this)
					});
				}
				else {
				    var items=[];
				    items.push({ type: "button", id:"save-"+this.uuid, text: " Сохранить", attributes: { "class": "faa faa-download", "rel": "tooltip", "title": "Сохранить" }, showText: "overflow" });
//                    items.push({ type: "button", text: " Подписать", attributes: { "class": "faa faa-certificate-o", "rel": "tooltip", "title": "Подписать" }, showText: "overflow" });
				    items.push({ type: "button", id:"print-all-"+this.uuid, text: " Печать", attributes: { "class": "faa faa-print", "rel": "tooltip", "title": "Печать" }, showText: "overflow" });
				    items.push(							{ type: "separator" }       );
				    /*
				    items.push(	{
                            type: "splitButton",
                            text: "Экспорт",
                            menuButtons: [
                                { text: "Adobe Reader (pdf)", attributes: { "rel": "tooltip", "title": "PDF" } }
                            ]
                        }
                    ); */
                    items.push({type:"button", text:"Экспорт в формат PDF", attributes: { "class": "faa faa-file-pdf-o","rel":"tooltip","title":"Экспорт в формат PDF" }, showText: "overflow"});

                    items.push(							{ type: "separator" }       );
                    items.push({ template: "<label>Учреждение:</label>" },
                        {   template: "<input class='lpu-dropdown' style='width: 350px;' />",
                            overflow: "never"
                        });
                    items.push(							{ type: "separator" }       );
                    if (!(selIb.is_ldo)) {
                        items.push({ type: "button", text: "Выбор МКБ", attributes: { "class": "k-button", "rel": "tooltip", "title": "Выбор МКБ" }, showText: "always" });
                    }

                    items.push({ type: "button", text: " Закрыть", attributes: { "class": "faa faa-close pull-right", "rel": "tooltip", "title": "Закрыть" }, showText: "overflow" });
					$(this.toolbar).kendoToolBar({
                        items:items,
						click: this.fnOnClick(this)
					});
					DocBase.fn.createSignCommand.call(this,this.toolbar);
					this.lpuDropDown = $(this.toolbar).find(".lpu-dropdown").first().kendoDropDownList({
						dataTextField: "name",
						dataValueField: "id",
						dataSource: this.dsLpu,
						optionLabel: "Выберите ЛПУ",
						change: this.onLpuChange
					}).data("kendoDropDownList");
					var myBody = this.content;
					this.lpuDropDown.value(Number($(myBody).find(".lpu_id").first().text()));
					this.lpuDropDown.parentObj = this;
				};
            },
            fnOnClick: function (obj) {
                var myObj = obj;
                var fnc = function (e) {
                    var btnText;
                    var btnId;
                    try {
                        btnText = $(e.target).attr("title").trim();
                    }
                    catch (e) {
                        btnText = "";
                    };
                    try {
                        btnId = $(e.target).attr("id").trim();
                    }
                    catch (e) {
                        btnId = "";
                    };
                    if (btnText=="Выбор МКБ") {
                        myObj.openMkbKsgChooser(myObj);
                    }
                    //            console.log("clicked: "+$(e.target))
                    if (btnText == "Закрыть") {
                        myObj.closeMe();
                    }
                    if (btnText == "Сохранить") {
                        myObj.saveMe();
                    }
                    if (btnText == "Печать") {

                        if (myObj.validate()) {
                            myObj.printMe();
                        }
                    }
                    if (btnText == "Экспорт в формат PDF") {
                        if (myObj.validate()) {
                            myObj.exportPDF();
                        }
                    }
                    if (btnId.startsWith("sign_btn")) {
                        if (myObj.validate()) {
                            myObj.startSignDocument(myObj,{docName:"Направление",docDescr:"Направление в другое ЛПУ",mode:myObj.signCount});
                        }
                    }
                    if (btnId.startsWith("sign_info_btn")) {
                        if (myObj.validate()) {
                            myObj.startSignDocument(myObj,{mode:myObj.signCount});
                        }
                    }
                };
                return fnc;
            },
            openMkbKsgChooser: function(e) {
                var data;
                var selIb=proxy.getSessionObject("selectedIb");
//                var otd=viewModel.get("otd");
                  var otd=selIb.otd1;
                  data={dnst:selIb.dnst,otd:otd,onlyMkb:1,callerUuid:e.uuid};
                mkbKsgChooserVm.open(data);
            },
            beforeOpenModal: function () {
                var myBody = this.uiContainer.body;
                var el = $(myBody).find("div[contenteditable='true']");
                this.savedDivs = el;
                //this.saveSelection();
                $(el).prop("contenteditable", false);
            },
            afterCloseModal: function () {
                if (this.savedDivs) {
                    $(this.savedDivs).prop("contenteditable", true);
                };
                //this.restoreSelection();
            },
            exportPDF: function () {
                //        console.log("Export to PDF");
                var myBody = this.content;
                this.unbindEditor(myBody);

                var sHtmlSave = $(myBody).html();
                this.prepareForPrint($(myBody));
                var sData = $(myBody).html();
                $.ajax({
                    url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_PDF&" +
                        "CSS=html/css/vyp-print.css;html/css/lab-print.css;html/css/ldo-print.css;html/StacDoct_main/app/css/app-print.css&" +
                        "top=10&bottom=5&left=15&right=5zoom=1.15",
                    type: "POST",
                    data: sData,
                    processData: false,
                    success: function (data, textStatus) {
                        //                console.log(data);
                        if (data.error == '') {
                            var curIb = proxy.getSessionObject("selectedIb");
                            var sFile = '' + '' + curIb.yea + '-' + curIb.niib;
                            var pom = document.getElementById('pom_pdf_downloader');
                            if (!pom) {
                                pom = document.createElement('a');
                                pom.setAttribute('id', 'pom_pdf_downloader');
                            }
                            pom.setAttribute('href', data.alink);
                            pom.setAttribute('download', sFile + '_' + curIb.fio.replaceAll(' ', '_') + ".pdf");
                            setTimeout(function () {
                                pom.click();
                            }, 2000);

                        }
                        else {
                            ajax_error({ error: data.error });
                        }
                        utils._onRequestEnd(0);
                    },
                    dataType: "json"
                });
                $(myBody).html(sHtmlSave);
                this.bindEditor($(myBody));
                this.prepareContent();
                //        this.bindDateout();
                //        afterDocLoaded(1,1);

            },
            exportXML: function () {
                //        console.log("Export to XML");
                var myObj = this;
                var myBody = this.content;
                this.unbindEditor(myBody);
                $.get("files/cda2.xsl", {}, function (data) {
                    var curIb = proxy.getSessionObject("selectedIb");;
                    var sFile = '' + '' + curIb.yea + '-' + curIb.niib;
                    var sHtml = $(myBody).html();
                    myObj.prepareForPrint($(myBody));
                    var sCda = myObj.prepareCDA();
                    $(myBody).html(sHtml);
                    myObj.bindEditor(myBody);
                    //            afterDocLoaded(1,1);

                    sCda = '<?xml version="1.0"?> <?xml-stylesheet type="text/xsl" href="' + sFile + '.xsl"?>' + sCda;
                    var zip = new JSZip();
                    var sFolder = transliterate(curIb.fio).replaceAll(' ', '_') + '-' + sFile;
                    zip.folder(sFolder);
                    zip.file(sFolder + '/' + sFile + '.xml', sCda);
                    zip.file(sFolder + '/' + sFile + '.xsl', data);
                    var content = zip.generate({ type: "blob", compression: "DEFLATE" });
                    // see FileSaver.js
                    saveAs(content, sFile + '_' + curIb.fio.replaceAll(' ', '_') + ".zip");
                }, "html");
            },
            closeMe: function () {
                var that = this;
                proxy.publish("docClose", { uuid: that.uuid, content: $(that.content).html() });
            },
            //doClose: function () {
            //    amplify.unsubscribe("selectedLpu", this.onLpuSelect);
            
            //    //ibDocsListVm.closeDocTab(this.currentTabStripIndex);
            //    //this.docTabStrip.select("li:last");
            //},
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
                        //                utils._onRequestEnd(0);
                    },
                    dataType: "json"
                });
            },
            saveParts: function (myObj) {
                var sBodyId = myObj.content.attr("id");
                var partsArray = new Array();
                partsArray.push({ sel: "#" + sBodyId + " div[rel2='vyp_001_01']", field_id: 1 });
                partsArray.push({ sel: "#" + sBodyId + " div[rel2='vyp_001_02']", field_id: 2 });
                partsArray.push({ sel: "#" + sBodyId + " div[rel2='vyp_001_03']", field_id: 3 });
                //        partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_010']", field_id:10});   // краткий анамнез
                //        partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_012']", field_id:9});    // объективный статус

                partsArray.forEach(function (el, idx, ar) {
                    var eDiv = $(el.sel);
                    if (eDiv) {
                        var sText = $(eDiv).text();
                        var sHtml = $(eDiv).html();
                        myObj.savePart(
                            myObj.recordId,
                            proxy.getSessionObject("selectedIb").ask_id,
                            el.field_id, sText, sHtml);
                    }
                });

            },
            saveMe: function () {
                var myBody = this.content;
                var myObj = this;
                this.unbindEditor(myBody);
                kendo.ui.progress($(this.toolbar), true);
                $.ajax({
                    url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc&record_id=" + this.recordId +
                        "&ask_id=" + proxy.getSessionObject("selectedIb").ask_id + "&doc_id=" + this.docVid.toString() +
                        "&user_id=" + Number(localStorage['last_user']),
                    type: "POST",
                    data: $(myBody).html(),
                    processData: false,
                    dataType: "json"
                }).always(function (e) {
                    kendo.ui.progress($(myObj.toolbar), false);
                    var data;
                    if (e.responseText) {
                        data = JSON.parse(e.responseText);
                    }
                    else {
                        data = e;
                    }
                    if (data.error) {
                        alertify.error(data.error);
                    }
                    else {
                        myObj.recordId = data.doc.rows[0].record_id;
                        myObj.isSaved = true;
                        myObj.savedContent = $(myBody).html();
                        myObj.saveParts(myObj);
                        $(myObj.content).html(myObj.savedContent);
                        utils._onRequestEnd(0);
                        proxy.publish("docSaved",{uuid:myObj.uuid,record_id:myObj.recordId});
//                        ibDocsDS.read({ ask_id: proxy.getSessionObject("selectedIb").ask_id });
                        myObj.bindEditor($(myObj.content));
                        myObj.prepareContent();
                        //                ibDocsModel.afterSaveDoc();
                    }
                })
                    ;
                this.bindEditor($(myBody));
            },
            printMe: function () {
                //        console.log("Печать");
                var myBody = this.content;
                var savedStyle=$(myBody).attr("style");
                this.unbindEditor(myBody);

                //this.saveSelection();

                var sHtml = $(myBody).html();
                this.prepareForPrint(myBody);
                DocBase.fn.makeNotSignedPrintContent.call(this,myBody);
                $(myBody).removeAttr("style");
                $(myBody).jqprint();
                $(myBody).html(sHtml);
                this.bindEditor(myBody);
                $(myBody).attr("style",savedStyle)
                this.prepareContent();
                //this.restoreSelection();

            },
            checkChanges: function () {
                var myBody = this.content;
                var rez = false;
                if ($(myBody).text() == this.savedContent) {
                    rez = true;
                    return rez;
                }
                var myObj = this;
                alertify.set({
                    labels: {
                        ok: "Продолжить редактирование",
                        cancel: "Закрыть документ"
                    }
                });
                alertify.confirm("Возможно, были изменения! Рекомендуется продолжить редактирование!", function (e) {
                    if (!e) {
                        myObj.doClose();
                    }
                });
                return rez;
            },
            prepareContent: function (that) {
                if (!that) {
                    that=this;
                }
                var myBody = that.content;
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

                //        if ($(myBody).find(".vyp-pac-dateout").first().attr("contenteditable")=="true") {
                //        }
                //        $(myBody).find(".vyp-pac-dateout").first().removeAttr("contenteditable");
            },
            saveContent: function () {
                var myBody = this.content;
                this.savedContent = $(myBody).text();
            },
            prepareForPrint: function (oDiv) {
                return;
                // формирование текста результата по форме
                var sRez = '';
                var myBody = oDiv;
                $(myBody).find("div[rel='vyp_059']").first().html(sRez);
                // избавиться от дублирования зав.отд, леч.врач
                sText1 = ""; sText2 = "";
                try {
                    sText1 = $(myBody).find("div[rel='vyp_095']").first().text().trim();
                }
                catch (e) {
                }
                try {
                    sText2 = $(myBody).find("div[rel='vyp_096']").first().text().trim();
                }
                catch (e) {
                }
                if (sText1 == sText2) {
                    $(myBody).find("td.e-2").first().html("Заведующий отделением,<br>лечащий врач");
                    $(myBody).find("tr.e-2").first().addClass("no-print");
                }
                // add no-pagebreak to small tables
                $(myBody).find("table").each(function (i) {
                    var cnt = $(this).find("tr").length;
                    if (cnt <= 3) {
                        $(this).addClass("no-pb");
                    }
                });

                // hide empty editables
                $(myBody).find("div[contenteditable]").each(function (i) {
                    if ($(this).text().trim() === "") {
                        $(this).addClass('no-print');
                        $(this).closest('.blank-zero').addClass('no-print');
                    }
                    else {
                        var sHtml = ""
                        var iVal = 0;
                        var text = $(this).text().trim();
                        $(this).removeClass('no-print');
                        $(this).closest('.blank-zero').removeClass('no-print');
                    }

                    $(this).find('p').removeAttr('style');
                    $(this).find('span').removeAttr('style');
                });
            },

            saveSelection: function () {
                // Remove markers for previously saved selection
                if (this.savedSel) {
                    rangy.removeMarkers(this.savedSel);
                }
                this.savedSel = rangy.saveSelection();
                this.savedSelActiveElement = document.activeElement;
            },
            restoreSelection: function () {
                if (this.savedSel) {
                    rangy.restoreSelection(this.savedSel, true);
                    this.savedSel = null;
                    window.setTimeout(function () {
                        if (this.savedSelActiveElement && typeof this.savedSelActiveElement.focus != "undefined") {
                            this.savedSelActiveElement.focus();
                        }
                    }, 1);
                }
            },

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
            //                doc_id: {type: "number"},
            //                doc_html: {
            //                    type: "string"
            //                }
            //            }
            //        }
            //    },
            //    change: function(e) {
            //        this.parentObj.dsReadOk(e);
            //    },
            //    error: function(e) {
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
            //                record_id: {type: "string"},
            //                doc_id: {type: "number"},
            //                doc_html: {
            //                    type: "string"
            //                }
            //            }
            //        }
            //    },
            //    change: function(e) {
            //        this.parentObj.dsReadOk(e);
            //    },
            //    error: function(e) {
            //        this.parentObj.dsReadError(e);
            //    }
            //}),

            initialize: function (data) {
                DocBase.fn.initialize.call(this, data);
                try {
                    $(this.toolbar).kendo.destroy();
                }
                catch (e) {
                }
                this.set("signCount",(data.signed || 0));
                this.set("signs",(data.signs || ""));
                this.createToolbar();
                data.items = [data];
                this.set("askId", proxy.getSessionObject("selectedIb").ask_id);
                this.dsReadOk(data);
                this.prepareContent();
                if (this.signCount) {
                    this.makeReadOnly((JSON.parse(data.signs)).signs.rows);
                }
                var that=this;
                proxy.subscribe("mkbOnlySelected",function(data) {
                    if (data.callerUuid==that.uuid) {
                        $(that.content).find(".f057-mkb-10").first().text(data.mkb);
                    }
                });
            }


        });

        return Doc31;
    });