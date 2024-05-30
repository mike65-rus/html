/* мониторинг проф-мероприятий для ТФОМС (ВД,ПО) вкладка для Проф.мероптиятий */
define(['kendo.all.min','utils','classes/generalTab',
        'docs/docFactory','kendo-template!views/patientCardProfEventsMonitorTfomsAll',
        'dataSources/profEventsMonitorTfomsAllDataSource',
        'dataSources/profEventsMonitorDispTypesDataSource',
        'services/proxyService',
        'alertify',
        'Math.uuid'
    ],
    function(kendo,utils,GeneralTab,docFactory,viewId,visitsListDs,dsTypes,proxy,alertify) {
        'use strict';
        var contentHtml=$("#"+viewId).html();
        var myTabStripOrder=1;
        var myTabStripName="all-monitor-tfoms";
        var defaultPeriodIndex=0;
        var myTabStrip=null;
        var isMyTabCurrent=false;
        var gridSelector="#pk_monitor_tfoms_grid_all";
        var gridDs=visitsListDs;
//        var periodDs=dsPeriod;
        var visitTab="visit";
        var visitTabMain="main";

        var typesDs=dsTypes;
        var popupValidator=null;

        var divStyle='overflow-y:scroll;height:95%';
        var tabsArray=new Array();
        var currentTab=0;
        var fixedTabs=0;
        var extMessage=null;
        var gridToolbarSelector="#pk_monitor_tfoms_grid_toolbar_all";
        var emptyUrl="html/Stacdoct_main/app/views/emptyContent.html";
        var listTabStripSelector="#patient-card-prof-events-tabstrip";

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
            isOnlyNotEnded:true,
            selectedPatient:null,
            selectedPeriod:null,
            gridDs:gridDs,
//            periodDs:periodDs,
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
            onEditButtonClicked:function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    var sUrl=window.location.origin+window.location.pathname+window.location.search+
                        "#/patient_card/"+item.evn.toString()+"/prof-events/monitor-tfoms";
                    window.location.href=sUrl;
                }
                else {
                    kendo.alert("Не выбран пациент!");
                }
            },

            onRefreshButtonClicked: function(e) {
//                var periodVal=viewModel.selectedPeriod.value;
//                var d1=utils.addDays(new Date(),0-periodVal);
                doQuery();
            }
        });
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
            viewModel.onEditButtonClicked(e);
        };
        var getDispCodeForNewRecord=function() {
            var result="";
            if (eventsState.vd1.count) {
                if (!eventsState.vd2.count) {
                    result="ДВ2";   // ВД-2
                }
            }
            else {
                result="ДВ4";   // ВД-1
                if (!eventsState.prof.count) {
//                    result="ОПВ";
                }
            }
            return result;
        };
        var bindWidgets=function() {
            var mode=viewModel.mode;
            //kendo.bind($("#docs_tabs"),viewModel);
            kendo.bind($(gridSelector),viewModel);
            kendo.bind($(gridToolbarSelector),viewModel);
            var grid=$(gridSelector).data("kendoGrid");
            if (grid) {
                if (grid.dataSource.data().length) {
                    grid.refresh();
                }
            }
            restoreState();
            if (grid) {
                grid.tbody.on('dblclick',"tr",onRowDblClick);
            }
            kendo.bind($("#check-tfoms-all"),viewModel);
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
                text: "Мониторинг ТФОМС",
                content: (isMyTabCurrent && (!(viewModel.suffix))) ? contentHtml: "<div></div>"
            });
            if (isMyTabCurrent) {
                setTimeout(function(){
                    bindWidgets();
                    viewModel.set("selectedPatient",data.patient);
                },1);
            }
        };
        var doQuery=function(bShowProgress=false){
//            $(gridSelector).hide();
            var all="all";
            var checkStateNotEnded=viewModel.get("isOnlyNotEnded");
            if (checkStateNotEnded) {
                all="";
            }
            if (bShowProgress) {
                kendo.ui.progress($(gridSelector),true);

            }
            viewModel.gridDs.read({
                all:all
            }).
            then(function() {
              if (bShowProgress) {
                  kendo.ui.progress($(gridSelector), false);
              }
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
//                    viewModel.set("selectedPeriod", null);
//                    viewModel.set("selectedPeriod", viewModel.periodDs[defaultPeriodIndex]);  // 3 года
                    doQuery(true);
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
            if (e.field=="isOnlyNotEnded") {
                doQuery();
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
        var onGetCurrentPatient=function(data) {
            var selIb=viewModel.get("selectedPatient");
            data.selIb=selIb;
        };
        var onUpdateProfTfomsAll = function() {
            doQuery();
        };
        var options={
            level: 1,
            parentName:"prof-events",
            name:"all-monitor-tfoms",
            label:"Диспансеризация - все",
            contentHtml:contentHtml,
            tabStripSelector:"",
            viewModel:viewModel,
            onTabIsCurrent: onTabIsCurrent
        };

        var myTab= new GeneralTab(options);

        proxy.subscribe("getCurrentPatient",onGetCurrentPatient);
        proxy.subscribe("updateProfTfomsAll",onUpdateProfTfomsAll);

        viewModel.bind("change",onVmChange);


        return viewModel;
    }
);