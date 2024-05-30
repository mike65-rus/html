/* мониторинг Дисп учета РФОМС по одному человеку */
define(['kendo.all.min','utils','classes/generalTab',
        'docs/docFactory','kendo-template!views/patientCardDuEventsMonitorTfoms',
        'dataSources/duEventsMonitorTfomsDataSource',
        'dataSources/duActionsDataSource',
        'dataSources/duBegTypesDataSource',
        'dataSources/duEndTypesDataSource',
        'dataSources/duHealthGroupsDataSource',
        'dataSources/duResultsDataSource',
        'dataSources/mkbFinderDataSource',
        'viewModels/patientCardProfEventsMonitorTfomsAllVm',
        'services/proxyService',
        'alertify',
        'Math.uuid'
    ],
    function(kendo,utils,GeneralTab,docFactory,viewId,visitsListDs,
             dsTypes,dsBegTypes,dsEndTypes,dsHealthGroups,dsResults,dsMkbFinder,allVm,proxy,alertify) {
        'use strict';
        const act_1="1";    // постановка
        const act_2="3";    // снятие
        const act_3="2";    // осмотр
        var contentHtml=$("#"+viewId).html();
        var myTabStripOrder=0;
        var myTabStripName="monitor-tfoms";
        var defaultPeriodIndex=0;
        var myTabStrip=null;
        var isMyTabCurrent=false;
        var gridSelector="#pk_monitor_tfoms_du1_grid";
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
        var gridToolbarSelector="#pk_monitor_tfoms_du1_grid_toolbar";
        var emptyUrl="html/Stacdoct_main/app/views/emptyContent.html";
        var listTabStripSelector="#patient-card-prof-events-tabstrip";
        var begTypesDs=dsBegTypes;
        var endTypesDs=dsEndTypes;
        var healthGroupsDs=dsHealthGroups;
        var resultsDs=dsResults;
        var mkbFinderDs=dsMkbFinder;

        var eventsState=clearEventsState();


        function clearEventsState() {
            return {vd1:{count:0,dates:0,date_beg:null,date_end:null,id:0},
                vd2:{count:0,dates:0,date_beg:null,date_end:null,id:0},
                prof:{count:0,dates:0,date_beg:null,date_end:null,id:0}};
        }
        function updateEventsState(ds,includeDirty=true) {
            eventsState=clearEventsState();
            var curDate=new Date();
            for (var i=0;i<ds.total();i++) {
                var dataItem=ds.at(i);
                if (!dataItem.date_beg) {
                    continue;
                }
                if (! (dataItem.date_beg.getFullYear()==curDate.getFullYear())) {
                    continue;
                }
                if (dataItem.dirty && !includeDirty) {
                    continue;
                }
                if (dataItem.disp_code=="ДВ4") {
                    eventsState.vd1.count++;
                    eventsState.vd1.id=dataItem.id;
                    if (dataItem.date_beg) {
                        eventsState.vd1.dates++;
                        eventsState.vd1.date_beg=dataItem.date_beg;
                    }
                    if (dataItem.date_end) {
                        eventsState.vd1.dates++;
                        eventsState.vd1.date_end=dataItem.date_end;
                    }
                }
                if (dataItem.disp_code=="ДВ2") {
                    eventsState.vd2.count++;
                    eventsState.vd2.id=dataItem.id;
                    if (dataItem.date_beg) {
                        eventsState.vd2.dates++;
                        eventsState.vd2.date_beg=dataItem.date_beg;
                    }
                    if (dataItem.date_end) {
                        eventsState.vd2.dates++;
                        eventsState.vd2.date_end=dataItem.date_end;
                    }
                }
                if (dataItem.disp_code=="ОПВ") {
                    eventsState.prof.count++;
                    eventsState.prof.id=dataItem.id;
                    if (dataItem.date_beg) {
                        eventsState.prof.dates++;
                        eventsState.prof.date_beg=dataItem.date_beg;
                    }
                    if (dataItem.date_end) {
                        eventsState.prof.dates++;
                        eventsState.prof.date_end=dataItem.date_end;
                    }
                }
            }
        }
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
            onAddButtonClicked:function(e) {
                var data=viewModel.selectedPatient;
                var grid=$(gridSelector).data("kendoGrid");
                /*
                if (viewModel.selectedPatient.type_ds && !viewModel.selectedPatient.from_mon ) {
                    kendo.alert("В текущем году уже выполнены проф мероприятия");
                    return;
                }
                updateEventsState(grid.dataSource);
                if (eventsState.vd1.count && eventsState.vd2.count) {
                    kendo.alert("В текущем году уже выполнены мероприятия (ВД-1 и ВД-2)");
                    return;
                }
                if (eventsState.prof.count) {
                    kendo.alert("В текущем году уже выполнены мероприятия (Проф)");
                    return;
                }
                if (eventsState.vd1.count && eventsState.vd1.dates<2) {
                    kendo.alert("Сначала нужно заполнить дату окончания предыдущего мероприятия по ВД-1");
                    return;
                }
                if (eventsState.vd2.count && eventsState.vd2.dates<2) {
                    kendo.alert("Сначала нужно заполнить дату окончания предыдущего мероприятия по ВД-2");
                    return;
                }
                if (eventsState.vd2.prof && eventsState.prof.dates<2) {
                    kendo.alert("Сначала нужно заполнить дату окончания предыдущего мероприятия по ПрофОсмотру");
                    return;
                }
                */
                grid.addRow();

            },
            onEditButtonClicked:function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    var sendType=item.send_type || 0;
                    if (sendType>=2) {
                        kendo.alert("Все данные этого мероприятия уже отправлены в Фонд ОМС!<br>Редактирование недоступно!");
                        return;
                    }
                    updateEventsState(grid.dataSource);
                    grid.editRow(row);
                }
                else {
                    kendo.alert("Не выбрано мероприятие!");
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
            onDeleteButtonClicked:function(e) {
                e.preventDefault();
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    if (item.send_type) {
                        kendo.alert("Данные этого мероприятия уже отправлены в Фонд ОМС<br>Удаление невозможно!");
                        return;
                    }
                    var curUser=Number(localStorage["last_user"]) || 0;
                    if (!(item.user_id==curUser)) {
                        if (!(curUser==1)) {
                            kendo.alert("Только создатель документа имеет право на удаление!");
                            return;
                        }
                    }
                    var sConfirm="Удалить выделенное мероприятие? "+
                        "<br>Мероприятие будет удалено без возможности восстановления!";
                    kendo.confirm(sConfirm).then(function(){
                        grid.removeRow(row);
//                        setTimeout(function() {
                        updateEventsState(grid.dataSource,false);
                        proxy.publish("vdStatusChange",eventsState);
                        proxy.publish("updateProfTFomsAll");
                        //                      },2000);

                    });
                }
                else {
                    kendo.alert("Не выбрано мероприятие!");
                }

            },
            onRefreshButtonClicked: function(e) {
//                var periodVal=viewModel.selectedPeriod.value;
//                var d1=utils.addDays(new Date(),0-periodVal);
                doQuery(viewModel.selectedPatient.pin);
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
        var editMode=0;
        var badMkb=false;
        var checkDataOnServerOld=function(model,container,grid) {
            var ds=mkbFinderDs;
            badMkb=false;
            kendo.ui.progress(container,true);
            ds.read({filter1:model.get("mkb")}).then(function() {
                kendo.ui.progress(container,false);
                if (ds._data.length==1) {
                    grid.saveRow();
                }
                else {
                    badMkb=true;
                    if (!ds._data || !ds._data.length) {
                        container.find("input[name=mkb]").data("message", "Неверный код МКБ");
                    }
                    else {
                        container.find("input[name=mkb]").data("message", "Код МКБ требует уточнения");
                    }
                    popupValidator.validateInput(container.find("input[name=mkb]"));
                    badMkb=false;
                }
            });
        };
        var checkDataOnServer= function(model,container,grid) {
            var ds=mkbFinderDs;
            badMkb=false;
            kendo.ui.progress(container,true);
            ds.read({filter1: model.get("mkb")}).then(function() {
                kendo.ui.progress(container,false);
                if (ds._data.length==1) {
                    grid.saveRow();
                }
                else {
                    badMkb=true;
                    if (!ds._data || !ds._data.length) {
                        container.find("input[name=mkb]").data("message", "Неверный код МКБ");
                    }
                    else {
                        container.find("input[name=mkb]").data("message", "Код МКБ требует уточнения");
                    }
                    popupValidator.validateInput(container.find("input[name=mkb]"));
                    badMkb=false;
                }
            });
            /*
            ds.read({filter1:model.get("mkb")}).then(function() {
                kendo.ui.progress(container,false);
                if (ds._data.length==1) {
                    grid.saveRow();
                }
                else {
                    badMkb=true;
                    if (!ds._data || !ds._data.length) {
                        container.find("input[name=mkb]").data("message", "Неверный код МКБ");
                    }
                    else {
                        container.find("input[name=mkb]").data("message", "Код МКБ требует уточнения");
                    }
                    popupValidator.validateInput(container.find("input[name=mkb]"));
                    badMkb=false;
                }
            });
            */
        };
        var onSaveRowButtonClick=function(e) {
            e.preventDefault();
            var grid=$(gridSelector).data("kendoGrid");
            if (!popupValidator.validate()) {
//                kendo.alert("Исправьте ошибки!");
                return false;
            }
            else {
                checkDataOnServer(e.data.model,e.data.container,grid);
            }
            return false;
        };
        var findMkbList=function(model) {
            var result=[];
            var grid=$(gridSelector).data("kendoGrid");
            var ds=grid.dataSource;
            for (var i=0;i<ds.data().length;i++) {
                var dataItem=ds.at(i);
                if (dataItem.dirty) {
                    continue;
                }
                if (dataItem.du_action==act_1) {
                    result.push(dataItem.mkb);
                }
                if (dataItem.du_action==act_2) {
                    var idx=result.indexOf(dataItem.mkb);
                    if (idx>-1) {
                        result.splice(idx,1);
                    }
                }
            }
            return result;
        };
        var findFirstAction=function(model) {
            var result=undefined;
            var mkb=model.get("mkb");
            var action=model.get("du_action");
            if (!mkb || !action) {
                return result;
            }
            var grid=$(gridSelector).data("kendoGrid");
            var ds=grid.dataSource;
            for (var i=0;i<ds.data().length;i++) {
                var dataItem=ds.at(i);
                if (dataItem.dirty) {
                    continue;
                }
                if (dataItem.du_action==act_1) {
                    if (dataItem.mkb==mkb) {
                        result={dateBeg:dataItem.date_beg,begType:dataItem.beg_type,healthGr:dataItem.health_gr};
                    }
                }
                if (dataItem.du_action==act_2) {
                    if (dataItem.mkb==mkb) {
                        result=undefined;
                    }
                }
            }
            return result;
        };
        var containerSetFocus=function(action,model) {
            switch (action) {
                case act_1:   // постановка
                {
                    try {
                        var dropDownMkb = editContainer.find("input[name=mkb]").data("kendoComboBox");
                        if (dropDownMkb) {
                            dropDownMkb.input.focus();
                        }
                    }
                    catch (ex) {
                    }
                    break;
                }
                case act_2:   // снятие
                {
                    try {
                        if (model.get("mkb")) {
                            editContainer.find("input[name=date_end]").focus();
                        }
                        else {
                            var dropDownMkb=editContainer.find("input[name=mkb]").data("kendoComboBox");
                            if (dropDownMkb) {
                                dropDownMkb.input.focus();
                            }
                        }
                    }
                    catch (ex) {
                    }
                    break;
                }
                case act_3:   // осмотр
                {
                    try {
                        if (model.get("mkb")) {
                            editContainer.find("input[name=date_in]").focus();
                        }
                        else {
                            var dropDownMkb=editContainer.find("input[name=mkb]").data("kendoComboBox");
                            if (dropDownMkb) {
                                dropDownMkb.input.focus();
                            }
                        }
                    }
                    catch (ex) {
                    }
                    break;
                }
            }

        };
        var refreshEditContainer=function(action,model) {
            switch (action) {
                case act_1:   // постановка
                {
                    showDivs(true, editContainer, ["du-act-0"]);
                    showDivs(true, editContainer, ["du-act-1"]);
                    showDivs(false, editContainer, ["du-act-2", "du-act-3"]);
                    makeReadOnly(false, editContainer, model, ["du-act","du-act-0","du-act-1"]);
                    break;
                }
                case act_2:   // снятие
                {
                    showDivs(true, editContainer, ["du-act-0"]);
                    showDivs(true, editContainer, ["du-act-1", "du-act-2"]);
                    showDivs(false, editContainer, ["du-act-3"]);
                    makeReadOnly(true, editContainer, model, ["du-act-1"]);
                    makeReadOnly(false, editContainer, model, ["du-act","du-act-0","du-act-2"]);
                    break;
                }
                case act_3:   // осмотр
                {
                    showDivs(true, editContainer, ["du-act-0"]);
                    showDivs(true, editContainer, ["du-act-1", "du-act-3"]);
                    showDivs(false, editContainer, ["du-act-2"]);
                    makeReadOnly(true, editContainer, model, ["du-act-1"]);
                    makeReadOnly(false, editContainer, model, ["du-act","du-act-0","du-act-3"]);
                    break;
                }
                default: {
                    showDivs(false, editContainer, ["du-act-0","du-act-1", "du-act-2", "du-act-3"]);
                    break;
                }
            }
            if (editMode==0) {
                makeReadOnly(true,editContainer,model,[""]);
            }
            var dropDown=editContainer.find("input[name=mkb]").data("kendoComboBox");
            if (dropDown) {
                if (action == act_2 || action == act_3) {
                    var aOfMkb = findMkbList(model);
                    var aDs = [];
                    for (var i = 0; i < aOfMkb.length; i++) {
                        var oObj = {id: aOfMkb[i], name: ""};
                        aDs.push(oObj);
                    }
                    var ds = new kendo.data.DataSource({data: aDs});
                    ds.read();
                    dropDown.setDataSource(ds);
                    dropDown.refresh();
                    $(dropDown.input).prop("readOnly", true);
                    dropDown.unbind("open");
                    if (aOfMkb.length == 1) {
                        model.set("mkb", "");
                        model.set("mkb", aOfMkb[0]);
                    }
                }
                if (action === act_1) {
//                    createFullMkbCombo(editContainer,model);
                    dropDown.setDataSource([]);
                    dropDown.refresh();
                    $(dropDown.input).prop("readOnly", false);
                    if (dropDown._events.open.length == 0) {
                        dropDown.bind("open", onMkbComboOpen);
                    }
                }
            }
            containerSetFocus(action,model);
        };

        var onModelChange=function(e) {
            var fld=e.field;
            var model=e.sender.source || e.sender;
            var isNew=model.isNew();
            if (fld=="du_action") {
                var action=model.get("du_action");
                try {
                    popupValidator.hideMessages();
                }
                catch (ex) {
                }
                refreshEditContainer(action,model);
            }
            if (fld=="mkb") {
                var action=model.get("du_action");
                if (action==act_2 || action==act_3) {
                    var oObj=findFirstAction(model);
                    if (!(oObj===undefined)) {
                        model.set("date_beg",oObj.dateBeg);
                        model.set("beg_type",oObj.begType);
                        model.set("health_gr",oObj.healthGr);
                    }
                }
            }
        };
        var showDivs=function(bMode,container,divList) {
            for (var i=0;i<divList.length;i++) {
                var $div=container.find("div."+divList[i]);
                if (bMode) {
                    $div.show();
                }
                else {
                    $div.hide();
                }
            }
        };
        var makeReadOnly=function(bMode,container,model,divList) {
            for (var i=0;i<divList.length;i++) {
                var selector=(divList[i]).trim();
                if (selector) {
                    var element=container.find("."+selector).first();
                }
                else {
                    var element=container;
                }
                element.find("input").each(function(idx,el) {
                    $(this).prop("readonly",bMode);
                    if ($(this).data("kendoDatePicker")) {
                        $(this).data("kendoDatePicker").readonly(bMode);
                    }
                    if ($(this).data("kendoDropDownList")) {
                        $(this).data("kendoDropDownList").readonly(bMode);
                    }
                    if ($(this).data("kendoComboBox")) {
                        var combo=$(this).data("kendoComboBox");
                        combo.input.prop("readonly",bMode);
                        combo.readonly(bMode);
                        combo.enable(!bMode);

                    }
                });
            }

        };
        var lastSearchedMkb="";
        var needOpen=false;
        var onMkbComboOpen=function(e) {
            if (needOpen) {
                needOpen=false;
                return;
            }
            var that=this;
            var text=that.text().trim().toUpperCase();
            if (text.length>=1) {
                if (!(lastSearchedMkb==text)) {
                    lastSearchedMkb=text;
                    kendo.ui.progress(that._form,true);
                    var ds=mkbFinderDs;
                    ds.read({filter1:text}).then(function() {
                        kendo.ui.progress(that._form,false);
                        var aDs=[];
                        for (var i=0; i<ds._data.length;i++) {
                            var item=ds.data().at(i);
                            aDs.push({id:item.id,name:item.name});
                        }
                        var dsNew=new kendo.data.DataSource({data:aDs});
                        dsNew.read();
                        that.setDataSource(dsNew);
                        that.refresh();
                        needOpen=true;
                        that.open();
                    });
                }
            }
            e.preventDefault();
            return false;
        };
        var createFullMkbCombo=function(container,model) {
            lastSearchedMkb="";
            var mkbInput=container.find("input[name=mkb]");
            var combo=mkbInput.kendoComboBox({
//                filter: "startsWith",
                autoWidth:true,
//                minLength:3,
//                enforceMinLength:true,
                autoBind:false,
                valuePrimitive: true,
                height:500,
//                dataSource:dsMkbFinder,
                dataSource:[],
                dataTextField:"id",
                dataValueField:"id",
                template:'<span>#: id # #: name #</span>',

            }).data("kendoComboBox");
            combo.bind("open",onMkbComboOpen);
            combo.input.off("keypress");
            combo.input.on("keypress",{field:"mkb",model:model},utils.rusLatMkbEventListener);
            var icon=combo._arrowIcon;
            icon.removeClass("k-i-arrow-60-down");
            icon.addClass("k-i-more-horizontal");
        };
        var gridEdit=function(e) {
//            isModelChanged=false;
//            e.model.bind("change",onEditModelChange);
            var isFirstTime=true;
            var container=e.container;
            var wnd=container.data("kendoWindow");
            wnd.setOptions({actions:[]});   // make not closeable on Esc key
            editContainer=container;
            var dropDown=container.find("input[name=du_action]").data("kendoDropDownList");
            if (!dropDown) {
                dropDown=container.find("input[name=du_action]").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: typesDs
                }).data("kendoDropDownList") ;
            }
            else {
                isFirstTime=false;
            }
            if (isFirstTime) {
                e.model.bind("change",onModelChange);
                popupValidator=attachValidator(container,e.model);
            }
            editMode=0; // readOnly
            var isNew=e.model.isNew();

            if (isNew) {
                editMode=3;
                e.model.set("pin",viewModel.selectedPatient.pin);
                e.model.set("evn",viewModel.selectedPatient.evn);
                e.model.set("fa",viewModel.selectedPatient.fam);
                e.model.set("im",viewModel.selectedPatient.ima);
                e.model.set("ot",viewModel.selectedPatient.otch);
                e.model.set("sex",viewModel.selectedPatient.sex);
                e.model.set("birt",viewModel.selectedPatient.birt);
                e.model.set("polis_vid",viewModel.selectedPatient.polis_vid);
                e.model.set("polis",viewModel.selectedPatient.polis);
                e.model.set("du_action","999");
                e.model.set("du_action","");
                e.model.set("date_beg",null);
                e.model.set("date_end",null);
                e.model.set("date_in",null);
                e.model.set("created",null);
                e.model.set("updated",null);
                e.model.set("send_dt",null);
            }
//            container.css("width","600px");
//            container.find(".k-block").css("width","590px");
            var dropDownHealth=container.find("input[name=health_gr]").data("kendoDropDownList");
            if (!dropDownHealth) {
                dropDownHealth=container.find("input[name=health_gr]").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: healthGroupsDs,
                    autoWidth:true,
                }).data("kendoDropDownList") ;
            }
            var dropDownBegTypes=container.find("input[name=beg_type]").data("kendoDropDownList");
            if (!dropDownBegTypes) {
                dropDownBegTypes=container.find("input[name=beg_type]").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: begTypesDs,
                    autoWidth:true,
                }).data("kendoDropDownList") ;
            }
            var dropDownEndTypes=container.find("input[name=end_type]").data("kendoDropDownList");
            if (!dropDownEndTypes) {
                dropDownEndTypes=container.find("input[name=end_type]").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: endTypesDs,
                    autoWidth:true,
                }).data("kendoDropDownList") ;
            }
            var dropDownRslt=container.find("input[name=rslt]").data("kendoDropDownList");
            if (!dropDownRslt) {
                dropDownRslt=container.find("input[name=rslt]").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: resultsDs,
                    autoWidth:true,
                }).data("kendoDropDownList") ;
            }
//            var mkbInput=container.find("input[name=mkb]");
            if (isFirstTime /*&& isNew*/) {
                createFullMkbCombo(container,e.model);
            }
            var btnContainer=container.find("div").last();
            btnContainer.css("margin-left","5px").css("margin-right","5px");
            var firstButton=btnContainer.find("a").first();
            firstButton.css("margin-right","35px");
            var sHtml=firstButton.html();
            sHtml=sHtml.replace("Обновить","Сохранить");
            firstButton.html(sHtml);
            firstButton.attr("id","du_save_changes");
            if (!isNew && isFirstTime && !(e.model.get("send_dt"))) {
                firstButton.before("<button class='k-button' id='du_change_edit_mode' type='button'>Изменить</button>&nbsp;&nbsp;");
                var $btn=container.find("#du_change_edit_mode");
                $btn.on("click",{model:e.model},onEditModeButtonClicked);
                firstButton.css("display","none");
                refreshEditContainer(e.model.get("du_action"),e.model);
            }
            if (e.model.get("send_dt")) {
                firstButton.hide();
                refreshEditContainer(e.model.get("du_action"),e.model);
            }
            if (isFirstTime) {
                firstButton.on("click",{model:e.model,container:container},onSaveRowButtonClick);
            }
            if (isFirstTime) {
                setTimeout(function() {
                    if (isNew) {
//                    container.find("input[name=disp_code]").focus();
                        dropDown.focus();
                        if (isNew) {
                            dropDown.open();
                        }
                    }
                },500);

            }
        };
        var onEditModeButtonClicked=function(e) {
            editMode=2; //edit existing item
            editContainer.find("#du_change_edit_mode").hide();
            editContainer.find("#du_save_changes").show();
            refreshEditContainer(e.data.model.get("du_action"),e.data.model);
        };
        var attachValidator=function(container,model) {
            //var myContainer=container;
            container.kendoValidator({
                validateOnBlur: true,
                rules: {
                    duActionRequired: function(input) {
                        var result=true;
                        if (input.is("[name=du_action]")) {
                            var val=input.val();
                            if (!val) {
                                result=false;
                            }
                        }
                        return result;
                    },
                    mkbRequired: function(input) {
                        var result=true;
                        if (input.is("[name=mkb]")) {
                            var val=input.val();
                            if (!val) {
                                result=false;
                            }
                            else {
                            }
                        }
                        return result;
                    },
                    mkbAndActionValid: function(input) {
                        var result=true;
                        if (input.is("[name=mkb]")) {
                            if (model.get("du_action")) {
                                return isValidMkbAndAction(model);
                            }
                        }
                        return result;
                    },
                    mkbIsBad: function(input) {
                        var result=true;
                        if (input.is("[name=mkb]")) {
                            if (model.get("du_action")) {
                                return !badMkb;
                            }
                        }
                        return result;
                    },
                    dateBegRequired: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var val=input.val();
                            if (!val) {
                                result=false;
                            }
                        }
                        return result;
                    },
                    dateBegIsDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var val=input.val();
                            if (!kendo.parseDate(val,"dd.MM.yyyy")) {
                                result=false;
                            }
                        }
                        return result;
                    },
                    dateBegMaxDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var currentDateStr = kendo.toString(new Date(),"yyyyMMdd");
                            var val=input.val();
                            var dateBegDate=kendo.parseDate(val,"dd.MM.yyyy");
                            if (!dateBegDate) {
                                result=false;
                            }
                            else {
                                if (kendo.toString(dateBegDate,"yyyyMMdd")>currentDateStr) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateEndRequired: function(input) {
                        var result=true;
                        if (input.is("[name=date_end]")) {
                            if (model.get("du_action")==act_2) {
                                // снятие с ДУ
                                var val=input.val();
                                if (!val) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateEndIsDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_end]")) {
                            if (model.get("du_action")==act_2) {
                                var val = input.val();
                                if (!kendo.parseDate(val, "dd.MM.yyyy")) {
                                    result = false;
                                }
                            }
                        }
                        return result;
                    },
                    dateEndMinDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_end]")) {
                            if (model.get("du_action")==act_2) {
                                var currentDateStr = kendo.toString(model.get("date_beg"), "yyyyMMdd");
                                var val = input.val();
                                var dateEndDate = kendo.parseDate(val, "dd.MM.yyyy");
                                if (!dateEndDate) {
                                    result = false;
                                }
                                else {
                                    if (kendo.toString(dateEndDate, "yyyyMMdd") < currentDateStr) {
                                        result = false;
                                    }
                                }
                            }
                        }
                        return result;
                    },
                    dateEndMaxDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            if (model.get("du_action")==act_2) {
                                var currentDateStr = kendo.toString(new Date(), "yyyyMMdd");
                                var val = input.val();
                                var dateBegDate = kendo.parseDate(val, "dd.MM.yyyy");
                                if (!dateBegDate) {
                                    result = false;
                                }
                                else {
                                    if (kendo.toString(dateBegDate, "yyyyMMdd") > currentDateStr) {
                                        result = false;
                                    }
                                }
                            }
                        }
                        return result;
                    },

                    begTypeRequired: function(input) {
                        var result=true;
                        if (input.is("[name=beg_type]")) {
                            //if (model.get("du_action") == act_1) {
                                var val = input.val();
                                if (!val) {
                                    result=false;
                                }
                            //}
                       }
                        return result;
                    },
                    endTypeRequired: function(input) {
                        var result=true;
                        if (input.is("[name=end_type]")) {
                            if (model.get("du_action") == act_2) {
                                var val = input.val();
                                if (!val) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    rsltRequired: function(input) {
                        var result=true;
                        if (input.is("[name=rslt]")) {
                            if (model.get("du_action") == act_3) {
                                var val = input.val();
                                if (!val) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateInRequired: function(input) {
                        var result=true;
                        if (input.is("[name=date_in]")) {
                            if (model.get("du_action")==act_3) {
                                // осмотр
                                var val=input.val();
                                if (!val) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateInIsDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_in]")) {
                            if (model.get("du_action")==act_3) {
                                var val = input.val();
                                if (!kendo.parseDate(val, "dd.MM.yyyy")) {
                                    result = false;
                                }
                            }
                        }
                        return result;
                    },
                    dateInMinDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_in]")) {
                            if (model.get("du_action")==act_3) {
                                var currentDateStr = kendo.toString(model.get("date_beg"), "yyyyMMdd");
                                var val = input.val();
                                var dateEndDate = kendo.parseDate(val, "dd.MM.yyyy");
                                if (!dateEndDate) {
                                    result = false;
                                }
                                else {
                                    if (kendo.toString(dateEndDate, "yyyyMMdd") < currentDateStr) {
                                        result = false;
                                    }
                                }
                            }
                        }
                        return result;
                    },
                    dateInMaxDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_in]")) {
                            if (model.get("du_action")==act_3) {
                                var currentDateStr = kendo.toString(new Date(), "yyyyMMdd");
                                var val = input.val();
                                var dateBegDate = kendo.parseDate(val, "dd.MM.yyyy");
                                if (!dateBegDate) {
                                    result = false;
                                }
                                else {
                                    if (kendo.toString(dateBegDate, "yyyyMMdd") > currentDateStr) {
                                        result = false;
                                    }
                                }
                            }
                        }
                        return result;
                    },
                },
                messages: {
                    duActionRequired:"Тип записи не может быть пустым",
                    mkbRequired:"Код МКБ не может быть пустым",
                    dateBegRequired:"Дата постановки на ДУ не может быть пустой",
                    dateBegIsDate: "Дата постановки на ДУ должна быть датой в формате дд.мм.гггг",
                    dateBegMaxDate:"Дата постановки на ДУ не может быть больше текушей даты",
                    dateEndRequired:"Дата снятия с ДУ не может быть пустой",
                    dateEndIsDate: "Дата снятия с ДУ должна быть датой в формате дд.мм.гггг",
                    dateEndMinDate:"Дата снятия с ДУ не может быть меньше даты постановки на ДУ",
                    dateEndMaxDate:"Дата снятия с ДУ не может быть больше текушей даты",
                    dateInRequired:"Дата посещения не может быть пустой",
                    dateInIsDate: "Дата посещения должна быть датой в формате дд.мм.гггг",
                    dateInMinDate:"Дата посещения не может быть меньше даты постановки на ДУ",
                    dateInMaxDate:"Дата посещения не может быть больше текушей даты",
                    begTypeRequired:"Причина постановки на ДУ должна быть заполнена",
                    endTypeRequired:"Причина снятия с ДУ должна быть заполнена",
                    rsltRequired:"Результат обращения должен быть заполнен",
                    mkbAndActionValid: function(input) {
                        return input.data("message") || "Недопустимое сочетание типа записи и кода МКБ";
                    },
                    mkbIsBad: function(input) {
                        return input.data("message") || "Недопустимый код МКБ";
                    }
                }
            });
            return container.data("kendoValidator");
        };
        var isValidMkbAndAction=function(model) {
            var mkb=model.get("mkb");
            var action=model.get("du_action");
            var result=((action==act_1) ? true:false);
            var grid=$(gridSelector).data("kendoGrid");
            var ds=grid.dataSource;
            for (var i=0;i<ds.data().length;i++) {
                var dataItem=ds.at(i);
                if (dataItem.dirty) {
                    continue;
                }
                if (Number(action)==1) {    // постановка на учет
                    if (dataItem.du_action==act_1) {
                        if (dataItem.mkb==mkb) {
                            result=false;
                        }
                    }
                    if (dataItem.du_action==act_2) {
                        if (dataItem.mkb==mkb) {
                            result=true;
                        }
                    }
                }
                if (action==act_2 || action==act_3) {    // снятие с ДУ или осмотр в рамках ДУ
                    if (dataItem.du_action==act_1) {
                        if (dataItem.mkb==mkb) {
                            result=true;
                        }
                    }
                    if (dataItem.du_action==act_2) {
                        if (dataItem.mkb==mkb) {
                            result=false;
                        }
                    }
                }
            }
            var $input=editContainer.find("[name=mkb]");
            if (!result) {
                if (Number(action)==1) {
                    $input.data("message","Пациент уже состоит на учете по указанному коду МКБ");
                }
                if (Number(action)==2) {
                    $input.data("message","Пациент не состоит на учете по указанному коду МКБ");
                }
                if (Number(action)==3) {
                    $input.data("message","Пациент не состоит на учете по указанному коду МКБ");
                }
            }
            return result;
        };
        var attachValidatorOld=function(container,model) {
            var myContainer=container;
            container.kendoValidator({
                validateOnBlur:true,
                rules: {
                    dispCodeValid0: function(input) {
                        var result=true;
                        if (input.is("[name=disp_code]")) {
                            var val=input.val();
                            if (val=="ДВ4") {
                                if (eventsState.vd1.count && eventsState.vd1.id!=model.get("id")) {
                                    result=false;
                                }
                            }
                            if (val=="ДВ2") {
                                if (eventsState.vd2.count && eventsState.vd2.id!=model.get("id")) {
                                    result=false;
                                }
                            }
                            if (val=="ОПВ") {
                                if (eventsState.prof.count && eventsState.prof.id!=model.get("id")) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dispCodeValid1: function(input) {
                        var result=true;
                        if (input.is("[name=disp_code]")) {
                            var val=input.val();
                            if (val=="ДВ2") {
                                if (!eventsState.vd1.count) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dispCodeValid2: function(input) {
                        var result=true;
                        if (input.is("[name=disp_code]")) {
                            var val=input.val();
                            if (val=="ОПВ") {
                                if (eventsState.vd1.count) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateBegRequired: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var val=input.val();
                            if (!val) {
                                result=false;
                            }
                        }
                        return result;
                    },
                    dateBegIsDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var val=input.val();
                            if (!kendo.parseDate(val,"dd.MM.yyyy")) {
                                result=false;
                            }
                        }
                        return result;
                    },
                    dateBegMaxDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var currentDateStr = kendo.toString(new Date(),"yyyyMMdd");
                            var val=input.val();
                            var dateBegDate=kendo.parseDate(val,"dd.MM.yyyy");
                            if (!dateBegDate) {
                                result=false;
                            }
                            else {
                                if (kendo.toString(dateBegDate,"yyyyMMdd")>currentDateStr) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateBegMinDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var val=input.val();
                            var dateBegDate=kendo.parseDate(val,"dd.MM.yyyy");
                            if (!dateBegDate) {
                                result=false;
                            }
                            else {
                                /*
                                if (utils.getDaysBetweenDates(dateBegDate,new Date())>3) {
                                    result=false;
                                }
                                */
                                if (dateBegDate.getFullYear()!=new Date().getFullYear()) {
                                    return false;
                                }
                            }
                        }
                        return result;

                    },

                    dateBegVd2: function(input) {
                        var result=true;
                        if (input.is("[name=date_beg]")) {
                            var dispCode=model.get("disp_code");
                            if (dispCode=="ДВ2") {
                                var val = input.val();
                                var dateBegDate=kendo.parseDate(val,"dd.MM.yyyy");
                                if (!dateBegDate) {
                                    result=false;
                                }
                                else {
                                    if (dateBegDate<eventsState.vd1.date_end) {
                                        result=false;
                                    }
                                }
                            }
                        }
                        return result;
                    },
                    dateEndIsDate: function(input) {
                        var result=true;
                        if (input.is("[name=date_end]")) {
                            var val=input.val();
                            if (val) {
                                var dateEnd=kendo.parseDate(val,"dd.MM.yyyy");
                                if (!dateEnd) {
                                    result=false;
                                }
                            }
                        }
                        return result;
                    },
                    dateEndMinDate: function(input) {
                        var result=true;
                        var dispCode=myContainer.find("input[name=disp_code]").val();
                        var ra=eventsState.vd1;
                        if (dispCode=="ДВ2") {
                            ra=eventsState.vd2;
                        }
                        if (dispCode=="ОПВ") {
                            ra=eventsState.prof;
                        }
                        if (input.is("[name=date_end]")) {
                            var val1=myContainer.find("input[name=date_beg]").val();
                            var dateBeg=kendo.parseDate(val1,"dd.MM.yyyy");
                            if (!dateBeg) {
                                return true;
                            }
                            var val=input.val();
                            var dateEnd=kendo.parseDate(val,"dd.MM.yyyy");
                            if (!dateEnd && ra.dates>=1 && ra.id==model.get("id") && model.get("send_type") ) {
                                result=false;
                            }
                            else {
                                if (dateEnd) {
                                    if (kendo.toString(dateEnd)<kendo.toString(dateBeg)) {
                                        result=false;
                                    }
                                }
                            }
                        }
                        return result;
                    },
                    dateEndMaxDate: function(input) {
                        var result=true;
                        var dispCode=myContainer.find("input[name=disp_code]").val();
                        var ra=eventsState.vd1;
                        if (dispCode=="ДВ2") {
                            ra=eventsState.vd2;
                        }
                        if (dispCode=="ОПВ") {
                            ra=eventsState.prof;
                        }
                        if (input.is("[name=date_end]")) {
                            var val1=myContainer.find("input[name=date_beg]").val();
                            var dateBeg=kendo.parseDate(val1,"dd.MM.yyyy");
                            if (!dateBeg) {
                                return true;
                            }
                            var val=input.val();
                            var dateEnd=kendo.parseDate(val,"dd.MM.yyyy");
                            if (ra.dates>=1 && ra.id==model.get("id")  && model.get("send_type") ) {
                                if (!dateEnd ) {
                                    result=false;
                                }
                                else {
                                    if (dateEnd>new Date()) {
                                        return false;
                                    }
                                }
                            }
                            else {
                                if (dateEnd) {
                                    if (kendo.toString(dateEnd,"yyyyMMdd")>kendo.toString(new Date(),"yyyyMMdd")) {
                                        result=false;
                                    }
                                }
                            }
                        }
                        return result;
                    }

                },
                messages: {
                    dateBegRequired:"Дата начала мероприятия должна быть заполнена",
                    dateBegIsDate: "Дата начала должна быть датой в формате дд.мм.гггг",
                    dateBegMaxDate:"Дата начала не может быть больше текушей даты",
                    dateBegMinDate:"Дата начала должна быть в текущем году",
                    dateBegVd2: "Дата начала второго этапа ВД не может быть меньше даты окончания первого этапа",
                    dateEndIsDate:"Дата начала должна быть датой в формате дд.мм.гггг или пустой",
                    dateEndMinDate:"Дата окончания не может быть меньше даты начала",
                    dateEndMaxDate:"Дата окончания не может быть больше текущей даты",
                    dispCodeValid0:"Такое мероприятие уже было зарегистрировано в текущем году",
                    dispCodeValid1:"Второй этап ВД не может быть введен без первого этапа",
                    dispCodeValid2:"Профосмотр не может быть в одном году с ВД"
                }
            });
            return container.data("kendoValidator");
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
                grid.bind("edit",gridEdit);
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
        var doQuery=function(sPatientPin,bShowProgress=false){
            if (!sPatientPin) {
                return;
            }
//            $(gridSelector).hide();
            if (bShowProgress) {
                kendo.ui.progress($(gridSelector),true);

            }


            viewModel.gridDs.read({
                pin: sPatientPin
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
                    doQuery(viewModel.selectedPatient.pin,true);
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
        var options={
            level: 1,
            parentName:"prof-events",
            name:"monitor-du-tfoms",
            label:"Дисп. наблюдение",
            contentHtml:contentHtml,
            tabStripSelector:"",
            viewModel:viewModel,
            onTabIsCurrent: onTabIsCurrent
        };

        var editContainer;

        var myTab= new GeneralTab(options);

        proxy.subscribe("getCurrentPatient",onGetCurrentPatient);

        viewModel.bind("change",onVmChange);


        return viewModel;
    }
);