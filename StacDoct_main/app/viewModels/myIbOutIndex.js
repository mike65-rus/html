/**
 * Created by 1 on 21.11.2015.
 */
define(["kendo.all.min", 'dataSources/myIbOutDataSource', 'dataSources/ibScopeDataSource','router','services/proxyService','kendoHelpers'],
    function(kendo, myIbDataSource, ibScopeDataSource,router,proxy,kendoHelpers) {
        'use strict';
        var lastSelectedDataItem = null;
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

        var indexViewModel;
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
                myIbDataSource.filter([]);
                myIbDataSource.read(
                    {uid: this.getUid(), otd: this.getOtdCode(), outed: "true"}
                );
            },

            dataSource: myIbDataSource,
            actSource: ibScopeDataSource,
            selectedAction: ibScopeDataSource._data[0],
            isChooseScopeVisible:false,
            onDataBound: function (arg) {
                if (lastSelectedDataItem == null) return; // check if there was a row that was selected
                var view = this.dataSource.view(); // get all the rows
                for (var i = 0; i < view.length; i++) { // iterate through rows
                    if (view[i].ask_id == lastSelectedDataItem.ask_id) { // find row with the lastSelectedProductd
                        var grid = arg.sender; // get the grid
                        grid.select(grid.table.find("tr[data-uid='" + view[i].uid + "']")); // set the selected row
                        break;
                    }
                }
            },
            isVisible: function() {
                // is visible actions (scopes) of ib-list
                return (this.actSource.total()>1);
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
                if (selIb) {
                    if (selIb.ask_id) {
                        proxy.publish("openIb",{ask_id:selIb.ask_id});
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

        if (myIbDataSource._total==undefined) {
  //          myIbDataSource.transport.read.data={uid: localStorage['last_user'],outed: true};
//            myIbDataSource.read({uid: localStorage['last_user'],outed: true});
        };
        var onRowDoubleClick=function(dataItem) {
            router.navigate("#/ib/"+dataItem.ask_id);
        };
        setTimeout(function(){
            var grid=$("#grid").data("kendoGrid");
            if (grid) {
                kendoHelpers.grid.eventRowDoubleClick(grid,onRowDoubleClick);
            }
        },1000);
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
        var onIbScopeChanged=function() {
            indexViewModel.set("isChooseScopeVisible",indexViewModel.isVisible());
            if (!indexViewModel.get("isChooseScopeVisible")) {
                var prevScope="";
                try {
                    prevScope=indexViewModel.selectedAction.act_descr;
                }
                catch (ex) {}
                indexViewModel.set("selectedAction",ibScopeDataSource._data[0]);
                if ((!(prevScope==indexViewModel.selectedAction.act_descr) ) ) {
                    indexViewModel.onRefresh();
                }
            }
            else {
                var oRole=sessionStorage['last_user_role'];
                var sRoleCode="";
                var oAction=null;
                if (oRole) {
                    sRoleCode=JSON.parse(oRole).rolecode;
                    if (sRoleCode ) {
                        if (sRoleCode=="ZAV_OTD") {
                            oAction=findActionByIndex(1);
                        }
                        if (sRoleCode=="VRACH_DEGURANT") {
                            oAction=findAction("Приемное");
                        }
                        if (sRoleCode=="ADMIN") {
                            oAction=findAction("Стационар");
                        }
                        if (sRoleCode=="NACH_MED") {
                            oAction=findAction("Стационар");
                        }
                        if (sRoleCode=="VRACH_ORIT") {
                            oAction=findAction("ОРИТ");
                        }
                    }
                    if (oAction)  {
                        indexViewModel.set("selectedAction",oAction);
                        indexViewModel.onRefresh();
                    }

                }
            }
        };
        proxy.subscribe("ibScopeChanged",onIbScopeChanged);

        indexViewModel.set("isChooseScopeVisible",indexViewModel.isVisible());
        return indexViewModel;

    });