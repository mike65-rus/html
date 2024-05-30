/**
 * Created by 1 on 21.11.2015.
 */
define(["kendo.all.min", 'dataSources/arxIbDataSource', 'dataSources/ibScopeDataSource','router','services/proxyService',
        'alertify','kendoHelpers'],
    function(kendo, myIbDataSource, ibScopeDataSource,router,proxyService,alertify,kendoHelpers) {
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

        var viewModel;
        viewModel = new kendo.data.ObservableObject({
            onChange: function (arg) {
                var grid = arg.sender;
                lastSelectedDataItem = grid.dataItem(grid.select());
            },
            onRefresh: function () {
                var sFio=viewModel.get("sText") || "";
                sFio=sFio.trim();
                if (sFio && sFio.length<2) {
                    alertify.alert("Уточните поисковый критерий!");
                    return;
                 }
                else {
                    myIbDataSource.read(
                        {uid: this.getUid(), otd: this.getOtdCode(), outed: "true",omoCheck: "true",fio: sFio }
                    );
                }
            },

            dataSource: myIbDataSource,
            actSource: ibScopeDataSource,
            selectedAction: ibScopeDataSource._data[0],
            sText:"",
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
            update: function() {
                var ds=viewModel.get("dataSource");
                if (ds.total()) {
                    setTimeout(function(){
                        ds.fetch();
                    },50);
                }
                setTimeout(function() {
                    var $input=$("#ib-selector-arxpac");
                    $input.focus();
                    $input.off("keyup");
                    $input.on("keyup",function(e) {
                        if (e.keyCode === 13) {
                            if ($input.val().trim().length>=2) {
                                $("#btnRefresh4").click();
                            }
                        }
                    });

                },500);
            }
        });
        var onArxReaded=function(data) {
            viewModel.get("dataSource").fetch();
        };
        proxyService.subscribe("arxReaded",onArxReaded);
        /*
        var onRowDoubleClick=function(dataItem) {
            router.navigate("#/ib/"+dataItem.ask_id);
        };
        setTimeout(function(){
            var grid=$("#grid").data("kendoGrid");
            kendoHelpers.grid.eventRowDoubleClick(grid,onRowDoubleClick);
        },50);
        */
        var findAction=function(actionName) {
            var indexViewModel=viewModel;
            for (var i=0;i<indexViewModel.actSource._data.length;i++) {
                if (indexViewModel.actSource._data[i].act_descr==actionName) {
                    return indexViewModel.actSource._data[i];
                }
            }
            return null;
        };
        var findActionByIndex=function(iIdx) {
            var oAction=null;
            var indexViewModel=viewModel;
            if ((indexViewModel.actSource._data.length>=iIdx)) {
                oAction=indexViewModel.actSource._data[iIdx];
            }
            return oAction;
        };
        var onIbScopeChanged=function() {
            var indexViewModel=viewModel;
            indexViewModel.set("isChooseScopeVisible",indexViewModel.isVisible());
            if (!indexViewModel.get("isChooseScopeVisible")) {
                var prevScope="";
                try {
                    prevScope=indexViewModel.selectedAction.act_descr;
                }
                catch (ex) {}
                indexViewModel.set("selectedAction",ibScopeDataSource._data[0]);
                if ((!(prevScope==indexViewModel.selectedAction.act_descr) ) ) {
//                    indexViewModel.onRefresh();
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
//                            oAction=findAction("Приемное");
                        }
                        if (sRoleCode=="ADMIN") {
                            oAction=findAction("Стационар");
                        }
                        if (sRoleCode=="NACH_MED") {
                            oAction=findAction("Стационар");
                        }
                        if (sRoleCode=="VRACH_ORIT") {
//                            oAction=findAction("ОРИТ");
                        }
                    }
                    if (oAction)  {
                        viewModel.set("selectedAction",oAction);
                    }
              }
            }
        };

        proxyService.subscribe("ibScopeChanged",onIbScopeChanged);

        return viewModel;

    });
