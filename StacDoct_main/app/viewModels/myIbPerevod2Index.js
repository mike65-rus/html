/**
 * Created by 1 on 21.11.2015.
 */
define(["kendo.all.min", 'dataSources/myIbPerevod2DataSource',
        'router','services/proxyService','kendoHelpers','utils'],
    function(kendo, myIbDataSource,router,proxyService,kendoHelpers,utils) {
        'use strict';
        var curGridPage=null;
        var lastSelectedDataItem = null;
        var grid = $("#grid").data("kendoGrid");
        var onClick = function(event, delegate) {
            event.preventDefault();
            var grid = $("#grid").data("kendoGrid");
            var selectedRow = grid.select();
            var dataItem = grid.dataItem(selectedRow);
            if (selectedRow.length > 0)
                delegate(grid, selectedRow, dataItem);
            else
                alert("Please select a row.");
        };
		
		var lastUser = window.localStorage.last_user;
		
        var indexViewModel;
        /*var showHideGridColumns=function() {
            var $gridSelector=$("#grid");
            var grid=$gridSelector.data("kendoGrid");
            if (grid) {
                if ((JSON.parse(sessionStorage['last_user_role']).rolecode=="VRACH_LDO")) {
                    return;
                }
                if ( (JSON.parse(sessionStorage['last_user_role']).rolecode=="VRACH_DEGURANT")
                    && (indexViewModel.selectedAction.act_descr=="Приемное") ) {
                    grid.showColumn('date_out');
                    grid.showColumn("pl_ek");
                    grid.showColumn("news");
                    grid.showColumn("diag");
                    grid.hideColumn('user_fio');
                    grid.hideColumn('palata');
                    grid.hideColumn('diag2');
                }
                else {
                    grid.hideColumn('date_out');
                    grid.hideColumn("pl_ek");
                    grid.showColumn('user_fio');
                    grid.showColumn('palata');
                    if (indexViewModel.get("selectedAction").act_type==2 ||
                        indexViewModel.get("selectedAction").act_val==="0" ) {
                        grid.hideColumn("diag");
                        // grid.hideColumn("news");
                        grid.showColumn("diag2");
                    }
                    else {
                        grid.showColumn("diag");
                        grid.showColumn("news");
                        grid.hideColumn("diag2");
                    }
                }
                if (window._stacMode=="pk") {
                    grid.hideColumn("palata");
                    grid.showColumn("pin");
                }
                else {
                    grid.hideColumn("pin");
                    grid.showColumn("palata");
                }
            }
        };*/
        indexViewModel = new kendo.data.ObservableObject({
            details: function (event) {
                onClick(event, function (grid, row, dataItem) {
                    router.navigate('/customer/edit/' + dataItem.ask_id);
                });
            },
            onChange: function (arg) {
                var grid = arg.sender;
                lastSelectedDataItem = grid.dataItem(grid.select());
            },
            onRefresh: function () {
                var grid=$("#grid").data("kendoGrid");
                if (grid) {
                    curGridPage=grid.dataSource.page(); // pages index starts with 1
                }
                else {
                    curGridPage=1;
                }
                var that=this;
                myIbDataSource.filter([]);
                myIbDataSource.read(
                    {uid: lastUser}
                ).then(function() {
                    //showHideGridColumns();
                    if (grid) {
                        if (curGridPage && curGridPage <= grid.dataSource.totalPages()) {
                            grid.dataSource.page(curGridPage);
                        }
                    }
                });
            },
            timeoutId:null,
            dataSource: myIbDataSource,
            onDataBound: function (arg) {
                if (lastSelectedDataItem == null) return; // check if there was a row that was selected
                var grid = arg.sender; // get the grid
                var view = this.dataSource.view(); // get all the rows
                for (var i = 0; i < view.length; i++) { // iterate through rows
                    if (view[i].ask_id == lastSelectedDataItem.ask_id) { // find row with the lastSelectedProductd
                        grid.select(grid.table.find("tr[data-uid='" + view[i].uid + "']")); // set the selected row
                        break;
                    }
                }
            },
            getUid: function () {
                return (this.get("selectedAction").act_type==1 ? this.get("selectedAction").act_val : 0);
            },
            getOtdCode: function () {
                return (this.get("selectedAction").act_type==2 ? this.get("selectedAction").act_val : "");
            },
            selIb: null,
            onSearchFieldChange: function(e) {
                var selIb=this.get("selIb");
//                kendo.alert("Value="+e.sender.value()+" selIb="+selIb.fio);
                if (selIb) {
                    if (selIb.ask_id) {
                        proxyService.publish("openIb",{ask_id:selIb.ask_id});
                        this.set("selIb",null);
                    }
                    else {
                        this.set("selIb",null)
                    }
                    this.dataSource.filter([]); // clear DS filter
                }
            },
            onBeforeFiltering: function(e) {
                var filter = e.filter;
//                kendo.alert("Filter="+filter.value);
                if (!filter.value) {
                    //prevent filtering if the filter does not value
                    this.dataSource.filter([]); // clear DS filter
                    e.preventDefault();
                }
                else {
                    if (!isNaN(filter.value)) {
                        e.filter.field="niib_s";
                    }
                    else {
                        e.filter.field="fio";
                    }
                }
            }

        });
		
		indexViewModel.onRefresh();
		
        var onRowDoubleClick=function(dataItem) {
            router.navigate("#/ib/"+dataItem.ask_id);
        };
        var findAction=function(actionName) {
            for (var i=0;i<indexViewModel.actSource._data.length;i++) {
                if (indexViewModel.actSource._data[i].act_descr==actionName) {
                    return indexViewModel.actSource._data[i];
                }
            }
            return null;
        };
        var findActionByIndex=function(iIdx) {
            var oAction=null;
            if ((indexViewModel.actSource._data.length>=iIdx)) {
                oAction=indexViewModel.actSource._data[iIdx];
            }
            return oAction;
        };
        var onNavigateToMe=function() {
            /*try {
                showHideGridColumns();
            }
            catch (ex) {

            }*/
        };
        var onGridIbLinkClicked=function(e) {
            var $aLink=$(e.target);
            if ($aLink.length) {
                if ($($aLink).hasClass("my-ib-link")) {
                    var href=$($aLink).attr("href");
                    var grid = $("#grid").data("kendoGrid");
                    if (grid) {
                        var tr=$($aLink).closest("tr");
                        grid.select(tr);
                        var ds=grid.dataSource;
                        var dataItem=ds.getByUid($(tr).data("uid"));
                        var askId=dataItem.ask_id;
                        lastSelectedDataItem=dataItem;
                        setTimeout(function() {
                            proxyService.publish("navigateCommand","/ib/"+askId);
                        },2);
                    }

                }
            }
        };
        /*setTimeout(function(){
            var grid=$("#grid").data("kendoGrid");
            if (grid) {
                if (!(utils.isMobileDevice())) {
                    kendoHelpers.grid.eventRowDoubleClick(grid, onRowDoubleClick);
                }
            }
        },1000);
		
        proxyService.subscribe("navigateToMyIb",onNavigateToMe);
        proxyService.subscribe("gridIbLinkClicked",onGridIbLinkClicked);

        indexViewModel.bind("set", onSet);
        function onSet(e) {
            if (e.field=="selectedAction") {
                if (e.value) {
                    if (e.value.act_descr=="Стационар") {
                        var lastUserRole=JSON.parse(sessionStorage['last_user_role']).rolecode;
                        if (lastUserRole=="VRACH_OTD") {
                            e.preventDefault();
                            return false;
                        }
                        if (lastUserRole=="ZAV_OTD") {
                            e.preventDefault();
                            return false;
                        }
                    }
                }
            }
        }*/

        return indexViewModel;

    });
