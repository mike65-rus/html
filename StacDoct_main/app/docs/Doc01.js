/**
/**
/**
/**
 * Created by 1 on 11.12.2015.
 */
define(["kendo.all.min","docs/DocBase","services/proxyService","utils","alertify",'viewModels/copyToDocDialog',
        'dataSources/ibDocsListDataSource',"viewModels/ot58DialogVm","dataSources/fssSprDataSource",
        "dataSources/sysEventsDataSource","models/sysEventsModel","dataSources/printedBlanks",
        "dataSources/printEnabledCheckerDataSource"
    ],
    function(kendo,DocBase,proxy,utils,alertify,copyDialog,ibDocsDs,ot58Dialog,fssSpr,
             sysEventsDs,SysEventsModel,printedBlanksDs,printEnabledCheckerDs){

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
    var Doc01;
    Doc01 = DocBase.extend({

		autoSaveInterval: null,
		autoSaveTimeout: 15,
		expirationDays: 10,
		ldoDropDown:null,
		kdlDropDown:null,

        init: function (data,uuid) {
            DocBase.fn.init.call(this, uuid);
            this.docVid = 1;
            this.data=data;
			this.dsRead.parentObj=this;
			this.dsCreate.parentObj=this;
			this.cancerCancelledCount=0;
			this.maxCancerCancelledCount=65000;
			this.infarctCancelledCount=0;
			this.maxInfarctCancelledCount=65000;
			this.insultCancelledCount=0;
			this.maxInsultCancelledCount=65000;
            this.aRels=[
                {rel:"vyp_001",name:"Диагноз.Основной",rel2:"vyp_001_01"},
                {rel:"vyp_001",name:"Диагноз.Осложнение",rel2:"vyp_001_02"},
                {rel:"vyp_001",name:"Диагноз.Сопутствующий",rel2:"vyp_001_03"},
                {rel:"vyp_010",name:"Анамнез",rel2:""},
                {rel:"vyp_012",name:"Объективный статус",rel2:""},
                {rel:"vyp_040",name:"Лечение и результаты",rel2:""},
                {rel:"vyp_050",name:"Состояние при выписке",rel2:""},
                {rel:"vyp_051",name:"Выписывается под наблюдение",rel2:""},
                {rel:"vyp_055",name:"Трудовой прогноз",rel2:""},
                {rel:"vyp_056",name:"Клинический прогноз",rel2:""},
                {rel:"vyp_060",name:"Рекомендации",rel2:""}
            ];
            this.fiscalStartDate=new Date(2015,0,1);
            this.fssStartDate=new Date(2019,5,20);
            this.cancerCheckStartDate=new Date(2019,5,20);  // 20/06/2019
			this.statcardCheckStartDate=new Date(2022,4,30);
            this.ot58 = {
                isReaded: false,
                isExists: false,
                sMkb: "",
                nStepen: "",
                nBerem: ""
            };
            this.bind("change",onChange);
        },
        saveGpOtchet: function () {
            var ot58 = this.ot58;
            this.get("dsOt58").read({
                save: "1",
                ask_id: this.askId,
                mkb: ot58.sMkb,
                stepen: ot58.nStepen,
                berem: ot58.nBerem,
                user_id: Number(localStorage['last_user']).toString()
            });
        },
        isGpOtchetExists: function () {
            var ot58 = this.ot58;
            return (ot58.isReaded && ot58.isExists);
        },
		getAutoSaveKey: function(obj) {
			return "doc01$" + proxy.getSessionObject("selectedIb").ask_id + "$" + localStorage['last_user'] + "$" + obj.record_id;
		},
        isReadOnly: function() {
            var selIb = proxy.getSessionObject("selectedIb");
            if (utils.isViewer()) {
                return true;
            }
            if (this.isOldIb()) {
                return true;
            }
            if (selIb.is_nachmed || selIb.is_shef) {
                return false;
            }
//            if (((selIb.rdonly) && (!(selIb.is_nachmed || selIb.is_shef))) || (utils.isViewer()) ) {
            if (selIb.rdonly  || utils.isViewer() ) {
                return true;
            }
            return false;
        },
        findRel: function(rel,rel2) {
            var aRels=this.aRels;
            var oRet=null;
            for (var i=0;i<aRels.length;i++) {
                var item=aRels[i];
                if ((item.rel2==rel2)) {
                    var aSplit=item.rel.split();
                    if (aSplit.indexOf(rel)>=0) {
                        oRet=item;
                        break;
                    }
                }
            }
            return oRet;
        },
        publishDocChanged: function() {
            if (!this.isReadOnly()) {
                proxy.publish("docChanged", {uuid: this.uuid, content: $(this.content).html()});
            }
        },
        doFiscalReport: function(bForceReadFss) {
            var that=this;
            var selIb = proxy.getSessionObject("selectedIb");

            var dateAsk=kendo.parseDate($(that.content).find(".vyp-pac-dateask").text().trim(),"dd.MM.yyyy");
            var dateOut=kendo.parseDate($(that.content).find(".vyp-pac-dateout").text().trim(),"dd.MM.yyyy");
            var otd=that.data.ext1;
            if (!otd) {
                if (that.fiscal) {
                    otd=that.fiscal.otd || "";
                }
            }
            proxy.publish("openFiscal",{uuid:this.uuid,fiscal:that.fiscal,date_ask:dateAsk,date_out:dateOut,
                otd:otd,perevod:that.data.ext2,forceReadFss:bForceReadFss});
        },
        bindEditor: function() {
            if (this.isReadOnly()) {
                $(this.content).find("[contenteditable]").removeAttr("contenteditable");
            }
            else {
                $(this.content).find("div.vyp-diag-edt").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_050]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_051]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_0511]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_053]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_054]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_055]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_056]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_095]").attr("contenteditable","true");
                $(this.content).find("div[rel=vyp_096]").attr("contenteditable","true");
                $(this.content).find("div.date-prop").attr("contenteditable","true");

                DocBase.fn.bindEditor.call(this);
            }
        },
        createToolbar: function() {
            var that=this;
            var items=[];
            if (!this.isReadOnly()) {
                items.push({type:"button", text:" Сохранить", attributes: { "class": "faa faa-download","rel":"tooltip","title":"Сохранить" }, showText: "overflow"});
            }
            items.push({type:"button", text:" Печать",  attributes: { "class": "faa faa-print","rel":"tooltip","title":"Печать" }, showText: "overflow"});
                if (!this.isOldIb()) {
                    items.push({type:"button", text:" Печать диагноза",  attributes: { "class": "faa faa-tasks","rel":"tooltip","title":"Печать диагноза" }, showText: "overflow"});
                }
            items.push({type:"button", text:"X-Ray",  attributes: { "class": "","rel":"tooltip","title":"Печать лучевой нагрузки" }, showText: "always"});
            items.push(   { type: "separator" });
            items.push({type:"button", text:"Экспорт в формат PDF", attributes: { "class": "faa faa-file-pdf-o","rel":"tooltip","title":"Экспорт в формат PDF" },
                showText: "overflow"});
                /*faa faa-universal-access
                {
                    type: "splitButton",

                    text: "Экспорт",
                    menuButtons: [
                        { text: "Adobe Reader (pdf)", attributes: { "rel":"tooltip","title":"PDF"} },
                        { text: "Clinical document (xml)",attributes: { "rel":"tooltip","title":"XML"} }
                    ]
                }
                */
            if (!this.isReadOnly() ) {
                items.splice(items.length,0,
                    { type: "separator" },
                    { template: "<label>КДЛ:</label>" },
                    {
                        template: "<input class='kdl-dropdown' style='width: 100px;' />",
                        overflow: "never"
                    },
                    {type:"button", text:" Обновить КДЛ",  attributes: { "class": "faa faa-flask","rel":"tooltip","title":"Обновить КДЛ" }, showText: "overflow"},
                    { type: "separator" },
                    { template: "<label>ЛДО:</label>" },
                    {
                        template: "<input class='ldo-dropdown'  style='width: 100px;' />",
                        overflow: "never"
                    },
                    {type:"button", text:" Обновить ЛДО",  attributes: { "class": "faa faa-desktop","rel":"tooltip","title":"Обновить ЛДО" }, showText: "overflow"},
                    { type: "separator" },
                    {type:"button", text:" Данные о результате лечения",  attributes: { "class": "faa faa-rub","rel":"tooltip",
                            "title":"Данные о результате лечения" }, showText: "overflow"}
                );
                if (this.get("need58") && (this.get("need58")>=2)) {
                    items.push({ type: "separator" });
                    items.push({type:"button", text:"Отчет по пневмонии",
                        attributes: { "class": "doc-otchet", "rel":"tooltip","title":"Данные для отчета по пневмонии" }, showText: "always"});
                }
            }
            else {
                items.splice(items.length,0,
                    { type: "separator" },
                    { template: "<label>КДЛ:</label>" },
                    {
                        template: "<input class='kdl-dropdown' style='width: 100px;' />",
                            overflow: "never"
                    },
                    { type: "separator" },
                    { template: "<label>ЛДО:</label>" },
                    {
                        template: "<input class='ldo-dropdown'  style='width: 100px;' />",
                        overflow: "never"
                    }
                );
            }
            if (utils.isViewer()) {
                items.push(
                    {type:"button", text:" Данные о результате лечения",  attributes: { "class": "faa faa-rub","rel":"tooltip",
                            "title":"Данные о результате лечения" }, showText: "overflow"}
                );
                items.push(
                {type:"button", text:" Копировать", attributes: { "class": "faa faa-copy","rel":"tooltip","title":"Копировать в текущую ИБ" }, showText: "overflow"}
                );
            }
            items.push(
                {type:"button", text:" Закрыть", attributes: { "class": "faa faa-close pull-right","rel":"tooltip","title":"Закрыть" }, showText: "overflow"}
            );

            $(this.toolbar).kendoToolBar({
                items:items,
                click: that.onToolbarClick(that)
            });
            try {
            this.kdlDropDown=$(this.toolbar).find(".kdl-dropdown").first().kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: [
                    {text: "Последние",value: 1},
                    {text: "Сравнение",value: 2},
                    {text: "Все",value: 3}
                ],
                change: function(e) {
                    that.onKdlChange(this.value());
                }
            });
            this.ldoDropDown=$(this.toolbar).find(".ldo-dropdown").first().kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: [
                    {text: "Заключения",value: 1},
                    {text: "Протоколы",value: 2}
                ],
                change: function(e) {
                    that.onLdoChange(this.value());
                }
            });
            }
            catch (e) {}
        },
        closeMe: function() {
			
			//if (this.checkChanges()) {
				this.doClose();
			//}
			
            var that=this;
            proxy.publish("docClose",{uuid:that.uuid,content:$(that.content).html()});
        },
        saveMe: function(bClose) {
            var myBody=this.content;
            var myObj=this;
            this.unbindEditor();
            try {
                // remove fiscal-report from html
                // this fixes unknown bug
                var fr = $(myBody).find("table.e-2 tr:first").first().find("div.fiscal-report");
                if (fr.length > 0) {
                    $(fr).remove();
                }
            }
            catch (e) {

            }
            var span = $(myBody).find(".vyp-pac-dateout").first();
            try {
                span.removeAttr("rel");
                span.removeAttr("title");
            }
            catch (e) {

            }
            var selIb=this.selIb;

            // костыль 17.11.2018
            if (!this.data) {
                this.set.data({ext1:"",ext2:""})
            }
            if (!this.data.ext1) {
                this.data.ext1=selIb.otd1;
                console.log("!!! Doc01.js - error: empty data in this.data.ext1");
            }
            if (!this.data.ext2) {
                this.data.ext2="";
            }
            //
            kendo.ui.progress($(this.toolbar),true);
            $.ajax({
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc&record_id="+this.recordId +
                    "&ask_id="+selIb.ask_id+"&doc_id="+this.docVid.toString()+
                    "&user_id=" + (this.data.user_id ? this.data.user_id : Number(localStorage['last_user'])) + "&ext1="+this.data.ext1+"&ext2="+this.data.ext2,
                type: "POST",
                data: $(myBody).html(),
                processData:false,
                dataType: "json",
                complete: function(obj,status) {
                    kendo.ui.progress($(myObj.toolbar),false);
                },
                success: function(data,textStatus) {
                    kendo.ui.progress($(myObj.toolbar),false);
                    myObj.recordId=data.doc.rows[0].record_id;
                    myObj.oldAskId=data.doc.rows[0].ask_id;
                    proxy.publish("docSaved",{uuid:myObj.uuid,record_id:myObj.recordId});

                    myObj.data=data.doc.rows[0];
                    myObj.isSaved=true;
                    var key=myObj.getAutoSaveKey(myObj);
                    try {
                        localStorage.removeItem(key);
                    }
                    catch(e) {
                    }
                    myObj.autoSaveKey=myObj.getAutoSaveKey(myObj);
                    myObj.set("initialContent",myObj.getCurrentContent(myObj));
                    myObj.savedContent=$(myBody).html();

                    myObj.saveParts(myObj);

                    if (bClose) {
                        setTimeout(function(){
                                myObj.closeMe();
                            },500);
                    }
                }
            });
            this.bindEditor();
            DocBase.fn.saveMe.call(this);
        },
        prepareForPrint: function(myObj,oDiv) {
            var myBody = myObj.content;
            var printable=myObj.printable;
            $(printable).html(myBody.html());
            // формирование текста результата по форме
            var sRez = '';
            var myBody = printable;
            var sText = $(myBody).find("div[rel='vyp_050']").first().text().trim();
            if (sText != '') {
                sRez = sRez + 'Выписывается в ' + sText + ' состоянии';
            }
            sText = $(myBody).find("div[rel='vyp_051']").first().text().trim();
            if (sText != '') {
                if (sRez == '') {
                    sRez = sRez + "Выписывается";
                }
                sRez = sRez + ' под наблюдение ' + sText;
            }
            if (sRez != '') {
                sRez = sRez + "<br>";
            }
            sText = '';
            var sText1 = '';
            var sText2 = '';
            var sText3 = '';
            try {
                sText1 = $(myBody).find("div[rel='vyp_052']").first().text().trim();
            }
            catch (e) {
            }
            try {
                sText2 = $(myBody).find("div[rel='vyp_053']").first().text().trim();
            }
            catch (e) {
            }
            try {
                sText3 = $(myBody).find("div[rel='vyp_054']").first().text().trim();
            }
            catch (e) {
            }
            if ((sText1 + sText2 + sText3) == '') {
                sRez = sRez + "Больничный лист: не выдавался" + "<br>";
            }
            else {
                sText = "Больничный лист:";
                if (sText1 != '') {
                    sText = sText + " " + sText1;
                }
                if (sText2 != '') {
                    sText = sText + " c " + sText2;
                }
                if (sText3 != '') {
                    sText = sText + " по " + sText3;
                }
                sRez = sRez + sText + "<br>";
            }
            sText = $(myBody).find("div[rel='vyp_055']").first().text().trim();
            if (sText != '') {
                sRez = sRez + "Трудовой прогноз: " + sText + ". "
            }
            sText = $(myBody).find("div[rel='vyp_056']").first().text().trim();
            if (sText != '') {
                sRez = sRez + "Клинический прогноз: " + sText + ". "
            }
            try {
                sText = $(myBody).find("div[rel='vyp_doza']").first().text().trim();  // лучевая нагрузка

                $(myBody).find("div[rel='vyp_doza']").first().text("");
                if (sText != '') {
                    sRez = sRez + "<p>" + sText + "</p";
                }
            }
            catch (e) {

            }
            $(myBody).find("div[rel='vyp_059']").first().html(sRez);
            // избавиться от дублирования зав.отд, леч.врач
            sText1 = "";
            sText2 = "";
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
//            $(myBody).find("div[contenteditable='true']").each(function (i) {
            $(myBody).find("div.vyp-diag-edt").each(function (i) {
                if ($(this).text().trim() === "") {
                    $(this).addClass('no-print');
                    $(this).closest('.blank-zero').addClass('no-print');
                }
                else {
                    var sHtml = ""
                    var iVal = 0;
                    var text = $(this).text().trim();
                    if (text.length <= 2) {
                        try {
                            iVal = parseInt(text.trim(), 10);
                        }
                        catch (e) {
                            iVal = 0;
                        }
                        if (iVal > 0) {
                            for (var i = 0; i < iVal; i++) {
                                sHtml = sHtml + "<HR class='for-manual-write'>"
                            }
                            $(this).html(sHtml);
                        }
                    }
                    else {
                        $(this).removeClass('no-print');
                        $(this).closest('.blank-zero').removeClass('no-print');

                    }
                }

                $(this).find('p').removeAttr('style');
                $(this).find('span').removeAttr('style');
            });
        },
        showCopyDialog: function() {
            var that=this;
            var docData=new Array();
            $(this.content).find("div[rel]").each(function(i){
                var rel=$(this).attr("rel");
                var rel2="";
                if ($(this).hasAttr("rel2")) {
                    rel2=$(this).attr("rel2");
                }
                var relItem=that.findRel(rel,rel2);
                if (!relItem) {
                    return;
                }
                var text=$(this).text().trim();
                if (text) {
                    var html=utils.removeClasses(utils.removeInlineStyles($(this).html()));
                    docData.push({id:rel+','+rel2, rel:rel,rel2:rel2,text:text,html:html,name:relItem.name,isChecked:true});
                }
            });
            copyDialog.open(docData,that);
        },
        copyToNew: function(theData) {
            var docData=JSON.parse(theData);
            var win=window.open("","ru.pgb2.stac.ARM");
            var that=this;
            if (win) {
                var data = {message:"copyDoc",messageData:{
                    recordId: this.recordId, docVid: this.docVid, docSub:this.docSub,
                    ask_id: this.selIb.ask_id, global_vn: this.selIb.global_vn, docData:docData}
                };
                win.postMessage(data, window.location.origin);
            }
        },
        doCopyToNew: function(data) {
            var that=this;
            var docData=data.docData;
            switch (data.docVid) {
                case 1:
                    for (var i=0;i<docData.length;i=i+1) {
                        var dataItem=docData[i];
                        $(this.content).find("div[rel='"+dataItem.rel+"']").each(function(y){
                            if (dataItem.rel2) {
                                if ($(this).attr("rel2")===dataItem.rel2) {
                                    $(this).html(dataItem.html);
                                }
                            }
                            else {
                                $(this).html(dataItem.html);
                            }
                        });
                    }
                    break;
            }
            that.publishDocChanged();
            setTimeout(function() {
                that.changeCount=0;
            },50);
        },
        tryPrintMe: function(bInterval) {
            var that=this;
            var selIb = proxy.getSessionObject("selectedIb");
            var ds=printEnabledCheckerDs;
            ds.read({ask_id:selIb.ask_id,uid: localStorage['last_user']}).then(function() {
                try {
                    var data=ds._data[0];
                    if (data.is_print) {
                        that.printMe();
                        if (bInterval) {
                            that.autoSaveInterval = setInterval(that.autoSave, that.autoSaveTimeout*1000, that);
                        }
                    }
                    else {
                        kendo.alert(data.reason).done(function(){
                            if (bInterval) {
                                that.autoSaveInterval = setInterval(that.autoSave, that.autoSaveTimeout*1000, that);
                            }
                        });
                    }
                }
                catch (ex) {
                    that.printMe();
                    if (bInterval) {
                        that.autoSaveInterval = setInterval(that.autoSave, that.autoSaveTimeout*1000, that);
                    }
                }
            });
        },
        printMe: function() {
		    var that=this;
            var selIb = proxy.getSessionObject("selectedIb");
            this.prepareForPrint(this,this.content);
//            DocBase.fn.makeNotSignedPrintContent.call(this,this.printable);

            $(this.printable).jqprint();
//            if (!utils.isViewer() && !that.isOldIb() /*&& !utils.isEmulMode()*/) {
//                setTimeout(function() {
//                   printedBlanksDs.read({ask_id:selIb.ask_id}).then(function() {
//						 $.ajax({
//							url: location.origin+"/Medsystem/DoseBlank/Home/GetCount?askid="+selIb.ask_id,
//							//url: "https://tele.pgb2.ru/medsystem/doseblank/home/getcount?askid="+selIb.ask_id,
//							dataType: "json",
//							success: function(data,textStatus) {
//								if (data && data.Count && data.Count > 0) {
//									var isNeedPrintXray=true;
//									var blankData=printedBlanksDs._data;
//									for (var i=0;i<blankData.length;i++) {
//										if (blankData[i].xray) {
//											isNeedPrintXray=false;
//										}
//									}
//									if (isNeedPrintXray) {
//										/*alertify.confirm("Печатать лист лучевой нагрузки?",
//											function(e){
//												if (e) {
//													that.printDoza();
//												}
//											});*/
//										that.printDoza();
//									}
//								}
//							}
//						})
//                    });
//                },1000*2);
//            }
        },
        printDiag: function() {
            var myBody=this.content;
            var ibDia=$(myBody).find('div.vyp-diag-div').first();
            var sHtml="<div class='vyp-diag-div'>"+ibDia.html()+"</div>";
//            this.prepareForPrint(ibDia);
            $(this.printable).html(sHtml);
            ibDia=$(this.printable).find('div.vyp-diag-div').first();
            $(ibDia).find("div.vyp-diag-div div[contenteditable='true']").each(function(i){
                $(this).removeClass('vyp-edt-big');
                $(this).addClass('vyp-edt-big2');
                $(this).find('p').removeAttr('style');
                $(this).find('span').removeAttr('style');
            });
            var j=0;
            $(ibDia).find(".diag-type").each(function (i) {
                var oDiaType=$(this).find(".width-100").first();
                var sPara=String.fromCharCode(j+1072); //1072=russian 'а' in UTF-8
                if ($(oDiaType).text()) {
                    $(oDiaType).text(sPara+") "+$(oDiaType).text().toLowerCase()+":");
                    j=j+1;
                }
            });

            var sText=$(ibDia).find("p.vyp-diag-p").text();
            var sText2=$(myBody).find('span.vyp-niib').first().text();
            $(ibDia).find("p.vyp-diag-p").
                text('11. Диагноз заключительный клинический'+' (№ '+sText2+')    (ксг:'+this.fiscal.ksg+((this.fiscal.mkb.trim()) ? ' мкб:'+this.fiscal.mkb : '')+')');
            $(ibDia).find("p.vyp-diag-p").addClass("vyp-diag-small");
//            $(ibDia).find("p.vyp-diag-p").text(sText+' (№ '+sText2+')    (ксг:'+this.fiscal.ksg+')');
//            ibDia.html(ibDia.html()+'<p>&nbsp;</p><HR>');
            ibDia.jqprint();
            $(ibDia).find("p.vyp-diag-p").removeClass("vyp-diag-small");    // to top of page (in vyp-print.css_

            $(ibDia).find("div.vyp-diag-div div[contenteditable='true']").each(function(i){
                $(this).removeClass('vyp-edt-big2');
                $(this).addClass('vyp-edt-big');
            });
            $(ibDia).find("p.vyp-diag-p").text(sText);
            ibDia.html(sHtml);
//            this.oContainer.bindEditor(myBody);
//            this.bindDateout();

        },
        tryExportPDF: function(bInterval) {
            var that=this;
            var selIb = proxy.getSessionObject("selectedIb");
            var ds=printEnabledCheckerDs;
            ds.read({ask_id:selIb.ask_id,uid: localStorage['last_user']}).then(function() {
                try {
                    var data=ds._data[0];
                    if (data.is_print) {
                        that.exportPDF();
                        if (bInterval) {
                            that.autoSaveInterval = setInterval(that.autoSave, that.autoSaveTimeout*1000, that);
                        }

                    }
                    else {
                        kendo.alert(data.reason).done(function() {
                            if (bInterval) {
                                that.autoSaveInterval = setInterval(that.autoSave, that.autoSaveTimeout*1000, that);
                            }
                        });
                    }
                }
                catch (ex) {
                    that.exportPDF();
                    if (bInterval) {
                        that.autoSaveInterval = setInterval(that.autoSave, that.autoSaveTimeout*1000, that);
                    }
                }
            });

        },
        exportPDF: function() {
            //        console.log("Export to PDF");
            var that=this;
            var myBody = this.content;
            this.prepareForPrint(this, this.content);

            var sData = $(this.printable).html();
            $.ajax({
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_PDF&" +
                    "CSS=html/css/vyp-print.css;html/css/lab-print.css;html/css/ldo-print.css;html/StacDoct_main/app/css/app-print.css&" +
                    "top=10&bottom=5&left=15&right=5&zoom=1.0",
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
                        pom.setAttribute('download', sFile + '_' + curIb.fio.replaceAll(' ', '_') + ".pdf");
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
        checkDates: function() {
            var dD1=this.getDateFromContent("dateask");
            var dD2=this.getDateFromContent("dateout");
            if (! dD1) {
                return false;
            }
            if (! dD2) {
                return false;
            }
            if (!(dD2>=dD1)) {
                return false;
            }
            return true;
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
        validate: function() {
            if (utils.isViewer() || this.isOldIb()) {
                return true;
            }
            var myBody=this.content;
            if (!(this.checkDates())) {
                alertify.error("Проверьте даты начала и окончания госпитализации!");
                return false;
            }
            if ((this.getDateFromContent("dateout")>=this.fiscalStartDate) && !(this.selIb.polis=="")) {
                if (!(this.isFiscalComplete())) {
                    this.fiscalError();
                    return false;
                }
                if ((this.getDateFromContent("dateout")>=this.fssStartDate)) {
                    if (!this.get("fiscal").fss_answer) {
                        var sConfirm= "Требуется уточнить статус больничного листа в диалоге о результате лечения!";
                        sConfirm=sConfirm+"<hr>Открыть диалог рзультата лечения сейчас?";
                        var that=this;
                        kendo.confirm(sConfirm).then(function(){
                            that.doFiscalReport(1);
                        });
                        return false;
                    }
                }
            }
            if ( (this.get("need58")) && (this.getDateFromContent("dateout")>=this.get("need58Date")) ) {
                var selIb=proxy.getSessionObject("selectedIb");
                if (!(selIb.rezult1)=="Переведен") {
                    if (this.get("need58")<2) {
                        alertify.alert("Необходимо сформировать окончательное извещение по пневмонии!");
                        return false;
                    }
                    else {
                        /*
                        if (!(this.isGpOtchetExists())) {
                            alertify.alert("Необходимо заполнить данные для отчета по пневмонии!");
                            return false;
                        }
                        */
                    }
                }
            }
			//РАК
			var dD2=this.getDateFromContent("dateout");
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
                    var aCancerDiaTypes=["Основной диагноз","Осложнение основного","Сопутствующий диагноз"];
                    var sMsg2="";
                    for (var i=1;i<=3;i++) {
                        var el=$(myBody).find("div[rel2='vyp_001_0"+i.toString()+"']");
                        if (el) {
                            if (el.length) {
                                var sText=utils.htmlToText($(el)[0],true);
                                var sFoundedCancer=utils.findCancer(sText);
                                if (sFoundedCancer) {
                                    aCancer.push({dType:aCancerDiaTypes[i-1],foundedCancer:sFoundedCancer});
                                    sMsg2=sMsg2+aCancerDiaTypes[i-1]+":";
                                    sMsg2=sMsg2+sText+'\n';
                                    sMsg2=sMsg2+"Стоп слово: "+sFoundedCancer+"\n";
                                }
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
                        //return false;
                    }
                }
            }
			//ИНФАРКТ
			if (dD2>=this.statcardCheckStartDate) {
                var selIb=proxy.getSessionObject("selectedIb");
                var infarctCount=this.get72Count();
                var sMsg="";
                if (!infarctCount) {
					//проверка на стоп слова инфаркт
                    var aInfarct=[];
					var aInfarctDiaTypes=["Основной диагноз","Осложнение основного","Сопутствующий диагноз"];
                    var sMsg2="";
                    /* for (var i=1;i<=3;i++) {
                        var el=$(myBody).find("div[rel2='vyp_001_0"+i.toString()+"']");
                        if (el) {
                            if (el.length) {
                                var sText=utils.htmlToText($(el)[0],true);
                                var sFoundInfarct=utils.findInfarct(sText);
                                if (sFoundInfarct) {
                                    aInfarct.push({dType:aInfarctDiaTypes[i-1],foundInfarct:sFoundInfarct});
                                    sMsg2=sMsg2+aInfarctDiaTypes[i-1]+":";
                                    sMsg2=sMsg2+sText+'\n';
                                    sMsg2=sMsg2+"Стоп слово: "+sFoundInfarct+"\n";
                                }
                            }
                        }
                    } */
					var el=$(myBody).find("div[rel2='vyp_001_01']");
					if (el && el.length) {
						var sText = utils.htmlToText($(el)[0], true);
						var sTextStart = "";
						for (var i = 0; i < sText.length; i++) {
							if (sText[i] == '.' || sText[i] == ',' || sText[i] == ';' || sText[i] == '(') 
								break;
							sTextStart += sText[i];
						}
						var sFoundInfarct = utils.findInfarct(sTextStart);
						if (sFoundInfarct) {
							aInfarct.push({dType:"Основной диагноз",foundInfarct:sFoundInfarct});
							sMsg2=sMsg2+"Основной диагноз"+":";
							sMsg2=sMsg2+sText+'\n';
							sMsg2=sMsg2+"Стоп слово: "+sFoundInfarct+"\n";
						}
					}
					
                    if (aInfarct.length )  {
                        sMsg = "<div style='text-align:center;font-weight:bold;margin-bottom:10px'>";
                        if (!infarctCount) {

                            sMsg=sMsg+"Найдены сигнальные слова диагноза инфаркта!<br>Необходимо сформировать стат-карту!" + "</div>";
                            for (var i = 0; i < aInfarct.length; i++) {

                                sMsg = sMsg + "<div>" + aInfarct[i].dType + "&nbsp;&nbsp;<span style='font-weight:bold'>" + aInfarct[i].foundInfarct + "</span></div>";
                            }
                            sMsg = sMsg + "<hr><div style='text-align:center;font-weight:bold'>Сформировать стат-карту сейчас?</div>";
                        }
                        var that=this;
                        kendo.confirm(sMsg).then(function(){
                            var selIb = proxy.getSessionObject("selectedIb");
                            var oSuffix={goto:"ib-docs","doc_id":72,"doc_sub":1};
                            window.location.href=
                                window.location.origin+window.location.pathname+window.location.search+
                                "#/"+"ib-docs"+"/" + selIb.ask_id+"/"+JSON.stringify(oSuffix);
                        }, function() {
                            if (infarctCount) {
                                return;
                            }
                            that.set("infarctCancelledCount",that.get("infarctCancelledCount")+1);
                            if (that.get("infarctCancelledCount")>that.maxInfarctCancelledCount) {
                                that.tryPrintMe(false);
                                var selIb = proxy.getSessionObject("selectedIb");
                                var model=new SysEventsModel();
                                model.set("event_id",72);
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
			//ИНСУЛЬТ
			if (dD2>=this.statcardCheckStartDate) {
                var selIb=proxy.getSessionObject("selectedIb");
                var insultCount=this.get73Count();
                var sMsg="";
                if (!insultCount) {
					//проверка на стоп слова инсульт
                    var aInsult=[];
					var aInsultDiaTypes=["Основной диагноз","Осложнение основного","Сопутствующий диагноз"];
                    var sMsg2="";
                    /* for (var i=1;i<=3;i++) {
                        var el=$(myBody).find("div[rel2='vyp_001_0"+i.toString()+"']");
                        if (el) {
                            if (el.length) {
                                var sText=utils.htmlToText($(el)[0],true);
                                var sFoundInsult=utils.findInsult(sText);
                                if (sFoundInsult) {
                                    aInsult.push({dType:aInsultDiaTypes[i-1],foundInsult:sFoundInsult});
                                    sMsg2=sMsg2+aInsultDiaTypes[i-1]+":";
                                    sMsg2=sMsg2+sText+'\n';
                                    sMsg2=sMsg2+"Стоп слово: "+sFoundInsult+"\n";
                                }
                            }
                        }
                    } */
					var el=$(myBody).find("div[rel2='vyp_001_01']");
					if (el && el.length) {
						var sText = utils.htmlToText($(el)[0], true);
						var sTextStart = "";
						for (var i = 0; i < sText.length; i++) {
							if (sText[i] == '.' || sText[i] == ',' || sText[i] == ';' || sText[i] == '(') 
								break;
							sTextStart += sText[i];
						}
						var sFoundInsult = utils.findInsult(sTextStart);
						if (sFoundInsult) {
							aInsult.push({dType:"Основной диагноз",foundInsult:sFoundInsult});
							sMsg2=sMsg2+"Основной диагноз"+":";
							sMsg2=sMsg2+sText+'\n';
							sMsg2=sMsg2+"Стоп слово: "+sFoundInsult+"\n";
						}
					}
					
                    if (aInsult.length )  {
                        sMsg = "<div style='text-align:center;font-weight:bold;margin-bottom:10px'>";
                        if (!insultCount) {

                            sMsg=sMsg+"Найдены сигнальные слова диагноза инсульта!<br>Необходимо сформировать стат-карту!" + "</div>";
                            for (var i = 0; i < aInsult.length; i++) {

                                sMsg = sMsg + "<div>" + aInsult[i].dType + "&nbsp;&nbsp;<span style='font-weight:bold'>" + aInsult[i].foundInsult + "</span></div>";
                            }
                            sMsg = sMsg + "<hr><div style='text-align:center;font-weight:bold'>Сформировать стат-карту сейчас?</div>";
                        }
                        var that=this;
                        kendo.confirm(sMsg).then(function(){
                            var selIb = proxy.getSessionObject("selectedIb");
                            var oSuffix={goto:"ib-docs","doc_id":73,"doc_sub":1};
                            window.location.href=
                                window.location.origin+window.location.pathname+window.location.search+
                                "#/"+"ib-docs"+"/" + selIb.ask_id+"/"+JSON.stringify(oSuffix);
                        }, function() {
                            if (insultCount) {
                                return;
                            }
                            that.set("insultCancelledCount",that.get("insultCancelledCount")+1);
                            if (that.get("insultCancelledCount")>that.maxInsultCancelledCount) {
                                that.tryPrintMe(false);
                                var selIb = proxy.getSessionObject("selectedIb");
                                var model=new SysEventsModel();
                                model.set("event_id",73);
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

        savePart: function(sDocRecordId,sAskId,iFieldType,sText,sHtml) {
            // Saves one field to ib_fields table
            $.ajax({
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_doc_part&record_id="+sDocRecordId +
                    "&ask_id="+sAskId+"&field_id="+iFieldType.toString()+
                    "&user_id="+Number(localStorage['last_user']),
                type: "POST",
                data: "!1!"+sText+"!2!"+sHtml,
                processData:false,
                success: function(data,textStatus) {
//                _onRequestEnd(0);
                },
                dataType: "json"
            });
        },
        saveParts: function(myObj) {
            var sBodyId=myObj.mainHolder.attr("id");
            var partsArray=new Array();
            partsArray.push({sel:"#"+sBodyId+" div[rel2='vyp_001_01']", field_id:1});
            partsArray.push({sel:"#"+sBodyId+" div[rel2='vyp_001_02']", field_id:2});
            partsArray.push({sel:"#"+sBodyId+" div[rel2='vyp_001_03']", field_id:3});
            partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_010']", field_id:10});   // краткий анамнез
            partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_012']", field_id:9});    // объективный статус
            partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_060']", field_id:14});    // рекомендации
            partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_050']", field_id:15});    // состояние при выписке
            partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_055']", field_id:16});    // трудовой прогноз
            partsArray.push({sel:"#"+sBodyId+" div[rel='vyp_056']", field_id:17});    // клинический прогноз

            partsArray.forEach(function(el,idx,ar) {
                var eDiv=$(el.sel);
                if (eDiv) {
                    var sText=utils.htmlToText($(eDiv)[0],true);
                    var sHtml=$(eDiv).html();
                    if (el.field_id==15) {
                        // состояние при выписке
                        sText=$("#"+sBodyId+" div[rel='vyp_050']").text();
                        if (sText && sText.trim()) {
                            sText="Выписывается в "+sText+" состоянии";
                        }
                        if (sText) {
                            var sText2=$("#"+sBodyId+" div[rel='vyp_051']").text();
                            if (sText2 && sText2.trim()) {
                                sText=sText+" под наблюдение "+sText2;
                            }
                        }
                        if (sText) {
                            sHtml="<div>"+sText+"</div>";
                        }
                        else {
                            sHtml="";
                        }
                    }
                    myObj.savePart(
                        myObj.recordId,
                        myObj.selIb.ask_id,
                        el.field_id,sText,sHtml);
                }
            });
        },
        printDoza: function() {

            var selIb = proxy.getSessionObject("selectedIb");
            var isEmul=utils.isEmulMode();
            var sEmul=(isEmul ? "&emul=true" : "&emul=false");
            var wnd=window.open(location.origin+"/Medsystem/DoseBlank/Home/Blank?askid="+selIb.ask_id+"&pdf=true"+sEmul,'_blank');
            wnd.focus();
        },
        onToolbarClick: function(that) {
            var myObj = that;
            var fnc = function(e) {
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
                    myObj.saveMe();
                }
                if (btnText == "Печать") {
					myObj.saveMe();
                    if (myObj.validate()) {
						var bInterval = false;
						if (myObj.autoSaveInterval) {
							bInterval = true;
							clearInterval(myObj.autoSaveInterval);
						}
                        myObj.tryPrintMe(bInterval);
						/*
						if (bInterval) {
							myObj.autoSaveInterval = setInterval(myObj.autoSave, myObj.autoSaveTimeout*1000, myObj);
						}
						*/
                    }
                }
                if (btnText == "Копировать в текущую ИБ" && utils.isViewer()) {
                    myObj.showCopyDialog();
                }
                if (btnText == "Печать диагноза") {
                    if (myObj.validate()) {
						var bInterval = false;
						if (myObj.autoSaveInterval) {
							bInterval = true;
							clearInterval(myObj.autoSaveInterval);
						}
                        myObj.printDiag();
						if (bInterval) {
							myObj.autoSaveInterval = setInterval(myObj.autoSave, myObj.autoSaveTimeout*1000, myObj);
						}
                    }
                }
                if (btnText=="Печать лучевой нагрузки") {
                    myObj.printDoza();
                }
                if (btnText == "Экспорт в формат PDF") {
                    if (myObj.validate()) {
						var bInterval = false;
						if (myObj.autoSaveInterval) {
							bInterval = true;
							clearInterval(myObj.autoSaveInterval);
						}
                        myObj.tryExportPDF(bInterval);
                    }
                }
                if (btnText == "XML") {
                    if (myObj.validate()) {
						var bInterval = false;
						if (myObj.autoSaveInterval) {
							bInterval = true;
							clearInterval(myObj.autoSaveInterval);
						}
                        myObj.exportXML();
						if (bInterval) {
							myObj.autoSaveInterval = setInterval(myObj.autoSave, myObj.autoSaveTimeout*1000, myObj);
						}
                    }
                }
                if (btnText == "Обновить КДЛ") {
                    myObj.refreshKdlData();
                }
                if (btnText == "Обновить ЛДО") {
                    myObj.refreshLdoData();
                }
                if (btnText == "Test") {
                    myObj.doTest()
                }
                if (btnText == "Данные о результате лечения") {
                    myObj.doFiscalReport()
                }
                if (btnText == "Данные для отчета по пневмонии") {
                    myObj.openGpOtchet();
                }

            };
            return fnc;

        },
        mayOpenGpOtchet: function() {
		    return true;
        },
        openGpOtchet: function () {
            if (!(this.mayOpenGpOtchet())) {
                return;
            }
            var that = this;
            if (!(this.ot58.isReaded)) {
                alertify.alert("Данные для отчета еще не прочитаны.Повторите попытку позже!");
                return;
            }
            var selIb = proxy.getSessionObject("selectedIb");
            var sSex = selIb.sex;
            var data = {parentModel: this, selectedIb: selIb};
            ot58Dialog.open(data);
        },
        onActivate: function() {
            DocBase.fn.onActivate.call(this);
        },
        onDeactivate: function() {
            DocBase.fn.onActivate.call(this);
        },
        changeDateOut: function(data) {
            var obj = $(this.content).find(".vyp-pac-dateout");
			
            if (obj.length) {
                if (data) {
                    $(obj).html(kendo.toString(data, "dd.MM.yyyy"));
                }
                else {
                    $(obj).html("");
                }
                this.bindDateout();
            }
            // дата прописью в подвале
            var obj=$(this.content).find("div.date-prop").find("div");
            if (obj.length) {
                $(obj).html(utils.dtaProp(data));
            }
        },
        refreshLdoData: function() {
            var that = this;
            var bConfirm = true;
			
            this.sManual = "";
			
            $(this.content).find(".vyp-ldo-data div[contenteditable='true']").each(function(i) {
                if (! ($(this).hasClass("vyp-diag-edt2"))) {
                    // все кроме суммарной лучевой дозы
                    if ($(this).text().trim() != "") {
                        that.sManual = that.sManual+"<p>"+$(this).html()+"</p>";
                    }
                }
            });
            if (!(this.sManual == "")) {
                bConfirm = confirm('Все ручные правки в разделах "ЛДО" будут перемещены в раздел "Другие исследования"!');
            }
            if (bConfirm) {
                var selIb = proxy.getSessionObject("selectedIb");
                var dateAsk=kendo.parseDate($(this.content).find(".vyp-pac-dateask").html().trim(),"dd.MM.yyyy");
                var dateOut=kendo.parseDate($(this.content).find(".vyp-pac-dateout").html().trim(),"dd.MM.yyyy");
                kendo.ui.progress($(this.toolbar), true);
                this.getKdlLdoUpdateDataSource().read({
                    doc_id: this.docVid,
                    part_id: 1,
                    user_id: Number(localStorage['last_user']),
                    ask_id: selIb.ask_id,
                    date_ask:kendo.toString(dateAsk,"yyyyMMdd"),
                    date_out:kendo.toString(dateOut,"yyyyMMdd")
                });
            }
        },
        refreshKdlData: function() {
            var selIb = proxy.getSessionObject("selectedIb");
            var dateAsk=kendo.parseDate($(this.content).find(".vyp-pac-dateask").html().trim(),"dd.MM.yyyy");
            var dateOut=kendo.parseDate($(this.content).find(".vyp-pac-dateout").html().trim(),"dd.MM.yyyy");
            kendo.ui.progress($(this.toolbar),true);
            this.getKdlLdoUpdateDataSource().read({
                doc_id: this.docVid,
                part_id: 0,
                user_id: Number(localStorage['last_user']),
                ask_id: selIb.ask_id,
                date_ask:kendo.toString(dateAsk,"yyyyMMdd"),
                date_out:kendo.toString(dateOut,"yyyyMMdd")
            });
        },
        onKdlChange: function (newVal) {
            $(this.content).find(".vyp-lab-vid").each(function(i){
                if ((i+1)==newVal) {
                    if ($(this).hasClass("div-invisible")) {
                        $(this).removeClass("div-invisible no-print");
                    }
                }
                else {
                    if (! $(this).hasClass("div-invisible")) {
                        $(this).addClass("div-invisible no-print");
                    }
                }
            });
            if (!this.isReadOnly()) {
                this.publishDocChanged();
            }
        },
        onLdoChange: function(newVal) {
            $(this.content).find(".vyp-ldo-td-2").each(function(i){
                if (newVal==Number($(this).attr("id0"))) {
                    if ($(this).hasClass("div-invisible")) {
                        $(this).removeClass("div-invisible no-print");
                    }
                }
                else {
                    if (! $(this).hasClass("div-invisible")) {
                        $(this).addClass("div-invisible no-print");
                    }
                }
            });
            if (!this.isReadOnly()) {
                this.publishDocChanged();
            }
        },
        updateKdlLdo: function(data) {
            switch (data.part_id) {
                case 0: {
                    // КДЛ
                    $(this.content).find(".vyp-lab-data").first().html(data.doc_html);
                    var newVal=$(this.toolbar).find(".kdl-dropdown").last().data("kendoDropDownList").value();
                    this.onKdlChange(Number(newVal));
                    break;
                }
                case 1: {
                    // ЛДО
                    var ldoDiv=$(this.content).find(".vyp-ldo-data").first();
                    if (!(ldoDiv.length)) {
                        // не было сохраненных ЛДО (баг в IB.prg исправлен 15.01.2015)
                        // добавить после лаборатории
                        $(this.content).find("div.vyp-lab-data").first().after("<DIV class='vyp-ldo-data'></DIV>");
                    }
                    $(this.content).find(".vyp-ldo-data").first().html(data.doc_html);
                    var manualDiv=$(this.content).find("div[rel='vyp_020']").first();
                    if (manualDiv.length) {
                        $(manualDiv).html($(manualDiv).html()+this.sManual);
                        this.sManual="";
                    }
                    var newVal=$(this.toolbar).find(".ldo-dropdown").last().data("kendoDropDownList").value();
                    this.bindEditor();
                    this.onLdoChange(newVal);
                    break;
                }
            }
        },
        getKdlLdoUpdateDataSource: function() {
            var that=this;
            var ds=new kendo.data.DataSource({

                serverPaging: false,
                serverSorting: false,
                pageSize: 15,
                transport: {
                    read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=refresh_doc_part",
                    dataType: "json"
                },
                requestEnd: utils._onRequestEnd,
                schema: {
                    data: "doc.rows",
                    total: "records",
                    errors: "error",
                    model: {
                        fields: {
                            doc_id: {type: "number"},
                            part_id: {type: "number"},
                            doc_html: {
                                type: "string"
                            }
                        }
                    }
                },
                change: function (e) {
                    kendo.ui.progress($(that.toolbar),false);
                    that.updateKdlLdo(this._data[0]);
                }
            });
            return ds;
        },
        changeRawServerContent: function() {
            // change content from server
            var that=this;
            try {
                // remove unused forms, because this is in toolbar now
                $(this.content).find("form.k-content.k-toolbar").remove();
                // remove fiscal-report from text
                var fr=$(this.content).find("table.e-2 tr:first").first().find("div.fiscal-report");
                if (fr.length>0) {
                    $(fr).remove();
                }
            }
            catch (e) {
            }
            $(this.content).find("[contenteditable]").each(function(){
                $(this).html(utils.removeClasses(utils.removeInlineStyles($(this).html())));
            });
            that.publishDocChanged();
            setTimeout(function() {
                that.changeCount=0;
            },50);

        },
        updateKdlState: function() {
            var that=this;
            $(that.content).find(".vyp-lab-vid").each(function(i){
                if (! $(this).hasClass("div-invisible")) {
                    try {
                        $(that.toolbar).find(".kdl-dropdown").last().data("kendoDropDownList").value(i+1);
                    }
                    catch (e) {
                    }
                }
            });
        } ,
        updateLdoState: function() {
            var that=this;
            $(that.content).find(".vyp-ldo-td-2").each(function(i){
                if (! $(this).hasClass("div-invisible")) {
                    try {
                        $(that.toolbar).find(".ldo-dropdown").last().data("kendoDropDownList").value(Number($(this).attr("id0")));
                    }
                    catch (e) {
                    }
                }
            })
        },
        updateKdlLdoState: function () {
            this.updateKdlState();
            this.updateLdoState();
        },

        getDateFromContent: function(sKind) {
            var myBody=this.content;
            var sD=$(myBody).find('.vyp-pac-'+sKind).first().text().trim();
            return kendo.parseDate(sD);
        },

        bindDateout: function() {
            var theBody=this.content;
            var span=$(theBody).find("span.vyp-pac-dateout").first();
            var input=$(theBody).find("input.vyp-pac-dateout2").first();
            var that=this;
            if (input.length) {
                if ($(input).data("kendoDatePicker")) {
                    $(input).data("kendoDatePicker").destroy();
                }
                $(input).kendoDatePicker({
                    min: kendo.parseDate(that.selIb.date_ask),
                    change: function(e) {
                        that.publishDocChanged();
                        if (this.value()<this.min()) {
                            alertify.error("Дата не может быть меньше "+kendo.format(this.min().toLocaleDateString().substr(0,10)));
                            this.value(this.min());
                        }
                        span.text(kendo.format(this.value().toLocaleDateString().substr(0,10)));
                    },
                    value: that.getDateFromContent("dateout")
                });
                $(theBody).find("span.vyp-pac-dateout2").first().css("width","150px");
                $(input).data("kendoDatePicker").readonly(utils.isViewer());
                input.attr("readonly","readonly");
            }
        },

		applyAutoSave: function(obj, itemSaved) {
			//var myBody = obj./*uiContainer.*/body;
			var myBody = obj.content;
			var applyErr = 0;
			try {
				obj.ldoDropDown.data("kendoDropDownList").value(itemSaved.ldoVid);
				//obj.ldoDropDown.value(itemSaved.ldoVid);
			}
			catch (e) {
				applyErr++;
			}
			try {
				obj.kdlDropDown.data("kendoDropDownList").value(itemSaved.kdlVid);
				//obj.kdlDropDown.value(itemSaved.kdlVid);
			}
			catch(e) {
				applyErr++;
			}
			try {
				$(obj).find(".vyp-pac-dateout").first().text();
			}
			catch (e) {
				applyErr++;
			}
			obj.doOnLdoChange(myBody,Number(itemSaved.ldoVid));
			obj.doOnKdlChange(myBody,Number(itemSaved.kdlVid));
			$(myBody).find("div[contenteditable='true']").each(function (i) {
				try {
					$(this).html(itemSaved.divs[i]);
				}
				catch (e) {
					applyErr++;
				}
			});
			return applyErr;
		},
		
		autoSave: function(obj) {
			//var myBody=obj./*uiContainer.*/body;
			var bInterval=false;
			if (obj.autoSaveInterval) {
				bInterval=true;
			}
			var askId="";
			var dateOut=null;
			var curIb=proxy.getSessionObject("selectedIb");
			try {
				askId=curIb.ask_id;
			}
			catch (e) {
				askId="";
			}
			try {
				dateOut=curIb.date_out;
			}
			catch (e) {
				dateOut=null;
			}

			if (askId) {
				if (!(obj.askId===askId)) {
					if (bInterval) {
						clearInterval(obj.autoSaveInterval);
						return;
					}
				}
			}
			else {
				if (bInterval) {
					clearInterval(obj.autoSaveInterval);
					return;
				}
			}

			if (dateOut) {
				if (utils.getDaysBetweenDates(dateOut, new Date())>10) {
					if (bInterval) {
						clearInterval(obj.autoSaveInterval);
						return;
					}
				}
			}
			var oSave={data:""};
			var initialContent=obj.get("initialContent") || {data:""};
			try {
                oSave=obj.getCurrentContent(obj);
            }
            catch (ex) {
                oSave={data:""};
                initialContent={data:""};
            }
			if (JSON.stringify(oSave)===JSON.stringify(initialContent)) {
				// do not autoSave if no changes from initially opened
				return;
			}
			var myStoreKey=obj.getAutoSaveKey(obj);
			var oldItem=localStorage.getItem(myStoreKey);
			if (oldItem) {
			    localStorage.removeItem(myStoreKey);
            }
            oSave.expireDate=kendo.toString(utils.addDays(new Date(),obj.expirationDays),"yyyyMMdd");
            localStorage.setItem(myStoreKey, JSON.stringify(oSave));
            oSave.expireDate="";
            obj.set("initialContent",oSave);
		},
		checkAutoSaved: function(obj) {
			if (!(proxy.getSessionObject("selectedIb").user_id==Number(localStorage['last_user']))) {
				return;
			}
			var key=obj.getAutoSaveKey(obj);
			var item=null;
			try {
				var item=localStorage.getItem(key);
			}
			catch (e) {

			}
			if (item) {
/*				alertify.set({
					labels: {
						ok: "Применить",
						cancel: "Отказ"
					}
				}); */
				alertify.confirm("Обнаружены несохраненные изменения этого документа! Применить их?",
					function(e){
						if (e) {
							var nErrCnt=obj.applyAutoSave(obj,JSON.parse(item));
							if (!nErrCnt) {
								try {
									localStorage.removeItem(key);
								}
								catch(ex) {
								}
							}
						}
						else {
							try {
								localStorage.removeItem(key);
							}
							catch(ex) {
							}

						}
						obj.autoSaveInterval=setInterval(obj.autoSave,obj.autoSaveTimeout*1000,obj);
						obj.set("initialContent",obj.getCurrentContent(obj));
					});
			}
			else {
				obj.autoSaveInterval=setInterval(obj.autoSave,obj.autoSaveTimeout*1000,obj);
			}
		},
		removeOldSave: function(that) {
			var aDel=[];
			for (var i = 0; i < localStorage.length; i++) {
				var key=localStorage.key(i);
				if (key.indexOf("doc01$")==0) {
					var item=localStorage.getItem(key);
					var obj=JSON.parse(item);
					var expire=obj.expireDate;
					if (expire) {
						if (expire<kendo.toString(new Date(),"yyyyMMdd")) {
							aDel.push(key);
						}
					}
					else {
						aDel.push(key);
					}
				}
			}
			for (var j=0;j<aDel.length;j++) {
				localStorage.removeItem(aDel[j]);
			}
		},
		
		onContentShown: function() {    // this function is obsolete (not used)!
			var myObj=this;
			var myBody=this./*uiContainer.*/body;
			$(myBody).find("div[contenteditable='true']").first().focus();
			this.updateKdlLdoState();
			// ?? setTimeout(function() {utils.setDocHeight($(myObj./*uiContainer.*/body))},100);
			this.set("initialContent".this.getCurrentContent(this));
			this.removeOldSave(this);
			this.checkAutoSaved(this);
		},
	
		doClose: function() {
			if (this.autoSaveInterval) {
				clearInterval(this.autoSaveInterval);
				/*
				var key=this.getAutoSaveKey(this);
				try {
					localStorage.removeItem(key);
				}
				catch(e) {

				}
				*/
			}
			try {
                 this.unbindEditor();
            }
            catch (ex) {

            }
			//amplify.unsubscribe("selectedKsg",this.onKsgSelect);

			// ?? this./*oContainer.*/closeDocTab(this.oContainer.currentTabStripIndex);
			// ?? this./*oContainer.*/docTabStrip.select("li:last");

		},
		/*
		createDoc: function(askId,userId,recordId) {
		  // public
		 this.askId=askId;
		 this.userId=userId;
		 $("#fiscal_011_btn").attr("data-uid",this.askId);
		 this.record_id=((recordId) ? recordId : "");
		  if (recordId) {
			this.dsRead.read({
				record_id:recordId,
				user_id: userId
			})
		  }
		  else {
			this.dsCreate.read({
				ask_id:askId,
				user_id: userId,
				doc_id: this.docVid
			})
		  }
		  kendo.ui.progress($("#ibDocs"),true);
		},
		*/
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
						doc_id: {type: "number"},
						doc_html: {
							type: "string"
						}
					}
				}
			},
			change: function(e) {
				this.parentObj.dsReadOk(e);
			},
			error: function(e) {
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
						record_id: {type: "string"},
						doc_id: {type: "number"},
						doc_html: {
							type: "string"
						}
					}
				}
			},
			change: function(e) {
				this.parentObj.dsReadOk(e);
			},
			error: function(e) {
				this.parentObj.dsReadError(e);
			}
		}),
	
		dsReadOk: function(e) {
			kendo.ui.progress($("#ibDocs"),false);
			this.isLoaded=true;
			this.isSaved=false;
			if (e.items[0].record_id) {
				this.recordId= e.items[0].record_id;
			}
//			this.dsReadFiscal.parentObj=this;
//			this.dsReadFiscal.read({ask_id:this.askId,otd_code:this.data.ext1});
			if (this.get("need58")) {
				this.dsGpMkb.read();
				this.dsOt58.read({
					ask_id:this.askId
				});
			}
			// ?? this.dsPenalties.read({user_id:this.userId});
			this.addToContainer(e.items[0].doc_html);
		},
		
		dsReadError: function(e) {
			kendo.ui.progress($("#ibDocs"),true);
			ajax_error(e);
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
	
		dsPenalties: new kendo.data.DataSource({
			serverPaging: false,
			serverSorting: false,
			pageSize: 150,
			transport: {
				read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_penalties",
				dataType: "json"
			},
			requestEnd: utils._onRequestEnd,
			schema: {
				data: "penals.rows",
				total: "records",
				errors: "error"
			},
			change: function(e) {
				var data=this.data();
				var timeout=Math.min(data.length*5,60);
				serverWaitModel.set("serverTimeout",timeout);
			}
		}),

		addToContainer: function(sHtml) {
			var oContainer=this/*.oContainer*/;
			//var newIndex=oContainer.docTabStrip.items().length;
			//var sUuid=Math.uuid(15);
			//var toolBarId="tb_"+sUuid;
			//var documentId="doc_"+sUuid;
			//oContainer.docTabStrip.append([{
			//	text:"Выписка "+newIndex,
			//	content:"<div id='"+toolBarId + "'></div><div class='ib-doc-div' id='"+documentId+"'>"+sHtml+"</div>"
			//}]);
			//this.uiContainer=new uiContainer({body:$("#"+documentId), toolBar:$("#"+toolBarId)});
			//this.createToolBar();
			
			//this.ldoDropDown=$(this.content./*uiContainer.*/toolBar); //.find(".ldo-dropdown").first().kendoDropDownList({
			//this.kdlDropDown=$(this.content./*uiContainer.*/toolBar); //.find(".kdl-dropdown").first().kendoDropDownList({
			
			//oContainer.addDocModel(this);
			//this.prepareContent();
			//this.saveContent();
			this.bindEditor();
			//oContainer.docTabStrip.select("li:last");
			this.onContentShown();
			//oContainer.refreshNotes();
		},
	
		getCurrentContent: function(obj) {
//			var myBody=obj./*uiContainer.*/body;
			var myBody=obj.content;
			var oSave={
				ldoVid:0,
				kdlVid:0,
				dateOut:"",
				divs:[],
				expireDate:""   //dtos formatatted
			};
			
			//data("kendoDropDownList").value();
			
			oSave.ldoVid = obj.ldoDropDown.data("kendoDropDownList").value();
			oSave.kdlVid = obj.kdlDropDown.data("kendoDropDownList").value();
			
			oSave.dateOut=$(myBody).find(".vyp-pac-dateout").first().text();

			$(myBody).find("div[contenteditable='true']").each(function(e){
				oSave.divs.push($(this).html());
			});
			return oSave;
		},

		doOnLdoChange: function(myBody, newVal) {
			$(myBody).find(".vyp-ldo-td-2").each(function(i){
				if (newVal == Number($(this).attr("id0"))) {
					if ($(this).hasClass("div-invisible")) {
						$(this).removeClass("div-invisible");
						$(this).removeClass("no-print");
					}
				}
				else {
					if (! $(this).hasClass("div-invisible")) {
						$(this).addClass("div-invisible");
					}
					if (! $(this).hasClass("no-print")) {
						$(this).addClass("no-print");
					}
				}
			});
		},
		
		doOnKdlChange: function (myBody, newVal) {
			$(myBody).find(".vyp-lab-vid").each(function(i){
				if ((i + 1) == newVal) {
					if ($(this).hasClass("div-invisible")) {
						$(this).removeClass("div-invisible");
						$(this).removeClass("no-print");
					}
				}
				else {
					if (! $(this).hasClass("div-invisible")) {
						$(this).addClass("div-invisible");
					}
					if (! $(this).hasClass("no-print")) {
						$(this).addClass("no-print");
					}
				}
			});
		},
        get58Count: function() {
            var docsData=ibDocsDs.data();
            var cnt58=0;
            for (var i=0; i<docsData.length;i++) {
                if (docsData[i].doc_id==58) {
                    cnt58=cnt58+1;
                    if (docsData[i].ext2) {
                        if (docsData[i].ext2.indexOf("ОКОНЧАТЕЛЬНОЕ")>=0) {
                            cnt58=2;
                            break;
                        }
                    }
                }
            }
            return cnt58;
        },
        get59SendedCount: function() {
            var docsData=ibDocsDs.data();
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
            var docsData=ibDocsDs.data();
            var cnt59=0;
            for (var i=0; i<docsData.length;i++) {
                if (docsData[i].doc_id==59) {
                    cnt59=cnt59+1;
                }
            }
            return cnt59;
        },
		get72Count: function() {
            var docsData=ibDocsDs.data();
            var cnt72=0;
            for (var i=0; i<docsData.length;i++) {
                if (docsData[i].doc_id==72) {
                    cnt72=cnt72+1;
                }
            }
            return cnt72;
        },
		get73Count: function() {
            var docsData=ibDocsDs.data();
            var cnt73=0;
            for (var i=0; i<docsData.length;i++) {
                if (docsData[i].doc_id==73) {
                    cnt73=cnt73+1;
                }
            }
            return cnt73;
        },
        getNoVypReason:function() {
            var sRet="";
            var cnt58=this.get58Count();
            if (cnt58==1) {
                sRet="Не сформировано окончательное извещение о пневмонии!";
            }
            return sRet;
        },
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
        ds58ReadOk: function(e) {
            kendo.ui.progress($("#ibDocs"),false);
            this.ot58.isReaded=true;
            if (e.items.length) {
                this.ot58.isExists=true;
                this.ot58.sMkb= e.items[0].mkb;
                this.ot58.nStepen=e.items[0].stepen;
                this.ot58.nBerem=e.items[0].berem;
            }
            else {
                this.ot58.isExists=false;
                this.ot58.sMkb="";
                this.ot58.nStepen="";
                this.ot58.nBerem="";
            }
        },

        initialize: function(data) {
            DocBase.fn.initialize.call(this,data);
            try {
                $(this.toolbar).kendo.destroy();
            }
            catch (e) {
            }
            this.set("need58Date",new Date(2017,11,1));  //month (0-11) дебилизм
            this.set("need58",this.get58Count());

            this.createToolbar();
            this.changeRawServerContent();
            this.updateKdlLdoState();
            this.bindDateout();
			
			var selIb = proxy.getSessionObject("selectedIb");
			this.askId = selIb.ask_id;
			this.userId = Number(localStorage['last_user']);
			$("#fiscal_011_btn").attr("data-uid", this.askId);
			this.record_id = ((selIb.recordId) ? selIb.recordId : "");
            this.removeOldSave(this);
            if (!this.isReadOnly()) {
                this.checkAutoSaved(this);
            }
            this.set("initialContent",this.getCurrentContent(this));

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

            if (this.get("need58")) {
                this.dsGpMkb.read();
                this.get("dsOt58").read({
                    ask_id:this.askId
                });
            }

//            this.dsReadOk(data);


            /*
            if (selIb.recordId) {
                this.dsRead.read({
                    record_id: selIb.recordId,
                    user_id: this.userId
                })
            }
            else {
                this.dsCreate.read({
                    ask_id: this.askId,
                    user_id: this.userId,
                    doc_id: this.docVid
                })
            }
            kendo.ui.progress($("#ibDocs"),true);
            */
        }
    });

    return Doc01;
});