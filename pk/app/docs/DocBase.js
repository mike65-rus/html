/**
 * Created by 1 on 09.12.2015.
 */
define(["kendo.all.min","services/proxyService","services/SessionService",
        "viewModels/dictofon","viewModels/autoCompleteDialog",
        "viewModels/userNotebookDialog",
        "utils",'services/cadesService',"amplify"],
    function(kendo,proxy,sessionService,dictofon,auto,note,utils,cadesService,amplify) {
    "use strict";
    var    findFieldGroup= function(pageGroup,fieldGroups) {
        for (var i=0;i<fieldGroups.length;i++) {
            var fGroup=fieldGroups[i];
            if (fGroup.id==pageGroup) {
                return fGroup;
            }
        }
    };
//    var DocBase=kendo.Class.extend({
    var DocBase=kendo.data.ObservableObject.extend({
        createDoc: function (askId, userId, recordId) {
            // public
        },
        makeNotSignedPrintContent(printContent) {
//            return;
            if (!this.signCount && cadesService.canSign()) {
//                $(printContent).find("div[contenteditable='true']").css("text-decoration", "line-through");
                var sDraft="<br>Черновик<br>";
                // <br/>Черновик<br/>Черновик";
                var sHtml=$(printContent).html();
                var sBgHtml='<div class="not-signed-background"> <p class="not-signed-background-text">'+sDraft.toUpperCase()+'</p></div>'
                sHtml='<div class="print-content"'+sHtml+"</div";
                $(printContent).html(sBgHtml+sHtml);
            }
        },
        canSign: function() {
            if (this.recordId && cadesService.canSign()) {
                return true;
            }
            return false;
        },
        getSignersTitle: function(signs) {
            var sRet="";
            var sTime="";
            var aTitles=[];
            for (var i=0;i<signs.length;i++) {
                var oSign=signs[i];
                sTime=kendo.toString(kendo.parseDate(oSign.sign_ts),"dd.MM.yy HH:mm");
                aTitles.push(oSign.uname.fio()+"- "+sTime);
            }
            if (!aTitles.length) {
                sRet="Документ подписан";
            }
            else {
                sRet=aTitles.join("; ");
            }
            return sRet;
        },
        makeReadOnly: function(signs) {
            var body=$(this.content);
            $(body).find("div[contenteditable='true']").attr("contenteditable",'false');
            $(body).find("span[contenteditable='true']").attr("contenteditable",'false');
            var toolbarContainer=this.toolbar;
            if(toolbarContainer) {
                var toolbar=$(toolbarContainer).data("kendoToolBar");
                if (toolbar) {
                    var items=toolbar.options.items;
                    for (var i=0;i<items.length;i++) {
                        var item=items[i];
                        var id=(item.id || "");
                        if ((id.toLowerCase().indexOf("-all-"))<0) {
                            toolbar.enable($("#"+id),false);
                        }
                    }
                }
            }
        },
        onDocumentSigned:function(data) {
            var signs=data.signs;
            var that=data.that;
            if (data.signs.length) {
                that.makeReadOnly(signs);
            }
//            console.log(signs);
            that.createSignCommand(that.toolbar);
        },
        onSignExecuted: function(data) {
            if (data && data.dataUid) {
                if (!(data.dataUid==this.uuid)) {
                    return true;
                }
            }
            try {
                amplify.unsubscribe("signExecuted", this.onSignExecuted);
            }
            catch (ex) {

            }
            if (data.exit) {
                return true;
            }
            if (data.error) {
                kendo.alert(data.error);
            }
            else {
                var that=this;
                $.ajax({
                    url:"default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc_sign",
                    type: "POST",
                    data: $.extend({ "record_id": this.recordId,
                            "signTime":kendo.stringify(data.signingTime,"yyyy-MM-dd hh:mm:ss") },
                        data),
                    dataType: "json",
                    success: function(data,textStatus) {
                        if (data.error) {
                            kendo.alert(data.error);
                        }
                        else {
                            that.set("signs",JSON.stringify({signs:{rows:data.signs.rows}}));
                            that.set("signCount",data.signs.rows.length);
                            if (data.signs) {
                                var aSigns=data.signs.rows;
                                if (aSigns.length)  {
                                    // subscribed in ibDocsListVm.js
                                    proxy.publish("documentSigned",{record_id:that.recordId,signs:aSigns});
                                }
                            }
                        }
                    }
                });
            }
        },
        startSignDocument: function(that,data) {
            if (! that.canSign()) {
                return;
            }
            if (!data) {
                return;
            }
            var dataToSign="";
            this.dsGetDataToSign.read({record_id:that.recordId}).
                then(function() {
                if (that.dsGetDataToSign._data) {
                    dataToSign = that.dsGetDataToSign._data[0].hash;
                    var signData={
                        dataToSign:dataToSign,
                        dataUid: that.uuid,
                        silent:false,
                        attributes:data,
                        test:false,
                        mode: data.mode,
                        signs:that.signs
                    };
                    amplify.subscribe("signExecuted",that,that.onSignExecuted);
                    cadesService.startSign(signData);
                }
                else {
                    kendo.alert("Ошибка получения хэша подписываемых данных!");
                }
            });

        },
        createSignCommand: function (toolbarContainer,iMode) {
            if (!toolbarContainer) {
                return;
            }
            var toolbar=$(toolbarContainer).data("kendoToolBar");
            if (!toolbar) {
                return;
            }
            var item;
            if (!($(toolbarContainer).find("#sign_info_btn").length)) {
                item = {
                    type: "button", id: "sign_info_btn", text: " Подписи",
                    attributes: {"class": "signature-image", "rel": "tooltip", "title": "Подписи"}, showText: "overflow"
                };
                toolbar.add(item);
            }
            if (!($(toolbarContainer).find("#sign_btn").length)) {
                item = {
                    id: "sign_btn",
                    type: "button",
                    text: "Подписать",
                    attributes: {"rel": "tooltip", "title": "Подписать документ"},
                    showText: "always"
                };
                toolbar.add(item);
            }
            if (!this.signCount) {
                toolbar.show($("#sign_btn"));
                toolbar.hide($("#sign_info_btn"));
            }
            else {
                toolbar.hide($("#sign_btn"));
                toolbar.show($("#sign_info_btn"));
            }
            if (! this.canSign() ) {
                toolbar.hide($("#sign_btn"));
                return;
            }
            if (! this.signs ) {
                toolbar.hide($("#sign_btn"));
                return;
            }
            var aSigns=this.signs.rows;
            var sTitle=this.getSignersTitle(aSigns);
            $(toolbarContainer).find("#sign_info_btn").attr("title",sTitle);
        },
        onDeactivate: function (uuid) {
                // console.log("onDeactivate event fired for uid=" + this.uuid+" docVid="+this.docVid.toString());
        },
        resizeDivs:function() {
            var height=utils.getAvailableHeight()-57-50+20;
            var mainDiv=$(this.mainHolder);
//                .parent("div");
            $(mainDiv).css("height",height.toString()+"px");
            $(mainDiv).css("overflow-y","hidden");
            $(mainDiv).resize();
            var contentHeight=height-($(this.toolbar).height());
            $(this.content).css("height",(contentHeight-5).toString()+"px");

        },
        onActivate: function (uuid) {
               // console.log("onActivate event fired for uid="+this.uuid+" docVid="+this.docVid.toString());
//                this.resizeDivs();
        },
        // utility functions
        translateElToCDA: function (el_jquery) {
            var el = null;
            try {
                el = $(el_jquery).get(0);
            }
            catch (e) {
                console.log($(el_jquery));
            }
            if (!el) {
                return "";
            }

            var endTag = null;
            var xmlText = "";
            var rSpan = 1;
            var cSpan = 1;
            var sWidth = '';

            switch (el.tagName) {
                case "SPAN":
                case "STRONG":
                case "EM":
                    if (el.childNodes.length === 0) break;
                    xmlText = "<content>";
                    endTag = "</content>";
                    break;
                case "DIV":
                    if (el.childNodes.length === 0) break;
                    if ($(el).hasClass("no-print")) break;
                    xmlText = "";
                    endTag = "";
                    break;
                case "P":
                    if (el.childNodes.length === 0) break;
                    if ($(el).hasClass("no-print")) break;
                    xmlText = "<paragraph>";
                    endTag = "</paragraph>";
                    break;
                case "OL":
                    if (el.childNodes.length === 0) break;
                    xmlText = "<list listType=\"ordered\">";
                    endTag = "</list>";
                    break;
                case "UL":
                    if (el.childNodes.length === 0) break;
                    xmlText = "<list>";
                    endTag = "</list>";
                    break;
                case "LI":
                    xmlText = "<item>";
                    endTag = "</item>";
                    break;
                case "SELECT":
                    xmlText = el.value;
                    break;
                case "BR":
                    xmlText = "<br />";
                    break;
                case "TABLE":
                    xmlText = '<table border="1">';
                    endTag = "</table>";
                    break;
                case "COLGROUP":
                    xmlText = "<colgroup>";
                    endTag = "</colgroup>";
                    break;
                case "COL":

                    if ($(el).hasAttr("width")) {
                        sWidth = $(el).attr("width");
                    }
                    xmlText = '<col';
                    if (!(sWidth === '')) {
                        xmlText = xmlText + ' width="' + sWidth + '"';
                    }
                    xmlText = xmlText + '>';
                    endTag = "</col>";
                    break;
                case "TBODY":
                    xmlText = "<tbody>";
                    endTag = "</tbody>";
                    break;
                case "TR":
                    xmlText = "<tr>";
                    endTag = "</tr>";
                    break;
                case "TD":
                    if ($(el).hasAttr("colspan")) {
                        cSpan = $(el).attr("colspan");
                    }
                    if ($(el).hasAttr("rowspan")) {
                        rSpan = $(el).attr("rowspan");
                    }
                    xmlText = '<td';
                    if (!(cSpan === 1)) {
                        xmlText = xmlText + ' colspan="' + cSpan + '"';
                    }
                    if (!(rSpan === 1)) {
                        xmlText = xmlText + ' rowspan="' + rSpan + '"';
                    }
                    xmlText = xmlText + '>';
                    endTag = "</td>";
                    break;
                default:
                    switch (el.nodeName) {
                        case "#text":
                        case "text":
                            xmlText += escapeXml(el.nodeValue);
                            break;
                        default:
                            console.log(el.nodeName)
                    }
            }

            if (endTag !== null) {
                for (var i = 0; i < el.childNodes.length; i++) {
                    xmlText += this.translateElToCDA(el.childNodes[i])
                }
            }

            if (endTag !== null) {
                xmlText += endTag;
            }
            xmlText = xmlText.replace(/&nbsp;/igm, '&#160;');
            return xmlText;
        },
        shortDateToCDA: function (sShort) {
            var sRez = '';
            var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
            sRez = sShort.replace(pattern, '$3$2$1');
            return sRez;
        },
        dateToCDA: function (date) {
            return this.dateToYMD(date).replaceAll('-', '');
        },
        dateToYMD: function (date) {
            var d = date.getDate();
            var m = date.getMonth() + 1;
            var y = date.getFullYear();
            return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
        },
        init: function (uuid) {
            // public
            this.uuid = uuid;
            this.docVid= 0;
            this.docSub=0;
            this.isLoaded= false;
            this.isSaved= false;
            this.savedContent= '';
            this.recordId='';
            this.changeCount=0;
            this.mainHolder=$("#"+this.uuid);
            this.toolbar=$(this.mainHolder).find(".doc-toolbar").first();
            this.content=$(this.mainHolder).find(".doc-content").first();
            this.printable=$(this.mainHolder).find("div.printable").first();
            this.currentEditor=null;
            this.selIb=null;
            this.signCount=0;
            this.signs="";
            this.caseId="";
            kendo.data.ObservableObject.fn.init.call(this);

        },
        initialize: function(data) {
            var that=this;
            if (data.record_id!==undefined) {
                this.recordId = data.record_id;
            }
            else {
                this.recordId="";
            }
            if (data.case_id) {
                this.caseId=data.case_id;
            }
            this.selectedPatient=data.selectedPatient;
            this.changeQuestion="Документ был изменен! Сохранить изменения?";
            this.saveQuestion="Этот документ не был сохранен! Сохранить сейчас?";
            this.mainHolder = $("#" + this.uuid);
            this.toolbar = $(this.mainHolder).find(".doc-toolbar").first();
            this.content = $(this.mainHolder).find(".doc-content").first();
            /*
            this.selIb=proxy.getSessionObject("selectedIb");
            this.dsGetDataToSign= new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 1000,
                transport: {
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_doc_hash",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "hash.rows",
                    total: "records",
                    errors: "error",
                    fields: {
                        hash: {type:"string"}
                    }
                }
            });
            this.dsSaveSign= new kendo.data.DataSource({
                serverPaging: false,
                serverSorting: false,
                pageSize: 1000,
                transport: {
                    type:"POST",
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc_sign",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                },
                parameterMap: function(data,type) {
                    return JSON.stringify(data);
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "sign.rows",
                    total: "records",
                    errors: "error",
                    fields: {
                        hash: {type:"string"}
                    }
                }
            });
            */
//            $(this.content).find('[contenteditable]').on("input",this.onChange=function(){
//                proxy.publish("docChanged",{uuid:that.uuid,content:$(that.content).html()});
//            });
            this.bindEditor();
        },
        saveMe: function() {
            this.changeCount=0;
        },
        storeCurrentEditor: function(editor) {
            this.currentEditor=editor;
        },
        sendDocChanged:function(editor,sEventType) {
            proxy.publish("docChanged",{uuid:this.uuid,content:$(this.content).html()});
            if (sEventType==="change") {
                sessionService.dummyRequest();
            }
        },
        setSpeechResult:function(data) {
            if (data.subscriberId && (data.subscriberId==this.uuid)) {
                var editor=this.currentEditor;
                if (editor) {
                    if (data.dialogResult) {
                        $(editor.body).html(data.result.trim());
                        editor.update();
                        editor.focus();
                        setTimeout(function() {
                            utils.setEndOfContenteditable(editor.body);
                        },50);
                        this.sendDocChanged(editor,"change");
                    }
                    else {
                        editor.focus();
                    }
                }
            }
        },
        setAutoCompleteResult: function(data){
            var editor=this.currentEditor;
            if (editor) {
                if (data) {
                    editor.selectRange(this.selRange);
                    editor.paste(data);
                    editor.update();
                    this.selRange=(editor.getSelection().getRangeAt(0)).cloneRange();
                }
                var that=this;
                setTimeout(function() {
                    $(editor.body).focus();
                    editor.selectRange(that.selRange);
                },100);
            }
        },
        openDictofon: function(editor) {
            this.storeCurrentEditor(editor);
            dictofon.open({html:$(editor.body).html(),subscriberId:this.uuid});
        },
        openAutoComplete: function(editor) {
           var sText = utils.getSearchWord().trim();
//            var sText="";
            if (sText) {
//                console.log(sText);
            }
            this.selRange=(editor.getSelection().getRangeAt(0)).cloneRange();
            var part=$(editor.body).attr("rel");
            var doc_vid=this.docVid;
            auto.open({doc_vid:doc_vid,doc_part:part,text:sText});
        },
        openBlockNote: function(editor) {
            var selectedContents="";
            this.selRange=(editor.getSelection().getRangeAt(0)).cloneRange();
            if (this.selRange) {
                var clonedContents=this.selRange.cloneContents();
                var div=document.createElement('div');
                div.appendChild(clonedContents);
                selectedContents=div.innerHTML;
            }
            if (!selectedContents.trim()) {
                selectedContents=$(editor.body).html();
            }
            var part=$(editor.body).attr("rel");
            var doc_vid=this.docVid;
            $(editor.body).trigger("blur");
            note.open({uuid:this.uuid,doc_vid:doc_vid,doc_part:part,
                note:utils.removeClasses(utils.removeInlineStyles(selectedContents))});
            this.storeCurrentEditor(editor);
        },
        execUndoRedo: function(editor,sUndoRedo) {
            try {
                editor.exec(sUndoRedo);
            }
            catch (e) {

            }
        },
        setNote: function(data) {
            var editor=this.currentEditor;
            editor.focus();
            if (data.add) {
                setTimeout(function(){
                    editor.paste(data.html);
                },50);
            }
            else {
                $(editor.body).html(data.html);
                utils.setEndOfContenteditable(editor.body);
                editor.update();
            }
            $(editor.body).trigger("focus");
            try {
                editor.focus();
            }
            catch (ex) {

            }
        },
        bindEditor: function() {
            var that=this;
            $(this.content).find('div[contenteditable="true"]').kendoEditor(
                { tools:[
                    {
                        name: "autoCompleteText",
                        tooltip: "Поиск в блокноте <F4>",
                        exec: function(e) {
                            that.openAutoComplete($(this).data("kendoEditor"));
                        }
                    },
                    {
                        name: "blockNote",
                        tooltip: "Блокнот <F9>",
                        exec: function(e) {
                            that.openBlockNote($(this).data("kendoEditor"));
                        }
                    },
                    {
                        name: "speaker",
                        tooltip: "Диктофон <F8>",
                        exec: function(e) {
                            that.openDictofon($(this).data("kendoEditor"));
                        }
                    },
                    "bold",
                    "italic",
                    "underline",
                    "insertUnorderedList",
                    "insertOrderedList",
                    "subscript",
                    "superscript",
                    {
                        name:"unda",
                        tooltip:"Оменить действие",
                        exec: function(e) {
                            that.execUndoRedo($(this).data("kendoEditor"),"undo");
                        }
                    },
                    {
                        name:"reda",
                        tooltip:"Вернуть действие",
                        exec: function(e) {
                            that.execUndoRedo($(this).data("kendoEditor"),"redo");
                        }
                    }
                    /*
                    {
                        name: "pageBreak",
                        tooltip: "Вставить разрыв страницы",
                        exec: function(e) {
                            var editor = $(this).data("kendoEditor");
                            editor.exec("inserthtml", { value: "<div class='page-break-p'></div>" });
                        }
                    }
                    */
                ],
                    change: function(e) {
                        that.storeCurrentEditor(e.sender);
                        that.sendDocChanged(e.sender,"change");
                    },

                    execute: function(e) {
                        var aCustom=["speaker","blockNote","autoCompleteText"];
                        that.storeCurrentEditor(e.sender);
                        if (aCustom.indexOf(e.name)<0) {
                            that.sendDocChanged(e.sender,"execute");
                        }
                        console.log("executing command", e.name, e.value);
                    },

                    paste: function(e) {
                        that.storeCurrentEditor(e.sender);
                        that.sendDocChanged(e.sender,"paste");
                        if (e.html) {
//                            console.log(e.html);
                            var sHtml=utils.removeClasses(utils.removeInlineStyles(e.html));
                            e.html=sHtml;
                        }
                    },
                    keyup: function(e) {
                        var editor=$(e.target).data("kendoEditor");
                        switch (e.keyCode) {
                            case  KeyEvent.DOM_VK_F8: {
                                // F8 -диктофон
                                setTimeout(function() {
                                    that.openDictofon(editor);
                                },50);
                                e.preventDefault();
                                break;
                            }
                            case KeyEvent.DOM_VK_F4:  {
                                // F4 - поиск в объединенном блокноте
                                setTimeout(function() {
                                    that.openAutoComplete(editor);
                                },50);
                                e.preventDefault();
                                break;
                            }
                            case KeyEvent.DOM_VK_F9:  {
                                // F9 - блокнот пользователя
                                setTimeout(function() {
                                    that.openBlockNote(editor);
                                },50);
                                e.preventDefault();
                                break;
                            }
                            default: {

                            }
                        }

                    }

                }
            );
            $(this.content).find('div[contenteditable="true"]').on("focus",function(e) {
                that.currentEditor= $(e.target).data("kendoEditor");
            });

        },
        unbindEditor: function() {
            $(this.content).find("div[contenteditable='true']").each(function(i){
                var editor=$(this).data("kendoEditor");
                if (editor) {
//                    editor.unbind();
                    editor.destroy();   // !!!
                }
                $(this).removeClass("k-widget k-editor k-editor-inline");
                $(this).removeAttr("data-role");
            });
        },
        createDataSet: function() {
            if (this.get("ds")===undefined)  {
                this.set("ds",{})
            }
        },
        createDataSets: function() {
            var ds=this.docInfo.dataSources;
            this.createDataSet();
            for (var i=0;i<ds.length;i++) {
                var dsId=ds[i].id;
                if (this.get("ds."+dsId)===undefined) {
                    this.set("ds." + dsId, ds[i].values);
                }
            }
        },
        setFieldLabel: function(fld) {
            if (this.get("labels")===undefined)  {
                this.set("labels",{})
            }
            var valId=fld.id;
            var valLabel=fld.label;
            if (valLabel && (this.get("labels."+valId)===undefined)) {
                this.set("labels."+valId,valLabel);
            }
            return "labels."+valId;
        },
        setFieldValue: function(fld) {
            if (this.get("values")===undefined)  {
                this.set("values",{})
            }
            var valId=fld.id;
            var valType=fld.type;
            var valValue="";
            if (this.get("values."+valId)===undefined) {
                if (valType=="number") {
                    valValue=0;
                }
                if (valType=="date") {
                    valValue=null;
                }
                if (fld.defaultValueEval) {
                    valValue=eval(fld.defaultValueEval);
                }
                if (fld.defaultValueOrder) {
                    valValue=this.get(fld.dataSource)[fld.defaultValueOrder-1];
                }
                this.set("values."+valId,valValue);
            }
            return "values."+valId;
        },
        genRenderer: function(fld,valueId) {
            var sRet="";
            var sRenderAs=fld.renderAs;
            if ((!sRenderAs) || (sRenderAs=="text")) {
                sRet=sRet+"<input class='k-textbox doc-form-textbox' ";
                sRet=sRet+"data-bind={value:"+valueId+"}";
                sRet=sRet+"/>";

            }
            if (sRenderAs==="smallTextArea") {
//                sRet=sRet+"<textarea rows='1' cols='45' data-role='editor' data-bind='value:"+valueId+"'></textarea>";
                sRet=sRet+"<textarea class='doc-small-textarea' rows='1' cols='80' data-bind='value:"+valueId+"'></textarea>";
            }
            if (sRenderAs==="multiText") {
                sRet=sRet+"<textarea class='no-my-classes' data-role='editor' "+
                    " data-bind='value:"+valueId+"'"+
                    "data-tools=\"['bold',\n" +
                    "                                   'italic',\n" +
                    "                                   'underline']\""+
                    "></textarea>";
//                " data-tools=['bold',italic','underline'] "+
            }

            if (sRenderAs=="date") {
                sRet=sRet+"<input  data-role='datepicker' data-bind='value:"+valueId+"' data-date-input='true' max='new Date()'/>";

            }
            if (sRenderAs=="select") {
                sRet=sRet+"<input style='width:250px;' data-role='dropdownlist' data-bind='source:"+fld.dataSource+",value:"+valueId+"'/>";
            }
            if (!sRet) {
                fld.renderAs="text";
                sRet=this.genRenderer(fld,valueId);
            }
            return sRet;
        },
        generateFieldGroupHtml:function(fGroup,iLevel) {
            var sRet="";
            var aEndTags=[];
            if (fGroup.title) {
                sRet=sRet+"<ul class='doc-form-ul'><span class='doc-form-title'>"+fGroup.title+"</span>";
                aEndTags.push("</ul>");
            }
            if (fGroup.hasSubGroups) {
                for (var i=0;i<fGroup.fields.length;i++) {
                    sRet=sRet+this.generateFieldGroupHtml(fGroup.fields[i].group,iLevel+1);
                }
            }
            else {
                var isInline=fGroup.displayFieldsInline || iLevel;
                if (isInline) {
                    sRet=sRet+"<li>";
                    aEndTags.push("</li>");
                }
                for (var i=0;i<fGroup.fields.length;i++) {
                    if (! (isInline)) {
                        sRet = sRet + "<li>";
                    }
                    var fld=fGroup.fields[i];
                    var valueId=this.setFieldValue(fld);
                    var labelId="";
                    var bLabel=(fld.label) || (fld.renderAs=="smallTextArea");
                    if (fld.label) {
                        labelId=this.setFieldLabel(fld);
                        sRet=sRet+"<label class='doc-form-inline-label'>";
                        sRet=sRet+"<span data-bind=text:"+labelId+"></span>";
                    }
                    else {
                        if (fld.renderAs=="smallTextArea") {
                            sRet=sRet+"<label class='doc-form-inline-label'>";
                            sRet=sRet+"<span>&nbsp;</span>";
                        }
                    }
                    sRet=sRet+this.genRenderer(fld,valueId);
                    if (bLabel) {
                        sRet=sRet+"</label>";
                    }
                    if (! (isInline)) {
                        sRet = sRet + "</li>";
                    }
                }
            }
            while (aEndTags.length) {
                sRet=sRet+aEndTags.pop();
            }
            return sRet;
        },
        generatePageHtml: function() {
            this.set("ds",this.get("ds") || {});
            var sRet="";
            var page=this.currentPage;
            var meta=this.docInfo.meta;
            var pageGroups=page.fieldGroups;
            var fieldGroups=this.docInfo.fieldGroups;
            sRet="<div class='k-block'><form class='k-form'>";
            for (var i=0; i<pageGroups.length;i++) {
                var fieldGroup=findFieldGroup(pageGroups[i],fieldGroups);
                sRet=sRet+this.generateFieldGroupHtml(fieldGroup,0);
                /*
                sRet=sRet+"<label class=\"k-form-field\">\n" +
                    "        <span>\n" +
                    "          Required field <span class=\"k-required\">*</span>\n" +
                    "        </span>\n" +
                    "        <input class=\"k-textbox\" placeholder=\"Your Name\" />\n" +
                    "    </label>";
                */
//                sRet=sRet+"</p>"+JSON.stringify(fieldGroup)+"</p>";
            }
            sRet=sRet+"</form></div>";
            return sRet;
        }

    });
    return  DocBase;
});