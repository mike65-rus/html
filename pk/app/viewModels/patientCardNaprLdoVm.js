/**
/**
/**
 * This is a Napr-LDO (RIS) part of patientCard
 * @returns {viewModel}
 */
define(['kendo.all.min','kendo-template!views/patientCardNaprLdo','services/proxyService',
        'dataSources/ibRisOrdersDataSource',
        'dataSources/periodLdoDataSource',
        'utils'],
    function(kendo,viewId,proxy,ds,dsPeriod,utils) {
        'use strict';
            var gridSelector = "#ibRisOrders";
            var contentHtml = $("#" + viewId).html();
            var gridDs = ds;
            var periodDs = dsPeriod;
            var myTabStripOrder = 3;
            var myTabStrip = null;
            var selectedDataUids;   // selected by checkboxes data-uid's
            var isMyTabCurrent=false;
            var saveState = function () {

            };
            var restoreState = function () {
                return;

                var grid = $(gridSelector).data("kendoGrid");
                if (!grid) {
                    return;
                }
                ;
                var aArray = [];
                if (selectedDataUids) {
                    aArray = selectedDataUids.split(",");
                }
                var data = grid.dataSource.view();
                data.forEach(function (item, index, array) {
                    var uid = item.uid;
                    if (aArray.indexOf(uid) != -1) {
                        var checkBox = grid.tbody.find("tr[data-uid='" + uid + "']").find("td:first").find(".check_row").first();
                        if (checkBox && checkBox.length) {
                            checkBox.prop("checked", true);
                        }
                    }
                });

            };
        /**
         * set filter to grid dataSource based on currently selected grid cell
         * @param grid
         */
        var trySetFilter=function(grid) {
                return;
                var selCell=grid.select();
                if (!selCell.length) {
                    return;
                }
                var cell=selCell[0];
                if (!cell) {
                    return;
                }
                var aCellsIdx=[2,4,5,6,8];
                var idx=grid.cellIndex(cell);
                if (aCellsIdx.indexOf(idx)==-1) {
                    return;
                }
                var sText=$(cell).text();
                switch (idx) {
                    case 2: // Дата анализа
                        var dDta=kendo.parseDate(sText);
                        grid.dataSource.filter({field:"curdate", operator: "eq", value: dDta});
                        break;
                    case 4: // раздел
                        grid.dataSource.filter({field:"namearm", operator: "eq", value: sText});
                        break;
                    case 5: // Title
                        grid.dataSource.filter({field:"title", operator: "eq", value: sText});
                        break;
                    case 6: // направитель
                        sText=$(cell).next().text();    // полное фио в следующей колонке
                        grid.dataSource.filter({field:"pk_doctor", operator: "eq", value: sText});
                        break;
                    case 8: // Врач-исполнитель
                        sText=$(cell).next().text();    // полное фио в следующей колонке
                        grid.dataSource.filter({field:"namedoct", operator: "eq", value: sText});
                        break;
                }
                var filters=grid.dataSource.filter().filters;
                viewModel.set("isFiltered",(filters.length>0));
            };


            var getPatientLabel = function () {
                var pat = viewModel.get("selectedPatient");
                var sRet = "<Пациент не выбран>"
                if (!pat) {
                    return sRet;
                }
                else {
                    sRet = pat.fio + " " + pat.sex + " " + pat.pin + " ";
                    try {
                        sRet = sRet + " " + pat.birt.toLocaleString().substr(0, 10);
                    }
                    catch (e) {
                        sRet = pat.fio + " " + pat.sex + " " + pat.pin;
                    }
                    return sRet;
                }
            };

            var onRowCheckboxClick = function (e) {
                return;
                var row = $(this).closest("tr");
                var uid = row.attr("data-uid");
                var bChecked = $(e.target).is(":checked") ? true : false;
                var aArray = [];
                if (selectedDataUids) {
                    aArray = selectedDataUids.split(",");
                }
                if (bChecked) {
                    aArray.push(uid)
                }
                else {
                    aArray = _.without(aArray, uid);
                }
                selectedDataUids = aArray.join(",");
            };

            var onHeaderCheckboxClick = function (e) {
                return;
                var grid = $(gridSelector).data("kendoGrid");
                var bCheck = $(e.target).is(":checked");
                var data = grid.dataSource.view();
                var aArray = [];
                if (selectedDataUids) {
                    aArray = selectedDataUids.split(",");
                }
                data.forEach(function (item, index, array) {
                    var uid = item.uid;
                    var checkBox = grid.tbody.find("tr[data-uid='" + uid + "']").find("td:first").find(".check_row").first();
                    checkBox.prop("checked", false);
                    aArray = _.without(aArray, uid);
                    if (bCheck) {
                        aArray.push(uid);
                        checkBox.prop("checked", true);
                    }
                });
                selectedDataUids = aArray.join(",");
            };

            var bindCheckBoxes = function () {
                return;
                var grid = $(gridSelector).data("kendoGrid");
                if (!grid) {
                    return;
                }
                grid.tbody.off('click', ".check_row");
                grid.thead.off('click', ".check_row");
                //
                grid.tbody.on('click', ".check_row", onRowCheckboxClick);
                grid.thead.on('click', ".check_row", onHeaderCheckboxClick);
            };

            var onCellDblClick = function (e) {
                return;
                var cellElement = this;
                var cell = $(cellElement);
                var uid = $(cell).closest("tr").data("uid");
                var grid = $(gridSelector).data("kendoGrid");
                var ds = grid.dataSource;
                var item = ds.getByUid(uid);
                if (item) {
                    var sHtml="<p>"+getPatientLabel()+"</p>"+"<ul class='em14'>";
                    sHtml=sHtml+getOneHtml(item);
                    sHtml=sHtml+"</ul>";
                    tryShowResults(sHtml);
                }
            };

        var bindWidgets=function() {
            kendo.bind($(gridSelector),viewModel);
            kendo.bind("#GridRisToolbar",viewModel);
            var grid=$(gridSelector).data("kendoGrid");
            if (grid) {
                if (grid.dataSource.data().length) {
                    grid.refresh();
                }

            }
            return;

            var selectedPeriod=viewModel.get("selectedPeriod");
            if (!(selectedPeriod)) {
//                viewModel.set("selectedPeriod",viewModel.periodDs[defaultPeriodIndex]);
            }
            else {
                if (grid) {
                    if (grid.dataSource.data().length) {
                        grid.refresh();
                    }

                }
            }
            bindCheckBoxes();
            restoreState();
            grid.tbody.on('dblclick',"td",onCellDblClick);
        };
        var getOneHtml=function(oData) {
            var sHtml="";
            var sHtml=sHtml+"<li class='em14'>";
            sHtml=sHtml+kendo.toString(oData.curdate,"dd.MM.yyyy");
            sHtml=sHtml+" "+oData.namearm+"."+oData.title;
            sHtml=sHtml+" "+oData.namedoct.fio();
            if (oData.pacs_link) {
                sHtml=sHtml+"&nbsp;&nbsp;"+oData.pacs_link;
            }
            sHtml=sHtml+"</li>";
            var sText=utils.textToHtml(oData.text);
            sHtml=sHtml+"<div><blockquote class='em14'>"+sText+"</blockquote></div>";
            return sHtml;
        };
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedPeriod:null,
            isNaprLdoVisible:true,
            gridDs:gridDs,
            periodDs:periodDs,
            filterButtonTitle:"Установить фильтр по значению выделенной ячейки",
            filterButtonIconHtml:"<span class='k-icon k-i-filter k-icon-24'></span>",
            isFiltered:false,
            naprLdoWindow:undefined,
            ibRisQuery: function() {
                if (viewModel.selectedPatient) {
                    doQuery(viewModel.selectedPatient.pin);
                }
            },
            timerStop: function () {
                var obj=viewModel;
                if (obj.get("timerHandle")) {
                    clearInterval(obj.get("timerHandle"));
                    obj.set("timerHandle", null);
                    obj.set("naprLdoWindow", null);
                }
            },
            timerStart: function () {
                var that = viewModel;

                var tHandle= setInterval(function () {
                    var wHandle = that.get("naprLdoWindow");
                    if (wHandle) {
                        try {
                            if (wHandle.isCompleted) {
                                setTimeout(function () {
                                    try {
                                        wHandle.close();
                                    }
                                    catch (e) { }
                                    window.focus();
                                }, 50);
                                that.timerStop();
                                that.ibRisQuery();
                            }
                        }
                        catch (e) {
                            that.timerStop();
                        }
                    }
                }, 1000);
                that.set("timerHandle",tHandle);
            },

            executeNaprLdo: function(selIb) {
                var sUrl="https://"+window.location.hostname+"/hl7planner/Home/plan?";
//                var sUrl="http://stacsrv.hospital.local:8083/hl7planner/Home/plan?";
//                var globalVn=selIb.global_vn;
//                var niib=selIb.niib;
                var sOtd="Тер";
                var lastUserSpec=localStorage['last_user_spec'];
                if (lastUserSpec) {
                    try {
                        var lastUserSpecObj=JSON.parse(lastUserSpec);
                        var sOtd=lastUserSpecObj[0].sotdcode;
                    }
                    catch(ex) {
                        sOtd="Тер";
                    }
                }
                var sPin=selIb.pin;
//                var dnSt=selIb.dnst;
//                var otd=selIb.otd1;
                var fullName=selIb.fio;
                var birthDate=selIb.birt;
                var sex=(selIb.sex=="ж") ? "F": "M";
                var doctor=Number(localStorage['last_user']);
                sUrl=sUrl+"pin="+sPin;
//                sUrl=sUrl+"&"+"niib="+niib.toString();
  //              sUrl=sUrl+"&"+"dst="+dnSt.toString();
                sUrl=sUrl+"&"+"opcode="+"Поликл";
                sUrl=sUrl+"&"+"otd="+sOtd;
                sUrl=sUrl+"&"+"fullname="+fullName;
                sUrl=sUrl+"&"+"birthdate="+kendo.toString(birthDate,"dd.MM.yyyy");
                sUrl=sUrl+"&"+"sex="+sex;
                sUrl=sUrl+"&"+"doctor="+doctor.toString();
                var wnd=window.open(sUrl);
                viewModel.set("naprLdoWindow",wnd);
                if (wnd) {
                    viewModel.timerStart();
                }
            },
			cancelNaprLdo: function(e) {
				var ds=viewModel.get("gridDs");
				var tr = $(e.target).closest("tr");
				var uid=$(tr).attr("data-uid");
				var dataItem=ds.getByUid(uid);
				if (dataItem) {
					var sUrl="https://"+window.location.hostname+"/hl7planner/Home/Cancel?id="+dataItem.id;
					var wnd=window.open(sUrl);
					viewModel.set("naprLdoWindow",wnd);
					if (wnd) {
						viewModel.timerStart();
					}
				}
			},
            doNaprLdo: function() {
                var selIb=this.get("selectedPatient");
                /*
                kendo.confirm("Эта функция экспериментальная!<br>Вы уверены что хотите оформить назначение?")
                    .done(function(){
                    });
                */
                // kendo.alert(selIb.fio);
                viewModel.executeNaprLdo(selIb);
            },
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
                    kendo.alert("Таблица исследований еще не инициализирована!");
                    return;
                }
                if (!selectedDataUids) {
                    kendo.alert("Не выбрано ни одного исследования!!");
                    return;
                }
                var aIds=[];
                var aArray=selectedDataUids.split(",");
                var data=grid.dataSource.view();
                data.forEach(function(item,index,array) {
                    var uid=item.uid;
                    if (aArray.indexOf(uid)!=-1) {
                        aIds.push(item.uid);
                    }
                });
                if (!aIds.length) {
                    kendo.alert("Не выбрано ни одного исследования!");
                    return;
                }
                var sHtml="<p>"+getPatientLabel()+"</p>"+"<ul class='em14'>";

                for (var i=0;i<aIds.length; i++) {
                    var sId=aIds[i];
                    var oData=grid.dataSource.getByUid(sId);
                    sHtml=sHtml+getOneHtml(oData)
                };
                sHtml=sHtml+"</ul>";
                if (sHtml) {
                    tryShowResults(sHtml);
                }
            }
        });

        var tryShowResults = function (sHtml) {
             var resultsHtml = sHtml;
              saveState();
              proxy.publish("navigateCommand", {path: "/show_results", data: resultsHtml});    // subscribed in router
        };
        var clearFilters = function (grid) {
            grid.dataSource.filter({});
            viewModel.set("isFiltered", false);
        };


        var onPatientCardVisible = function (data) {
            var order=data.order;
            var currentTab=data.currentTab;
            if (!(order==myTabStripOrder)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripOrder);
            var tabStrip=data.tabStrip;
            myTabStrip = tabStrip.append({
               text: "Направления в ЛДО (RIS)",
               content: (isMyTabCurrent) ? contentHtml: "<div></div>"
            });
        };
        var doQuery=function(sPin){
            if (!sPin) {
                return;
            }
            $(gridSelector).hide();
            kendo.ui.progress($("#ldo-napr-tab"),true);
            viewModel.gridDs.read({
                ask_id: sPin
//                d1: sDateEnd
            }).
            then(function() {
                    kendo.ui.progress($("#ldo-napr-tab"),false);
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
                    doQuery(viewModel.selectedPatient.pin);
                }
            }
            /*
            if (e.field=="selectedPeriod") {
                if ((viewModel.selectedPatient) && isMyTabCurrent) {
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
            */
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
            //
            if (isMyTabCurrent) {
                viewModel.set("selectedPatient",data.parentModel.selectedPatient);
                bindWidgets();
            }

        };

        proxy.subscribe("patientIssledVisible",onPatientCardVisible);
        proxy.subscribe("issledInternalTabActivated",onTabActivated);
        viewModel.bind("change",onVmChange);

        return viewModel;
    });