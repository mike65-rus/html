/**
 * Created by 1 on 09.12.2015.
 */
define(["kendo.all.min",'dataSources/ibDocsListDataSource','dataSources/ibDocDataSource',
        'docs/docFactory','utils','services/proxyService','alertify','dataSources/fiscalDataSource',
        'viewModels/fiscalEditor', 'viewModels/selectDocVid','dataSources/ibRecomDataSource','viewModels/mainMenuVm',
        'services/cadesService',
        'Math.uuid'],
function(kendo,ibDocsListDs,ibDocDs,docFactory,utils,proxy,alertify,fiscalDs,fiscalEditor,createDialog,dsRecom,mainMenuVm,
         cadesService){
    var emptyUrl="html/Stacdoct_main/app/views/emptyContent.html";
//    var divStyle='overflow:scroll;height:460px';
    var recomDs=dsRecom;
    var divStyle='overflow-y:scroll;height:90%';
    var tabsArray=new Array();
    var currentTab=0;
    var fixedTabs=1;
    var fiscalStartDate=new Date(2015,0,1);  //month (0-11) дебилизм
    var extMessage=null;
    var gridSelector="#ibDocsGrid";
    var gridToolbarSelector="#ibDocs_Toolbar";
    var gridToolbarSelector2="#ibDocs_Toolbar2";

    function findDocVid(ds,suffix) {
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
    function findDocVid2(tabsArray,suffix) {
        var iRet=0;
        var aRet=[];
        if (!tabsArray.length) {
            return iRet;
        }
        for (var i=0; i<tabsArray.length;i++) {
            var master=tabsArray[i].master;

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
            iRet=(aRet.pop())+fixedTabs;
        }
        return iRet;
    };
    function processSuffix(ds) {
        var suffix=viewModel.get("suffix") || {};
        if (suffix.goto=='ib-docs') {
            if (suffix.doc_id) {
                var subType=suffix.doc_sub;
                var recordId=(findDocVid(ds,suffix));
                if (!recordId) {
                    var tabIndex=findDocVid2(tabsArray,suffix);
                    if (tabIndex) {
                        var tabStrip=$("#docs_tabs").data("kendoTabStrip");
                        tabStrip.select(tabIndex);
                    }
                    else {
                        viewModel.set("last_suffix",suffix);
                        onCreateDoc({doc_vid:suffix.doc_id,
                            doc_sub:suffix.doc_sub, copyFrom:""
                        })
                    }
                }
                else {
                    proxy.publish("navigateCommand", "#/get-doc/"+recordId);
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
        $(gridSelector).css("height",height.toString()+"px");
    };
    var bindWidgets=function() {
//        $("#ib-docs").css("height",height.toString()+"px").css("overflow-y","hidden");
        kendo.bind($(gridSelector),viewModel);
        kendo.bind($(gridToolbarSelector2),viewModel);
        kendo.bind($(gridToolbarSelector),viewModel);
        try {
            var grid = $(gridSelector).data("kendoGrid");
            grid.dataSource.pageSize(grid.dataSource.total());
            resizeGrid();
            grid.resize();
            grid.refresh();
        }
        catch (ex) {

        }
    };
    var restoreTabs=function(data) {
        var tabStrip=$("#docs_tabs").data("kendoTabStrip");
        for(var i=0;i<tabsArray.length;i=i+1) {
            var tab=tabsArray[i];
            var newTab=tabStrip.append({text:tab.text,encoded:tab.encoded,content:emptyUrl});
            var sHtml=genHtmlForTab(tab.content,tab.uuid);
            $(tabStrip.contentElement(i+fixedTabs)).html(sHtml);
            tab.master.initialize({record_id:tab.record_id});
        }
        tabStrip.select(currentTab);
        if (data) {
            extMessage=data;
            onCreateDoc({doc_vid:data.docVid,
                doc_sub:data.docSub, copyFrom:data.recordId
            })
        }
    };
    var viewModel;
    viewModel = new kendo.data.ObservableObject({
        isAllCases:null,
        updateCount:0,
        ibDocsListDs: ibDocsListDs,
        showSignsDetails: function(e) {
            //    console.log(e);
            var ds=viewModel.get("ibDocsListDs");
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
            var ds=viewModel.get("ibDocsListDs");
            var tr = $(e.target).closest("tr");
            var uid=$(tr).attr("data-uid");
            var dataItem=ds.getByUid(uid);
            if (dataItem) {
                if (!(dataItem.ask_id===selIb.ask_id)) {
                    alertify.alert("Нельзя удалить документ другого случая!");
                    return;
                }
                if (dataItem.user_id==Number(localStorage['last_user'])) {
                    if (!(findDoc(dataItem.record_id))) {
                        if (!selIb.date_omo) {
                            var sConfirm="Удалить документ '"+dataItem.doc_name+
                                "' от "+kendo.toString(dataItem.doc_date,"dd.MM.yyyy"+
                                "?<br>Документ будет удален без возможности восстановления!");
                            alertify.confirm(sConfirm, function (e) {
                                if (e) {
//                                    alert("Будет удален!");
                                    ibDocDs.dsDelete.read({record_id:dataItem.record_id});
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
            if (currentTab>=fixedTabs) {
                var doc=tabsArray[currentTab-fixedTabs].master;
                doc.onDeactivate();
            }
            currentTab=Math.max($(e.item).index(),0);
            if (currentTab>=fixedTabs) {
                setTimeout(function(){
                    var doc=tabsArray[currentTab-fixedTabs].master;
                    doc.onActivate();
                },50);
            }
            // console.log("selected tab="+currentTab.toString());
        },
        onRefresh: function() {
            viewModel.isAllCases=null;
            viewModel.set("isAllCases",false);
            proxy.setSessionObject("forAllCases",viewModel.get("isAllCases"));
            ibDocsListDs.read()
                .then(function() {
                    bindWidgets();
                    processSuffix(ibDocsListDs);
                });
            viewModel.set("updateCount",0);
        },
        onRefreshAll: function() {
            viewModel.isAllCases=null;
            viewModel.set("isAllCases",true);
            proxy.setSessionObject("forAllCases",viewModel.get("isAllCases"));
            ibDocsListDs.read()
                .then(function() {
                    bindWidgets();
                    processSuffix(ibDocsListDs);
                });
            viewModel.set("updateCount",0);
        },
        update: function(data) {
            if (viewModel.get("updateCount")) {
                viewModel.onRefresh();
            }
            else {
                setTimeout(function() {
                    viewModel.ibDocsListDs.trigger("change");
                    bindWidgets();
                    processSuffix(ibDocsListDs);
                },50);
            }
            restoreTabs(data);
        },
        createClick: function(e) {
            var data={selIb:proxy.getSessionObject("selectedIb")};
            createDialog.open(data);

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
    var onSelectedIbChanged=function(data) {
        viewModel.set("updateCount",viewModel.get("updateCount")+1);
        tabsArray=new Array();
    };
    var docTitle=function(iDocId) {
        var sRet="Выписка";
        if (iDocId==11) {
            sRet="Осмотр";
        }
        if (iDocId==31) {
            sRet="Направление в другое ЛПУ";
        }
        if (iDocId==57) {
            sRet="Извещение об отравлении";
        }
        if (iDocId==58) {
            sRet="Извещение в СЭС";
        }
        if (iDocId==59) {
            sRet="Онко-документация";
        }
        if (iDocId==60) {
            sRet="Заявка на кровь";
        }
        if (iDocId==61) {
            sRet="Посмертный эпикриз";
        }
        if (iDocId==62) {
            sRet="Суицидальный случай";
        }
        if (iDocId==63) {
            sRet="Протокол ВК";
        }
        if (iDocId==64) {
            sRet="Протокол";
        }
		if (iDocId==65) {
            sRet="Протокол КИЛИ";
        }
		if (iDocId==66) {
            sRet="Протокол РМДК";
        }
		if (iDocId==67) {
            sRet="Переводной эпикриз";
        }
		if (iDocId==68) {
            sRet="Консультация";
        }
		if (iDocId==71) {
            sRet="Извещение КВД";
        }
		if (iDocId==72) {
            sRet="Статкарта";
        }
		if (iDocId==73) {
            sRet="Статкарта";
        }
		if (iDocId==74) {
            sRet="Рецензия КИЛИ";
        }

        return sRet;
    };
    var tryReadFiscal=function(data) {
        var selIb=proxy.getSessionObject("selectedIb");
        var dateOut=new Date();
        if (selIb.date_out) {
            dateOut=kendo.parseDate(selIb.date_out);
        };
        if ((data.doc_id===1 || data.doc_id===61) && (dateOut>=fiscalStartDate)   ) {
            fiscalDs.dsRead.read({ask_id: selIb.ask_id,otd_code:data.ext1});
        };
    };
    var onDocLoaded=function(e) {
        kendo.ui.progress($("#ib-docs"),false);
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
        var tabStrip=$("#docs_tabs").data("kendoTabStrip");
        var text=docTitle(data.doc_id)+" "+(tabsArray.length+1);

        var newTab=tabStrip.append({text:text,encoded:false,contentUrl:emptyUrl});
        currentTab=tabsArray.length+1;
        var content= data.doc_html;
        var sUuid=Math.uuid(15);
        var sHtml=genHtmlForTab(content,sUuid);
        $(tabStrip.contentElement(currentTab)).html(sHtml);
        tabsArray.push({text:text,encoded:false,content:content,
            doc_id:data.doc_id,record_id: data.record_id,
            uuid: sUuid,
            oldAskId:data.ask_id,
            master:docFactory.createDoc(data,sUuid)
        });
        tabsArray[tabsArray.length-1].master.initialize(data,e.sender.data());
        if (extMessage) {
            tabsArray[tabsArray.length-1].master.doCopyToNew(extMessage);
            extMessage=null;
        }
        tabStrip.select(currentTab);

        var suffix=viewModel.get("last_suffix") || {};

        if (suffix.ext2) {
            tabsArray[tabsArray.length-1].master.set("ext2",suffix.ext2);
        }
        viewModel.set("last_suffix",{});

        if (data.doc_id==1 || data.doc_id==61) {
            tryReadFiscal(data);
        }
    };
    var findDoc=function(recId) {
        var iRet=0;
        for(var i=0;i<tabsArray.length;i=i+1) {
            var tab=tabsArray[i];
            if (tab.record_id===recId) {
                iRet=i+fixedTabs;
                break;
            }
        }
        return iRet;
    };
    var findTabByUid=function(uuid) {
        var iRet=-1;
        for(var i=0;i<tabsArray.length;i=i+1) {
            var tab=tabsArray[i];
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
            tabsArray[currentTab-1].master.set("fiscal",null);
        }
        else {
            tabsArray[currentTab-1].master.set("fiscal", e.items[e.items.length-1]);
        }
    };
    var onGetDocument=function(data) {
        var iTab=findDoc(data);
        // iTab=0;
        if (!iTab) {
            viewModel.set("record_id",data);
            ibDocDs.dsGet.read({record_id: data});
            kendo.ui.progress($("#ib-docs"),true);
        }
        else {
            var tabStrip=$("#docs_tabs").data("kendoTabStrip");
            tabStrip.select(iTab);
        }
    };
    var onDocChanged =function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArray[i].content=data.content;
            tabsArray[i].master.changeCount++;
        }
    };
    var closeDocTab=function(i) {
        var tabStrip=$("#docs_tabs").data("kendoTabStrip");
        tabStrip.remove(i+fixedTabs);
        tabsArray.splice(i,1);
        currentTab=tabsArray.length;
        tabStrip.select(tabsArray.length);
    };
    var onDocClose=function(data) {
        var selIb = proxy.getSessionObject("selectedIb");
        var i=findTabByUid(data.uuid);

        if (i>=0) {
            var tab=tabsArray[i];
            if (!(selIb.is_ldo)) {
                if (tab.master.changeCount && (tab.master.changeQuestion)) {
                    alertify.confirm(tab.master.changeQuestion, function (e) {
                        if (e) {
                            tab.master.saveMe(true);
                        }
                        else {
                            closeDocTab(i);
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
                            closeDocTab(i);
                        }
                    });
                    return;
                }
				var ext3 = "";
				if (tab.master.parts) {
					ext3 = tab.master.parts[0].ext3;
				}
				if (tab.master.data) {
					ext3 = tab.master.data.ext3;
				}
				if ((tab.master.recordId) && (tab.master.sendQuestion) && (ext3 == "") && !(tab.master.isSaved)) {
					alertify.confirm(tab.master.sendQuestion, function (e) {
                        if (e) {
							if (tab.master.validate()) {
								tab.master.saveMe(1);
							}
                        }
                        else {
                            closeDocTab(i);
                        }
                    });
                    return;
				}
            }
            closeDocTab(i);
        }
    };
    var onOpenFiscal=function(data) {
        fiscalEditor.edit(data.fiscal,data.date_ask,data.date_out,data.otd,
            data.perevod,tabsArray[currentTab-1].uuid,data.forceReadFss);
    };
    var onFiscalSave=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArray[i].master.fiscal=null;
            tabsArray[i].master.set("fiscal",data.fiscal);
        }
    };
    var onChangeDateOut=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArray[i].master.changeDateOut(data.dateout);
        }

    };
    var onSpeechResult=function(data) {
        if (data.subscriberId) {
            var i=findTabByUid(data.subscriberId);
            if (i>=0) {
                tabsArray[i].master.setSpeechResult(data);
            }
        }
    };
    var onAutoCompleteResult=function(data) {
        tabsArray[currentTab-1].master.setAutoCompleteResult(data);
    };
    var onCreateDoc=function(data) {
//        console.log("createDoc doc_vid="+data.doc_vid+" doc_sub="+data.doc_sub);
        var userRole=JSON.parse(sessionStorage['last_user_role']);
        // 21.06.2019
        if (userRole.rolecode=="VRACH_DEGURANT") {
            if (data.doc_id==58) {
                kendo.alert("С 21.06.2019 извещение о пневмонии заполняется<br>в АРМ дежурной мед. сестры приемного отделения!");
                return;
            }
        }

        var selIb=proxy.getSessionObject("selectedIb");
        ibDocDs.dsCreate.read({
            ask_id:selIb.ask_id,
            user_id:Number(localStorage['last_user']),
            doc_id:data.doc_vid,
            doc_sub:data.doc_sub,
            ext_data:JSON.stringify(data.extData)
        });
        kendo.ui.progress($("#ib-docs"),true);
    };
    var onDocCreated=function(e) {
        onDocLoaded(e);
    };
    var onNoteSave=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArray[i].master.setNote(data);
        }
    };
    var onSelObjectChanged=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            tabsArray[i].master.selObjectChanged();
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
    var onDocDeleted=function(e) {
        refreshRecoms();
        viewModel.onRefresh();
    };
    var onDocSaved=function(data) {
        var i=findTabByUid(data.uuid);
        if (i>=0) {
            var tab=tabsArray[i];
            tab.master.changeCount=0;
            var prevId=tab.record_id;
            tabsArray[i].record_id=data.record_id;
//            if (!(prevId) || (prevId==undefined)) {
                // if new doc saved
                if (viewModel.get("isAllCases")) {
                    viewModel.onRefreshAll();
                }
                else {
                    viewModel.onRefresh();
                }
//            }
            if (isNeedUpdateRecoms(tab.master.docVid)) {
                refreshRecoms();
            }
        }
    };
    var resizeDivs=function() {
        if (currentTab>=fixedTabs) {
            var doc=tabsArray[currentTab-fixedTabs].master;
            doc.resizeDivs();
        }
    };
    var onDocumentSigned=function(data) {
        for(var i=0;i<tabsArray.length;i=i+1) {
            var master=tabsArray[i].master;
            if (master && (master.recordId==data.record_id)) {
                master.onDocumentSigned({signs:data.signs,that:master});
                var ds=viewModel.ibDocsListDs;
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
        if (Array.isArray(tabsArray)) {
            for(var i=0;i<tabsArray.length;i=i+1) {
                var master = tabsArray[i].master;
                if (master) {
                    if ((!master.recordId) || (master.changeCount)) {
                        data.count++;
                    }
                }
            }
        }
    };
    //
    proxy.subscribe("selectedIbChanged",onSelectedIbChanged);
    proxy.subscribe("getDocument",onGetDocument);
    proxy.subscribe("docChanged",onDocChanged);
    proxy.subscribe("docSaved",onDocSaved);
    proxy.subscribe("docClose",onDocClose);
    proxy.subscribe("openFiscal",onOpenFiscal);
    proxy.subscribe("fiscalSave",onFiscalSave);
    proxy.subscribe("changeDateOut",onChangeDateOut);
    proxy.subscribe("speechResult",onSpeechResult);
    proxy.subscribe("autoCompleteResult",onAutoCompleteResult);
    proxy.subscribe("createDoc",onCreateDoc);
    proxy.subscribe("noteSave",onNoteSave);
    proxy.subscribe("mySelObjectChanged",onSelObjectChanged);
    proxy.subscribe("ibHeaderSizeChanged",function() {
        resizeGrid();
        setTimeout(resizeDivs(),10);
    });
    proxy.subscribe("documentSigned",onDocumentSigned);
    proxy.subscribe("askIdMayChange",onAskIdMayChange); // published from router

    ibDocDs.dsGet.bind("change",onDocLoaded);
    ibDocDs.dsCreate.bind("change",onDocCreated);
    ibDocDs.dsDelete.bind("change",onDocDeleted);
    fiscalDs.dsRead.bind("change",onFiscalReaded);
    //
    return viewModel;
});