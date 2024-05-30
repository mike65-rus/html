define(['kendo.all.min','utils','classes/generalTab','docs/docFactory','kendo-template!views/patientCardDocs',
        'viewModels/selectDocVid',
        'viewModels/selectDistDocVid',
        'services/proxyService','dataSources/pkDocsListDataSource','dataSources/periodDocsDataSource',
        'dataSources/pkDocDataSource',
        'dataSources/mayBeCreatedOnSrcDataSource',
        'alertify',
        'Math.uuid'

    ],
    function(kendo,utils,GeneralTab,docFactory,viewId,createDialog,createDistDialog,
             proxy,visitsListDs,dsPeriod,ibDocDs,
             mayBeCreatedDs,alertify) {
        'use strict';
        var contentHtml=$("#"+viewId).html();
        var myTabStripOrder=0;
        var myTabStripName="docs";
        var defaultPeriodIndex=0;
        var myTabStrip=null;
        var isMyTabCurrent=false;
        var gridSelector="#pk_docs_grid";
        var gridDs=visitsListDs;
        var periodDs=dsPeriod;
        var visitTab="visit";
        var visitTabMain="main";
        var factory=docFactory;

        var divStyle='overflow-y:scroll;height:95%';
        var tabsArray=new Array();
        var currentTab=0;
        var fixedTabs=1;
        var extMessage=null;
        var gridToolbarSelector="#pk_docs_grid_toolbar";
        var emptyUrl="html/Stacdoct_main/app/views/emptyContent.html";
        var listTabStripSelector="#patient-card-docs-tabstrip";
        var subtype=0;
        function genHtmlForTab(sContent,sUuid) {
            var sRet=
                "<div id='"+sUuid+"' style='height:98%'><div class='doc-toolbar'></div><div style='"+divStyle+"' class='doc-content'>"+sContent+"</div><div class='div-invisible printable'></div></div>";
            return sRet;
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
        var resizeGrid=function() {
            var height=utils.getAvailableHeight();
            //-50-57;
            $(gridSelector).css("height",height.toString()+"px");
        };
        var restoreTabs=function(data) {
            var tabStrip=$(listTabStripSelector).data("kendoTabStrip");
            if (tabStrip.items().length>fixedTabs) {
                return;
            }
            for(var i=0;i<tabsArray.length;i=i+1) {
                var tab=tabsArray[i];
                var newTab=tabStrip.append({text:tab.text,encoded:tab.encoded,content:emptyUrl});
                var sHtml=genHtmlForTab(tab.content,tab.uuid);
                $(tabStrip.contentElement(i+fixedTabs)).html(sHtml);
                var firstHeight=$(tabStrip.contentElement(0)).height();
                $(tabStrip.contentElement(i+fixedTabs)).css("height",firstHeight.toString()+"px");

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

            return sRet;
        };

        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedPeriod:null,
            gridDs:gridDs,
            periodDs:periodDs,
            suffix:"",
            visit:null,

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
            onAddButtonClicked:function(e) {
                /*
                proxy.publish("visitsBackUrl",{backUrl:myTabStripName});
                var url="/patient_card/"+viewModel.selectedPatient.id.toString()+"/"+visitTab+"/0/"+visitTabMain;
                proxy.publish("navigateCommand",url);
                */
                var data=viewModel.selectedPatient;
                createDialog.open(data);

            },
            onEditButtonClicked:function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    /*
                    proxy.publish("visitsBackUrl",{backUrl:myTabStripName});
                    var url="/patient_card/"+viewModel.selectedPatient.id.toString()+"/"+visitTab+"/"+item.id+"/"+visitTabMain;
                    proxy.publish("navigateCommand",url);
                    */
                    viewModel.onGetDocument(item.record_id);
                }
                else {
                    kendo.alert("Не выбран документ!");
                }
            },

            onGetDocument: function(record_id) {
                var iTab=findDoc(record_id);
                // iTab=0;
                if (!iTab) {
                    viewModel.set("record_id",record_id);
                    kendo.ui.progress($(gridSelector),true);
                    ibDocDs.dsGet.read({record_id: record_id}).then(function(){
                        kendo.ui.progress($(gridSelector),false);
                    });
//                    kendo.ui.progress($("#ib-docs"),true);
                }
                else {
                    var tabStrip=$(listTabStripSelector).data("kendoTabStrip");
                    tabStrip.select(iTab);
                }

            },
            onCopyButtonClicked: function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item = grid.dataItem(row);
                    mayBeCreatedDs.read({record_id:item.record_id}).then(function() {
                        if ((mayBeCreatedDs._data.length)>0) {
                            var data=viewModel.selectedPatient;
                            createDistDialog.open({selectedPatient:data,record_id:item.record_id});
                            /*
                            docsTreeDistDs.read({record_id:item.record_id}).then(function(){
                                createDistDialog.open({selectedPatient:data,record_id:item.record_id});
                            })
                            */
                        }
                        else {
                            kendo.alert("Для выбранного документа не предусмотрен ввод на основании!");
                        }
                    });
                }
                else {
                    kendo.alert("Не выбран документ-основание!");
                }
            },
            onDeleteButtonClicked:function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    if ((item.ext3) && (item.doc_id==58)) {
                        kendo.alert("Нельзя удалить отправленный документ!");
                        return;
                    }
                    var curUser=Number(localStorage["last_user"]) || 0;
                    if (!(item.user_id==curUser)) {
                        if (!(curUser==1)) {
                            kendo.alert("Только создатель документа имеет право на удаление!");
                            return;
                        }
                    }
                    if (utils.getDaysBetweenDates(item.created,new Date())>=31) {
                        if (!(curUser==1)) {
                            kendo.alert("Истек срок давности удаления документа (1 месяц)!");
                            return;
                        }
                    }
                    var sConfirm="Удалить документ '"+item.doc_name+
                        "' от "+kendo.toString(item.doc_date,"dd.MM.yyyy"+
                            "?<br>Документ будет удален без возможности восстановления!");
                    kendo.confirm(sConfirm).then(function(){
                        ibDocDs.dsDelete.read({record_id:item.record_id}).then(function() {
                              viewModel.onRefreshButtonClicked();
                          });
                        });
                }
                else {
                    kendo.alert("Не выбран документ!");
                }

            },
            onRefreshButtonClicked: function(e) {
                var periodVal=viewModel.selectedPeriod.value;
                var d1=utils.addDays(new Date(),0-periodVal);
                doQuery(viewModel.selectedPatient.id,d1);
            }
        });
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
            viewModel.onEditButtonClicked(e);
        };
        var bindWidgets=function() {
            var mode=viewModel.mode;
            //kendo.bind($("#docs_tabs"),viewModel);
            kendo.bind($(gridSelector),viewModel);
            kendo.bind($(gridToolbarSelector),viewModel);
            var grid=$(gridSelector).data("kendoGrid");
            var selectedPeriod=viewModel.get("selectedPeriod");
            if (!(selectedPeriod)) {
                viewModel.set("selectedPeriod",viewModel.periodDs[defaultPeriodIndex]);
            }
            else {
                if (grid) {
                    if (grid.dataSource.data().length) {
                        grid.refresh();
                    }
                }
            }
            restoreState();
            if (grid) {
                grid.tbody.on('dblclick',"tr",onRowDblClick);
            }
        };

        var onPatientCardVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            var name=data.name;
            if (!(name==myTabStripName)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripName);
            var tabStrip=data.tabStrip;
            var contentHtml=$("#"+viewId).html();
            myTabStrip = tabStrip.append({
                text: "Документация",
                content: (isMyTabCurrent && (!(viewModel.suffix))) ? contentHtml: "<div></div>"
            });
            if (isMyTabCurrent) {
                setTimeout(function(){
                    bindWidgets();
                    viewModel.set("selectedPatient",data.patient);
                },1);
            }
        };
        var doQuery=function(iPatientId,dDateEnd){
            if (!iPatientId) {
                return;
            }
            if (!dDateEnd) {
                return;
            }
//            $(gridSelector).hide();
//            kendo.ui.progress($(gridSelector),true);
            viewModel.gridDs.read({
                patient_id: iPatientId,
                date_end: dDateEnd
            }).
            then(function() {
  //              kendo.ui.progress($(gridSelector),false);
                try {
                    bindWidgets();
//                    $(gridSelector).show();
//                    resizeGrid();
                    $(gridSelector).data("kendoGrid").resize();
                }
                catch (ex) {

                }
                utils._onRequestEnd();
            });
        };
        var onSuffix=function(suffix) {
            var backUrl="/patient_card/"+viewModel.selectedPatient.evn.toString()+"/"+myTabStripName;
            proxy.publish("suffixChanged",{
                suffix:suffix,
                backUrl:backUrl,
                tabStrip: myTabStrip,
                order:myTabStripOrder,
                selectedPatient:viewModel.selectedPatient,
                visitsDs:viewModel.gridDs
            });
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {
                    viewModel.set("suffix","");
                    viewModel.set("visit",null);
                    viewModel.set("selectedPeriod", null);
                    viewModel.set("selectedPeriod", viewModel.periodDs[defaultPeriodIndex]);  // 3 года
                }
            }
            if ((e.field=="selectedPeriod") && (isMyTabCurrent || true) ) {
                if (viewModel.selectedPatient) {
                    if (viewModel.selectedPeriod) {
                        var periodVal=viewModel.selectedPeriod.value;
                        var d1=utils.addDays(new Date(),0-periodVal);
                        doQuery(viewModel.selectedPatient.evn,d1);
                    }
                }
            }
            if ((e.field=="suffix") && isMyTabCurrent) {
                var suffix=viewModel.suffix;
                if (suffix) {
                    setTimeout(function(){
                        onSuffix(suffix);
                    },20);
                }
            }
        };

        var onTabActivated=function(data) {
            var idx=data.index;
            var name=data.name;
            if (!(name==myTabStripName)) {
                return true;
            }
            myTabStripOrder=idx;
            // resize grid
            var contentElement=data.content;
//            var contentElement=that.tabStrip.contentElement(that.myOrder);
            $(contentElement).css("height",($(contentElement).height())+"px");
//            $(gridSelector).css("height",($(contentElement).height()-80)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
            if (data.suffix) {
                viewModel.set("suffix",data.suffix);
            }
            var suffix=viewModel.suffix;
            if (suffix) {
                var url=window.location.href;
                if (!(url.endsWith(myTabStripName+"/"+suffix))) {
                    viewModel.set("suffix","");
                    url="/patient_card/"+viewModel.selectedPatient.evn.toString()+"/visits/"+suffix;
                    proxy.publish("navigateCommand",url);
                }
                setTimeout(function() {
                    proxy.publish("suffixTabActivated",
                        {index:91, element: data.item, content: data.content, suffix:suffix });
                },1000);
        }
        };
        var onCreateDoc=function(data) {
//        console.log("createDoc doc_vid="+data.doc_vid+" doc_sub="+data.doc_sub);
            var selIb=viewModel.selectedPatient;
            subtype=data.doc_sub;
            ibDocDs.dsCreate.read({
                ask_id:selIb.pin,
                evn:selIb.evn,
                user_id:Number(localStorage['last_user']),
                doc_id:data.doc_vid,
                doc_sub:data.doc_sub,
                ext_data:JSON.stringify(data.extData)
            });
            kendo.ui.progress($("#ib-docs"),true);
        };
        var onCreateDocFromSrc=function(data) {
//        console.log("createDoc doc_vid="+data.doc_vid+" doc_sub="+data.doc_sub);
            var selIb=viewModel.selectedPatient;
            subtype=data.doc_sub;
            ibDocDs.dsCreate.read({
                ask_id:selIb.pin,
                evn:selIb.evn,
                user_id:Number(localStorage['last_user']),
                doc_id:data.doc_vid,
                doc_sub:data.doc_sub,
                ext_data:JSON.stringify(data.extData),
                src_record_id:data.src_record_id
            });
            kendo.ui.progress($("#ib-docs"),true);
        };
        var onDocCreated=function(e) {
            onDocLoaded(e);
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
            var tabStrip=$(listTabStripSelector).data("kendoTabStrip");
            var text=docTitle(data.doc_id)+" "+(tabsArray.length+1);

            var newTab=tabStrip.append({text:text,encoded:false,contentUrl:emptyUrl});
            currentTab=tabsArray.length+1;
            var content= data.doc_html;
            var sUuid=Math.uuid(15);
            var sHtml=genHtmlForTab(content,sUuid);
            $(tabStrip.contentElement(currentTab)).html(sHtml);
            //
            var firstHeight=$(tabStrip.contentElement(0)).height();
            $(tabStrip.contentElement(currentTab)).css("height",firstHeight.toString()+"px");
            //
            data.selectedPatient=viewModel.get("selectedPatient");
            tabsArray.push({text:text,encoded:false,content:content,
                doc_id:data.doc_id,record_id: data.record_id,
                uuid: sUuid,
                master:factory.createDoc(data,sUuid,subtype)
            });
            tabsArray[tabsArray.length-1].master.initialize(data,e.sender.data());
            if (extMessage) {
                tabsArray[tabsArray.length-1].master.doCopyToNew(extMessage);
                extMessage=null;
            }
            tabStrip.select(currentTab);

            /*
            var suffix=viewModel.get("last_suffix") || {};

            if (suffix.ext2) {
                tabsArray[tabsArray.length-1].master.set("ext2",suffix.ext2);
            }
            viewModel.set("last_suffix",{});
            */
        };

        proxy.subscribe("createDoc",onCreateDoc);
        proxy.subscribe("createDocFromSrc",onCreateDocFromSrc);

        ibDocDs.dsGet.bind("change",onDocLoaded);
        ibDocDs.dsCreate.bind("change",onDocCreated);
//        ibDocDs.dsDelete.bind("change",onDocDeleted);

        var onTabIsCurrent=function(data) {
            // resize grid
            var contentElement=data.content;
            $(gridSelector).css("height",($(contentElement).height()-5)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
            //          viewModel.set("selectedPatient",data.parentModel.selectedPatient);
//            if (isMyTabCurrent) {
            if (viewModel.get("selectedPatient")==data.parentModel.selectedPatient) {
                bindWidgets();
                restoreTabs();
            }
            else {
                viewModel.set("selectedPatient",data.parentModel.selectedPatient);
                tabsArray=[];
                currentTab=0;
                bindWidgets();
            }
//            }
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
        var onDocChanged =function(data) {
            var i=findTabByUid(data.uuid);
            if (i>=0) {
                tabsArray[i].content=data.content;
                tabsArray[i].master.changeCount++;
            }
        };
        var closeDocTab=function(i) {
            var tabStrip=$(listTabStripSelector).data("kendoTabStrip");
            tabStrip.remove(i+fixedTabs);
            tabsArray.splice(i,1);
            currentTab=tabsArray.length;
            tabStrip.select(tabsArray.length);
        };
        var onDocClose=function(data) {
            var i=findTabByUid(data.uuid);
            if (i>=0) {
                var tab=tabsArray[i];
                if (tab.master.changeCount && (tab.master.changeQuestion)) {
                    alertify.confirm(tab.master.changeQuestion,function(e){
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
                    alertify.confirm(tab.master.saveQuestion,function(e){
                        if (e) {
                            tab.master.saveMe(true);
                        }
                        else {
                            closeDocTab(i);
                        }
                    });
                    return;
                }
                closeDocTab(i);
            }
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
                viewModel.onRefreshButtonClicked();
//            }
                /* this code from Stac
                if (isNeedUpdateRecoms(tab.master.docVid)) {
                    refreshRecoms();
                }
                */
            }
        };
        var onGetCurrentPatient=function(data) {
            var selIb=viewModel.get("selectedPatient");
            data.selIb=selIb;
        };
        var options={
            level: 1,
            parentName:"docs",
            name:"list",
            label:"Список",
            contentHtml:contentHtml,
            tabStripSelector:"",
            viewModel:viewModel,
            onTabIsCurrent: onTabIsCurrent
        };

        var myTab= new GeneralTab(options);

        proxy.subscribe("docClose",onDocClose);
        proxy.subscribe("docChanged",onDocChanged);
        proxy.subscribe("docSaved",onDocSaved);
        proxy.subscribe("getCurrentPatient",onGetCurrentPatient);

        viewModel.bind("change",onVmChange);


        return viewModel;
    }
);