/**
 * Created by 1 on 09.12.2015.
 */
define(["kendo.all.min",'dataSources/ibDnevListDataSource','dataSources/ibDnevDataSource',
        'docs/docFactory','utils','services/proxyService','alertify','dataSources/fiscalDataSource',
        'viewModels/fiscalEditor', 'viewModels/selectDocVid','dataSources/ibRecomDataSource','viewModels/mainMenuVm',
        'services/cadesService',
        'Math.uuid'],
function(kendo,ibDnevListDs,ibDnevDs,docFactory,utils,proxy,alertify,fiscalDs,fiscalEditor,createDialog,dsRecom,mainMenuVm,
         cadesService){
    var emptyUrl="html/Stacdoct_main/app/views/emptyContent.html";
//    var divStyle='overflow:scroll;height:460px';
    var recomDs=dsRecom;
    var divStyle='overflow-y:scroll;height:90%';
    var tabsArrayDnev=new Array();
    var currentTabDnev=0;
    var fixedTabsDnev=1;
    var fiscalStartDate=new Date(2015,0,1);  //month (0-11) дебилизм
    var extMessage=null;
    var gridSelectorDnev="#ibDnevGrid";
    var gridToolbarSelectorDnev="#ibDnev_Toolbar";
    var gridToolbarSelectorDnev2="#ibDnev_Toolbar2";
	var medsystemPath = location.origin + "/medsystem/gb2ajax/home/";

    function findDnevVid(ds,suffix) {
        var sRet="";
        var aRet=[];
        if (!ds._data) {
            return sRet;
        }
        if (!ds._data.length) {
            return sRet;
        }

        for (var i=0; i<ds._data.length;i++) {
            var item=ds._data[i];
            if (item.doc_id==suffix.doc_id) {
                if (suffix.doc_sub) {
                    if (item.subtype==suffix.doc_sub) {
                        aRet.push(item.record_id);
                    }
                }
                else {
                    if (suffix.ext2) {
                        if (item.ext2.indexOf(suffix.ext2)>=0) {
                            aRet.push(item.record_id);
                        }
                    }
                    else {
                        aRet.push(item.record_id);
                    }
                }
            }
        }
        if (aRet.length) {
            sRet=aRet.pop();
        }
        return sRet;
    };
    function findDnevVid2(tabsArrayDnev,suffix) {
        var iRet=0;
        var aRet=[];
        if (!tabsArrayDnev.length) {
            return iRet;
        }
        for (var i=0; i<tabsArrayDnev.length;i++) {
            var master=tabsArrayDnev[i].master;

            if (master.docVid==suffix.doc_id) {
                if (suffix.doc_sub) {
                    if (master.docSub==suffix.doc_sub) {
                        aRet.push(i);
                    }
                }
                else {
                    if (suffix.ext2) {
                        if (master.get("ext2")) {
                            if (master.get("ext2").indexOf(suffix.ext2) >= 0) {
                                aRet.push(i);
                            }
                        }
                    }
                }
            }
        }
        if (aRet.length) {
            iRet=(aRet.pop())+fixedTabsDnev;
        }
        return iRet;
    };
    function processSuffix(ds) {
        var suffix=viewModel.get("suffix") || {};
        if (suffix.goto=='ib-dnev') {
            if (suffix.doc_id) {
                var subType=suffix.doc_sub;
                var recordId=(findDnevVid(ds,suffix));
                if (!recordId) {
                    var tabIndex=findDnevVid2(tabsArrayDnev,suffix);
                    if (tabIndex) {
                        var tabStrip=$("#dnev_tabs").data("kendoTabStrip");
                        tabStrip.select(tabIndex);
                    }
                    else {
                        viewModel.set("last_suffix",suffix);
                        onCreateDnev({doc_vid:suffix.doc_id,
                            doc_sub:suffix.doc_sub, copyFrom:""
                        })
                    }
                }
                else {
                    proxy.publish("navigateCommand", "#/get-dnev/"+recordId);
                }
            }
        }
        viewModel.set("suffix",{});
    };
    function genHtmlForTab(sContent,sUuid) {
        return "<div id='"+sUuid+"'><div class='doc-toolbar'></div><div style='"+divStyle+"' class='doc-content'>"+sContent+"</div><div class='div-invisible printable'></div></div>";
    };
    var resizeGrid=function() {
        var height=utils.getAvailableHeight()-50-57;
        $(gridSelectorDnev).css("height",height.toString()+"px");
    };
    var bindWidgets=function() {
        kendo.bind($(gridSelectorDnev),viewModel);
        kendo.bind($(gridToolbarSelectorDnev2),viewModel);
        kendo.bind($(gridToolbarSelectorDnev),viewModel);
        try {
			$("#datePickerPrintStart").kendoDatePicker();
			$("#datePickerPrintEnd").kendoDatePicker();
			
            var grid = $(gridSelectorDnev).data("kendoGrid");
            grid.dataSource.pageSize(grid.dataSource.total());
            resizeGrid();
            grid.resize();
            grid.refresh();
        }
        catch (ex) {

        }
    };
    var restoreTabs=function(data) {
        var tabStrip=$("#dnev_tabs").data("kendoTabStrip");
        for(var i=0;i<tabsArrayDnev.length;i=i+1) {
            var tab=tabsArrayDnev[i];
            var newTab=tabStrip.append({text:tab.text,encoded:tab.encoded,content:emptyUrl});
            var sHtml=genHtmlForTab(tab.content,tab.uuid);
            $(tabStrip.contentElement(i+fixedTabsDnev)).html(sHtml);
            tab.master.initialize({record_id:tab.record_id});
        }
        tabStrip.select(currentTabDnev);
        if (data) {
            extMessage=data;
            onCreateDnev({doc_vid:data.docVid,
                doc_sub:data.docSub, copyFrom:data.recordId
            })
        }
    };
    var viewModel;
    viewModel = new kendo.data.ObservableObject({
        isAllCases:null,
        updateCountDnev:0,
        ibDnevListDs: ibDnevListDs,
		dateStart: Date(),
		dateEnd: Date(),
        showSignsDetails: function(e) {
            //    console.log(e);
            var ds=viewModel.get("ibDnevListDs");
            var tr = $(e.target).closest("tr");
            var uid=$(tr).attr("data-uid");
            var dataItem=ds.getByUid(uid);
            if (dataItem) {
                cadesService.showSignsInfo(dataItem);
            }
        },
        deleteAction: function(e) {
            e.preventDefault();
            var selIb=proxy.getSessionObject("selectedIb");
            var ds=viewModel.get("ibDnevListDs");
            var tr = $(e.target).closest("tr");
            var uid=$(tr).attr("data-uid");
            var dataItem=ds.getByUid(uid);
            if (dataItem) {
                if (!(dataItem.ask_id===selIb.ask_id)) {
                    alertify.alert("Нельзя удалить документ другого случая!");
                    return;
                }
                if (dataItem.user_id==Number(localStorage['last_user'])) {
                    if (!(findDnev(dataItem.record_id))) {
                        if (!selIb.date_omo) {
                            var sConfirm="Удалить документ '"+dataItem.doc_name+
                                "' от "+kendo.toString(dataItem.doc_date,"dd.MM.yyyy"+
                                "?<br>Документ будет удален без возможности восстановления!");
                            alertify.confirm(sConfirm, function (e) {
                                if (e) {
//                                    alert("Будет удален!");
                                    ibDnevDs.dsDelete.read({record_id:dataItem.record_id});
                                }
                            })
                        }
                        else {
                            alertify.alert("Нельзя удалить документ из ИБ, сданной в архив!");
                        }
                    }
                    else {
                        alertify.alert("Нельзя удалить открытый документ!");
                    }
                }
                else {
                    alertify.alert("Только создатель документа имеет право на его удаление!");
                }
            }
        },
        isCreateVisible: function(){
            if (utils.isViewer()) {
                return false;
            }
            var selIb=proxy.getSessionObject("selectedIb");
            if (!selIb) {
                return false;
            }
            if (selIb.is_ldo) {
                return false;
            }
            return true;
        },
        isAllCasesVisible: function() {
            if (utils.isViewer()) {
                return false;
            }
            return true;
        },
        isDeleteVisible: function() {
            if (utils.isViewer()) {
                return false;
            }
            var selIb=proxy.getSessionObject("selectedIb");
            if (selIb.is_ldo) {
                return false;
            }
            return true;
        },
        onTabSelect: function(e) {
            if (currentTabDnev>=fixedTabsDnev) {
                var doc=tabsArrayDnev[currentTabDnev-fixedTabsDnev].master;
                doc.onDeactivate();
            }
            currentTabDnev=Math.max($(e.item).index(),0);
            if (currentTabDnev>=fixedTabsDnev) {
                setTimeout(function(){
                    var doc=tabsArrayDnev[currentTabDnev-fixedTabsDnev].master;
                    doc.onActivate();
                },50);
            }
            // console.log("selected tab="+currentTabDnev.toString());
        },
        onDnevRefresh: function() {
            viewModel.isAllCases=null;
            viewModel.set("isAllCases",false);
            proxy.setSessionObject("forAllCases",viewModel.get("isAllCases"));
            ibDnevListDs.read()
                .then(function() {
                    bindWidgets();
                    processSuffix(ibDnevListDs);
                });
            viewModel.set("updateCountDnev",0);
        },
        onDnevRefreshAll: function() {
            viewModel.isAllCases=null;
            viewModel.set("isAllCases",true);
            proxy.setSessionObject("forAllCases",viewModel.get("isAllCases"));
            ibDnevListDs.read()
                .then(function() {
                    bindWidgets();
                    processSuffix(ibDnevListDs);
                });
            viewModel.set("updateCountDnev",0);
        },
		onPrint: function() {
			var selIb = proxy.getSessionObject("selectedIb");
			var myData = { 
				askId: selIb.ask_id, 
				start: kendo.toString(new Date(this.dateStart), "dd.MM.yyyy"), 
				end: kendo.toString(new Date(this.dateEnd), "dd.MM.yyyy") 
			};
			$.ajax({
				type: "GET",
				url: medsystemPath + "DnevForPrint",
				dataType: "json",
				data: myData,
				success: function(data,textStatus) {
					var myBody = data.Doc;
					var savedStyle=$(myBody).attr("style");
					var sHtml = $(myBody).html();
					sHtml="<div class='osmotr-print'>"+sHtml+"</div>";
					$(myBody).html(sHtml);
					$(myBody).removeAttr("style");
					$(myBody).jqprint();
					$(myBody).html(sHtml);
					$(myBody).attr("style",savedStyle);
				},
				error: function (jqXHR, exception) {
					alert(jqXHR.STATUS + " " + jqXHR.message + " " + exception);
				}
			});
        },
        update: function(data) {
            if (viewModel.get("updateCountDnev")) {
                viewModel.onDnevRefresh();
            }
            else {
                setTimeout(function() {
                    viewModel.ibDnevListDs.trigger("change");
                    bindWidgets();
                    processSuffix(ibDnevListDs);
                },50);
            }
            restoreTabs(data);
        },
        createClick: function(e) {
            proxy.publish("createDnev",{
				doc_vid:69,
				doc_sub:1,
				extData:null
			});

        },
		createZamClick: function(e) {
            proxy.publish("createDnev",{
				doc_vid:70,
				doc_sub:1,
				extData:null
			});
        },
        closeTab: function(e) {
            console.log('close');
        },
        onDataBinding: function(e) {
            if (utils.isViewer()) {
                var grid= e.sender;
                grid.hideColumn("del_doc");
            }
        }

    });
    var onSelectedIbChangedDnev=function(data) {
        viewModel.set("updateCountDnev",viewModel.get("updateCountDnev")+1);
        tabsArrayDnev=new Array();
    };
    var docTitle=function(iDocId) {
        var sRet="Дневник";
        return sRet;
    };
    var tryReadFiscal=function(data) {
        var selIb=proxy.getSessionObject("selectedIb");
        var dateOut=new Date();
        if (selIb.date_out) {
            dateOut=kendo.parseDate(selIb.date_out);
        };
        if ((data.doc_id===1) && (dateOut>=fiscalStartDate)   ) {
            fiscalDs.dsRead.read({ask_id: selIb.ask_id,otd_code:data.ext1});
        };
    };
    var onDnevLoaded=function(e) {
        kendo.ui.progress($("#ib-dnev"),false);
        if (!(e.items.length)) {
            return;
        }
        var data;
        try {
            data=e.sender.get(viewModel.get("record_id"));
        }
        catch (ex) {
        }
        if (!data) {
            data=e.items[0];
        }
        var tabStrip=$("#dnev_tabs").data("kendoTabStrip");
        var text=docTitle(data.doc_id)+" "+(tabsArrayDnev.length+1);

        var newTab=tabStrip.append({text:text,encoded:false,contentUrl:emptyUrl});
        currentTabDnev=tabsArrayDnev.length+1;
        var content= data.doc_html;
        var sUuid=Math.uuid(15);
        var sHtml=genHtmlForTab(content,sUuid);
        $(tabStrip.contentElement(currentTabDnev)).html(sHtml);
        tabsArrayDnev.push({text:text,encoded:false,content:content,
            doc_id:data.doc_id,record_id: data.record_id,
            uuid: sUuid,
            oldAskId:data.ask_id,
            master:docFactory.createDoc(data,sUuid)
        });
        tabsArrayDnev[tabsArrayDnev.length-1].master.initialize(data,e.sender.data());
        if (extMessage) {
            tabsArrayDnev[tabsArrayDnev.length-1].master.doCopyToNew(extMessage);
            extMessage=null;
        }
        tabStrip.select(currentTabDnev);

        var suffix=viewModel.get("last_suffix") || {};

        if (suffix.ext2) {
            tabsArrayDnev[tabsArrayDnev.length-1].master.set("ext2",suffix.ext2);
        }
        viewModel.set("last_suffix",{});

        if (data.doc_id==1) {
            tryReadFiscal(data);
        }
    };
    var findDnev=function(recId) {
        var iRet=0;
        for(var i=0;i<tabsArrayDnev.length;i=i+1) {
            var tab=tabsArrayDnev[i];
            if (tab.record_id===recId) {
                iRet=i+fixedTabsDnev;
                break;
            }
        }
        return iRet;
    };
    var findTabByUid=function(uuid) {
        var iRet=-1;
        for(var i=0;i<tabsArrayDnev.length;i=i+1) {
            var tab=tabsArrayDnev[i];
            if (tab.uuid===uuid) {
                iRet=i;
                break;
            }
        }
        return iRet;
    };
    var onFiscalReaded=function(e) {
        // 25/04/2021
        if (e.action) {
            if (e.action=="itemchange") {
                return;
            }
        }
        //
        if (!(e.items.length)) {
            tabsArrayDnev[currentTabDnev-1].master.set("fiscal",null);
        }
        else {
            tabsArrayDnev[currentTabDnev-1].master.set("fiscal", e.items[e.items.length-1]);
        }
    };
    var onGetDnev=function(data) {
        var iTab=findDnev(data);
        // iTab=0;
        if (!iTab) {
            viewModel.set("record_id",data);
            ibDnevDs.dsGet.read({record_id: data});
            kendo.ui.progress($("#ib-dnev"),true);
        }
        else {
            var tabStrip=$("#dnev_tabs").data("kendoTabStrip");
            tabStrip.select(iTab);
        }
    };
	var onGetDnevOpen=function(data) {
		var iTab=findDnev(data);
        if (!iTab) {
            viewModel.set("record_id",data);
            ibDnevDs.dsGet.read({record_id: data});
            kendo.ui.progress($("#ib-dnev"),true);
        }
        else {
            var tabStrip=$("#dnev_tabs").data("kendoTabStrip");
            tabStrip.select(iTab);
        }
		setTimeout(function() {
			var i = !iTab ? tabsArrayDnev.length - 1 : iTab;
			var tab = tabsArrayDnev[i].master;
			tab.openFormWindow("edit");
		}, 5000);
	};
    var onDnevChanged =function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArrayDnev[i].content=data.content;
            tabsArrayDnev[i].master.changeCount++;
        }
    };
    var closeDnevTab=function(i) {
        var tabStrip=$("#dnev_tabs").data("kendoTabStrip");
        tabStrip.remove(i+fixedTabsDnev);
        tabsArrayDnev.splice(i,1);
        currentTabDnev=tabsArrayDnev.length;
        tabStrip.select(tabsArrayDnev.length);
    };
    var onDnevClose=function(data) {
        var selIb = proxy.getSessionObject("selectedIb");
        var i=findTabByUid(data.uuid);

        if (i>=0) {
            var tab=tabsArrayDnev[i];
            if (!(selIb.is_ldo)) {
                if (tab.master.changeCount && (tab.master.changeQuestion)) {
                    alertify.confirm(tab.master.changeQuestion, function (e) {
                        if (e) {
                            tab.master.saveMe(true);
                        }
                        else {
                            closeDnevTab(i);
                        }
                    });
                    return;
                }
                if (!(tab.master.recordId) && (tab.master.saveQuestion)) {
                    alertify.confirm(tab.master.saveQuestion, function (e) {
                        if (e) {
                            tab.master.saveMe(true);
                        }
                        else {
                            closeDnevTab(i);
                        }
                    });
                    return;
                }
            }
            closeDnevTab(i);
        }
    };
    var onChangeDateOut=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArrayDnev[i].master.changeDateOut(data.dateout);
        }

    };
    var onSpeechResult=function(data) {
        if (data.subscriberId) {
            var i=findTabByUid(data.subscriberId);
            if (i>=0) {
                tabsArrayDnev[i].master.setSpeechResult(data);
            }
        }
    };
    var onAutoCompleteResult=function(data) {
        tabsArrayDnev[currentTabDnev-1].master.setAutoCompleteResult(data);
    };
    var onCreateDnev=function(data) {
        var userRole=JSON.parse(sessionStorage['last_user_role']);

        var selIb=proxy.getSessionObject("selectedIb");
        ibDnevDs.dsCreate.read({
            ask_id:selIb.ask_id,
            user_id:Number(localStorage['last_user']),
            doc_id:data.doc_vid,
            doc_sub:data.doc_sub,
            ext_data:JSON.stringify(data.extData)
        });
        kendo.ui.progress($("#ib-dnev"),true);
    };
    var onDnevCreated=function(e) {
        onDnevLoaded(e);
    };
    var onNoteSave=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArrayDnev[i].master.setNote(data);
        }
    };
    var onSelObjectChanged=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArrayDnev[i].master.selObjectChanged();
        }

    };
    var readIbRecom=function(dataItem,iMode,iRecomId) {
        if (iMode==1) {
            $("#ibRecom").html("");
        }
        if (iMode<3) {
            iRecomId=0;
        }
        recomDs.read({
            recomid: iRecomId,
            ask_id: dataItem.ask_id,
            global_vn: dataItem.global_vn,
            dnst: dataItem.dnst,
            dateask:kendo.toString(new Date(dataItem.date_ask),"yyyyMMdd"),
            dateout: (dataItem.date_out==null) ? "":kendo.toString(new Date(dataItem.date_out),"yyyyMMdd"),
            user_id: (iMode==1) ? Number(localStorage['last_user']) : 0,
            mode: iMode
        }).then(function(){
            if (iMode==4) {
                readIbRecom(dataItem,1);
            }
            if (iMode==1) {
                proxy.publish("ibHeaderSizeChanged");
                if (recomDs._data) {
                    proxy.publish("updateAllRecomendations",(recomDs._data || []));
                }
            }
        })
    };
    var refreshRecoms=function() {
        var selIb=proxy.getSessionObject('selectedIb');
        if (!selIb) {
            return;
        };
        readIbRecom(selIb,4,0);
        /*
        if (Number(localStorage['last_user'])==selIb.user_id) {
            readIbRecom(selIb,1);
        }
//        readIbRecom(selIb,4,0);
        */
    };
    var isNeedUpdateRecoms=function(docVid) {
        var bRet=false;
        if (docVid==58) {
            // пневмония
           bRet=true;
        }
        return bRet;
    };
    var onDnevDeleted=function(e) {
        refreshRecoms();
        viewModel.onDnevRefresh();
    };
    var onDnevSaved=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            var tab=tabsArrayDnev[i];
            tab.master.changeCount=0;
            var prevId=tab.record_id;
            tabsArrayDnev[i].record_id=data.record_id;
//            if (!(prevId) || (prevId==undefined)) {
                // if new doc saved
                if (viewModel.get("isAllCases")) {
                    viewModel.onDnevRefreshAll();
                }
                else {
                    viewModel.onDnevRefresh();
                }
//            }
            if (isNeedUpdateRecoms(tab.master.docVid)) {
                refreshRecoms();
            }
        }
    };
    var resizeDivs=function() {
        if (currentTabDnev>=fixedTabsDnev) {
            var doc=tabsArrayDnev[currentTabDnev-fixedTabsDnev].master;
            doc.resizeDivs();
        }
    };
    var onDocumentSigned=function(data) {
        for(var i=0;i<tabsArrayDnev.length;i=i+1) {
            var master=tabsArrayDnev[i].master;
            if (master && (master.recordId==data.record_id)) {
                master.onDocumentSigned({signs:data.signs,that:master});
                var ds=viewModel.ibDnevListDs;
                var item=ds.get(data.record_id);
                if (item) {
                    item.signed=data.signs.length;
                    item.signs=JSON.stringify({signs:{rows:data.signs}});
                    ds.pushUpdate(item);
/*                    item.set("signed",data.signs.length);
                    item.set("signs",JSON.stringify({signs:{rows:data.signs}})); */
                }
            }
        }
    };
    var onAskIdMayChange=function(data) {
        if (Array.isArray(tabsArrayDnev)) {
            for(var i=0;i<tabsArrayDnev.length;i=i+1) {
                var master = tabsArrayDnev[i].master;
                if (master) {
                    if ((!master.recordId) || (master.changeCount)) {
                        data.count++;
                    }
                }
            }
        }
    };
    //
    proxy.subscribe("selectedIbChangedDnev",onSelectedIbChangedDnev);
    proxy.subscribe("getDnev",onGetDnev);
    proxy.subscribe("getDnevOpen",onGetDnevOpen);
    proxy.subscribe("dnevChanged",onDnevChanged);
    proxy.subscribe("dnevSaved",onDnevSaved);
    proxy.subscribe("dnevClose",onDnevClose);
    //proxy.subscribe("changeDateOut",onChangeDateOut);
    //proxy.subscribe("speechResult",onSpeechResult);
    //proxy.subscribe("autoCompleteResult",onAutoCompleteResult);
    proxy.subscribe("createDnev",onCreateDnev);
    //proxy.subscribe("noteSave",onNoteSave);
    proxy.subscribe("mySelObjectChanged",onSelObjectChanged);
    proxy.subscribe("ibHeaderSizeChanged",function() {
        resizeGrid();
        setTimeout(resizeDivs(),10);
    });
    //proxy.subscribe("documentSigned",onDocumentSigned);
    //proxy.subscribe("askIdMayChange",onAskIdMayChange); // published from router

    ibDnevDs.dsGet.bind("change",onDnevLoaded);
    ibDnevDs.dsCreate.bind("change",onDnevCreated);
    ibDnevDs.dsDelete.bind("change",onDnevDeleted);
    //fiscalDs.dsRead.bind("change",onFiscalReaded);
	//
    return viewModel;
});