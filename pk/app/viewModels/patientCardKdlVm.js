define(['kendo.all.min','kendo-template!views/patientCardKdl',
        'services/proxyService','dataSources/kdlListDataSource','dataSources/periodKdlDataSource',
        'dataSources/kdlResultsDataSource','utils'],
    function(kendo,viewId,proxy,ds,dsPeriod,dsResults,utils) {
        'use strict';
        var gridSelector="#exams_kdl_grid";
        var contentHtml=$("#"+viewId).html();
        var defaultPeriodIndex=0;
        var gridDs=ds;
        var periodDs=dsPeriod;
        var myTabStripOrder=0;
        var myTabStrip=null;
        var selectedDataUids;   // selected by checkboxes data-uid's
        var resultsDs=dsResults;
        var isMyTabCurrent=false;
        var saveState=function() {

        };
        var restoreState=function() {
            var grid=$(gridSelector).data("kendoGrid");
            if (!grid) {
                return;
            };
            var aArray=[];
            if (selectedDataUids) {
                aArray=selectedDataUids.split(",") ;
            }
            var data=grid.dataSource.view();
            data.forEach(function(item,index,array) {
                var uid=item.uid;
                if (aArray.indexOf(uid)!=-1) {
                    var checkBox=grid.tbody.find("tr[data-uid='"+uid+"']").find("td:first").find(".check_row").first();
                    if (checkBox && checkBox.length) {
                        checkBox.prop("checked",true);
                    }
                }
            });

        };
        var tryShowResults=function() {
            if (resultsDs.data().length) {
                var resultsHtml=resultsDs.data()[0].html;
                saveState();
                proxy.publish("navigateCommand",{path:"/show_results",data:resultsHtml});    // subscribed in router
            }
            else {
                kendo.alert("От сервера не получены результаты!");
            }
        };
        var clearFilters=function(grid) {
            grid.dataSource.filter({});
            viewModel.set("isFiltered",false);
        };
        var trySetFilter = function (grid) {
            var selCell=grid.select();
            if (!selCell.length) {
                return;
            }
            var cell=selCell[0];
            if (!cell) {
                return;
            }
            var aCellsIdx=[2,4,5,6,7];
            var idx=grid.cellIndex(cell);
            if (aCellsIdx.indexOf(idx)==-1) {
                return;
            }
            var sText=$(cell).text();
            switch (idx) {
                case 2: // Дата анализа
                    var dDta=kendo.parseDate(sText);
                    grid.dataSource.filter({field:"data_a", operator: "eq", value: dDta});
                    break;
                case 4: // Анализ
                    grid.dataSource.filter({field:"bl_name", operator: "eq", value: sText});
                    break;
                case 5: // Биометериал
                    grid.dataSource.filter({field:"bm_name", operator: "eq", value: sText});
                    break;
                case 6: // Отделение
                    grid.dataSource.filter({field:"otd", operator: "eq", value: sText});
                    break;
                case 7: // Врач
                    sText=$(cell).next().text();    // полное фио в следующей колонке
                    grid.dataSource.filter({field:"vrach", operator: "eq", value: sText});
                    break;
            }
            var filters=grid.dataSource.filter().filters;
            viewModel.set("isFiltered",(filters.length>0));

        };
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedPeriod:null,
            gridDs:gridDs,
            periodDs:periodDs,
            filterButtonTitle:"Установить фильтр по значению выделенной ячейки",
            filterButtonIconHtml:"<span class='k-icon k-i-filter k-icon-24'></span>",
            isFiltered:false,
            onFilterButtonClick: function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                if (!grid) {
                    return;
                };
                if (viewModel.isFiltered) {
                    clearFilters(grid);
                }
                else {
                    trySetFilter(grid);
                }
            },
            onPrintButtonClick: function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                if (!grid) {
                    kendo.alert("Таблица анализов еще не инициализирована!");
                    return;
                }
                if (!selectedDataUids) {
                    kendo.alert("Не выбрано ни одного анализа!!");
                    return;
                }
                var aIds=[];
                var aArray=selectedDataUids.split(",");
                var data=grid.dataSource.view();
                data.forEach(function(item,index,array) {
                    var uid=item.uid;
                    if (aArray.indexOf(uid)!=-1) {
                        aIds.push(item.get("iddoc"));
                    }
                });
                if (!aIds.length) {
                    kendo.alert("Не выбрано ни одного анализа!");
                    return;
                }
                var sIds=aIds.join(",");
                kendo.ui.progress($(gridSelector),true);
                resultsDs.read({
                    ids: sIds,
                    patient: "<div style='margin-top:5px;margin-bottom:10px'>"+getPatientLabel()+"</div>"
                }).then(function() {
                    kendo.ui.progress($(gridSelector),false);
                    utils._onRequestEnd();
                    tryShowResults();
                });
            }
        });
        var getPatientLabel=function() {
            var pat=viewModel.get("selectedPatient");
            var sRet="<Пациент не выбран>"
            if (!pat) {
                return sRet;
            }
            else {
                sRet=pat.fio+" "+pat.sex+" "+pat.pin+" ";
                try {
                    sRet=sRet+" "+pat.birt.toLocaleString().substr(0,10);
                }
                catch (e) {
                    sRet=pat.fio+" "+pat.sex+" "+pat.pin;
                }
                return sRet;
            }
        };
        var onRowCheckboxClick=function(e) {
            var row = $(this).closest("tr");
            var uid=row.attr("data-uid");
            var bChecked=$(e.target).is(":checked") ? true : false;
            var aArray=[];
            if (selectedDataUids) {
                aArray=selectedDataUids.split(",") ;
            }
            if (bChecked) {
                aArray.push(uid)
            }
            else {
                aArray= _.without(aArray,uid);
            }
            selectedDataUids=aArray.join(",");
        };
        var onHeaderCheckboxClick=function(e) {
            var grid=$(gridSelector).data("kendoGrid");
            var bCheck=$(e.target).is(":checked");
            var data=grid.dataSource.view();
            var aArray=[];
            if (selectedDataUids) {
                aArray=selectedDataUids.split(",") ;
            }
            data.forEach(function(item,index,array) {
                var uid=item.uid;
                var checkBox=grid.tbody.find("tr[data-uid='"+uid+"']").find("td:first").find(".check_row").first();
                checkBox.prop("checked",false);
                aArray= _.without(aArray,uid);
                if (bCheck) {
                    aArray.push(uid);
                    checkBox.prop("checked",true);
                }
            });
            selectedDataUids=aArray.join(",");
        };
        var bindCheckBoxes=function() {
            var grid=$(gridSelector).data("kendoGrid");
            if (!grid) {
                return;
            }
            grid.tbody.off('click',".check_row");
            grid.thead.off('click',".check_row");
            //
            grid.tbody.on('click',".check_row",onRowCheckboxClick);
            grid.thead.on('click',".check_row",onHeaderCheckboxClick);
        };
        var onCellDblClick=function(e) {
            var cellElement = this;
            var cell = $(cellElement);
            var uid=$(cell).closest("tr").data("uid");
            var grid=$(gridSelector).data("kendoGrid");
            var ds=grid.dataSource;
            var item=ds.getByUid(uid);
            if (item) {
                kendo.ui.progress($(gridSelector),true);
                resultsDs.read({
                    ids: item.get("iddoc"),
                    patient: "<div style='margin-top:5px;margin-bottom:10px'>"+getPatientLabel()+"</div>"
                }).then(function() {
                    kendo.ui.progress($(gridSelector),false);
                    utils._onRequestEnd();
                    tryShowResults();
                });

            }

        };
        var bindWidgets=function() {
            kendo.bind($(gridSelector),viewModel);
            kendo.bind("#exams-kdl-toolbar",viewModel);
            var grid=$(gridSelector).data("kendoGrid");
            var selectedPeriod=viewModel.get("selectedPeriod");
            if (!(selectedPeriod)) {
                setTimeout(function(){
//                    viewModel.set("selectedPeriod",viewModel.periodDs[defaultPeriodIndex]);
                },10);
            }
            else {
                if (grid) {
                    if (grid.dataSource.data().length) {
//                            grid.dataSource.fetch();
                        grid.refresh();
                    }

                }
            }
            bindCheckBoxes();
            restoreState();
            grid.tbody.on('dblclick',"td",onCellDblClick);
        };
        var onPatientCardVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            if (!(order==myTabStripOrder)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripOrder);
            var tabStrip=data.tabStrip;
            myTabStrip = tabStrip.append({
                text: "КДЛ",
                content: (isMyTabCurrent) ? contentHtml: "<div></div>"
            });
        };
        var doQuery=function(sPin,sDateEnd){
            if (!sPin) {
                return;
            }
            if (!sDateEnd) {
                return;
            }
            $(gridSelector).hide();
            kendo.ui.progress($("#kdl-tab"),true);
            viewModel.gridDs.read({
                ask_id: sPin,
                d1: sDateEnd,
                fio: viewModel.selectedPatient.fio,
                sex:viewModel.selectedPatient.sex,
                birt:kendo.toString(viewModel.selectedPatient.birt,"yyyyMMdd")
            }).
            then(function() {
                kendo.ui.progress($("#kdl-tab"),false);
                $(gridSelector).show();
                var grid=$(gridSelector).data("kendoGrid");
                if (grid) {
                    grid.resize();
                    grid.refresh();
                }
                utils._onRequestEnd();
            });
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {
                    selectedDataUids=null;
                    viewModel.selectedPeriod=null;
                    viewModel.set("selectedPeriod",viewModel.periodDs[defaultPeriodIndex]);  // месяц
                    viewModel.set("isFiltered",false);
                    var filter=viewModel.gridDs.filter();
                    if (filter) {
                        if (filter.filters.length) {
                            viewModel.gridDs.filter({});
                        }
                    }
                }
            }
            if ((e.field=="selectedPeriod") && isMyTabCurrent) {
                if (viewModel.selectedPatient) {
                    if (viewModel.selectedPeriod) {
                        var periodVal=viewModel.selectedPeriod.value;
                        var d1=kendo.toString(utils.addDays(new Date(),0-periodVal),"yyyyMMdd");
                        doQuery(viewModel.selectedPatient.pin,d1);
                    }
                }
            }
            if (e.field=="isFiltered") {
                if (viewModel.isFiltered) {
                    viewModel.set("filterButtonTitle","Сбросить фильтр");
                    viewModel.set("filterButtonIconHtml","<span class='k-icon k-i-filter-clear k-icon-24'></span>");
                }
                else {
                    viewModel.set("filterButtonTitle","Установить фильтр по значению текущей ячейки");
                    viewModel.set("filterButtonIconHtml","<span class='k-icon k-i-filter k-icon-24'></span>");
                }
            }
        };
        var onTabActivated=function(data) {
            var idx=data.index;
            if (!(idx==myTabStripOrder)) {
                return;
            }
            // resize grid
            var contentElement=data.content;
            $(gridSelector).css("height",($(contentElement).height()-5)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
  //          viewModel.set("selectedPatient",data.parentModel.selectedPatient);
            if (isMyTabCurrent) {
                viewModel.set("selectedPatient",data.parentModel.selectedPatient);
                bindWidgets();
            }
        };
        proxy.subscribe("patientIssledVisible",onPatientCardVisible);
        proxy.subscribe("issledInternalTabActivated",onTabActivated);
        viewModel.bind("change",onVmChange);

        return viewModel;
    }
);