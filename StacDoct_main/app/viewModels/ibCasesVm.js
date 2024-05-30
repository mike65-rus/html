/**
 * Created by 1 on 21.11.2015.
 */
define(["kendo.all.min", 'dataSources/ibCasesDataSource','router','services/proxyService','kendoHelpers'],
    function(kendo, myIbDataSource, router,proxy,kendoHelpers) {
        'use strict';
        var viewModel;
        var lastSelectedDataItem = null;
        var gridSelector="#grid";
        var gridToolbarSelector="#GridCasesToolbar";
        var onClick = function(event, delegate) {
            event.preventDefault();
            var grid = $(gridSelector).data("kendoGrid");
            var selectedRow = grid.select();
            var dataItem = grid.dataItem(selectedRow);
            if (selectedRow.length > 0)
                delegate(grid, selectedRow, dataItem);
            else
                alert("Please select a row.");
        };
        var bindWidgets=function() {
            kendo.bind($(gridSelector),viewModel);
            kendo.bind($(gridToolbarSelector),viewModel);
            if (false) {
                try {
                    var grid = $(gridSelector).data("kendoGrid");
                    grid.dataSource.pageSize(5);
                    grid.refresh();
                }
                catch (ex) {

                }
            }
        };
        viewModel = new kendo.data.ObservableObject({
            updateCount:0,
            details: function (event) {
                onClick(event, function (grid, row, dataItem) {
                    router.navigate('/customer/edit/' + dataItem.ask_id);
                });
            },
            update: function() {
                if (viewModel.get("updateCount")) {
                    viewModel.onRefresh();
                }
                else {
//                    viewModel.dataSource.fetch();
                    setTimeout(function() {
                        bindWidgets();
                        viewModel.dataSource.trigger("change");
                    },50);
                }
            },


            onChange: function (arg) {
                var grid = arg.sender;
                lastSelectedDataItem = grid.dataItem(grid.select());
            },
            onRefresh: function () {
//                kendo.ui.progress($("#grid"),true);
//                var selIb = proxy.getSessionObject("selectedIb");
                bindWidgets();
                myIbDataSource.read(
//                    {ask_id:selIb.ask_id}
                ).then(function() {
                });
            },

            dataSource: myIbDataSource,
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
            selIb: null

        });


        var onSelectedIbChanged=function(data) {
            viewModel.set("updateCount",viewModel.get("updateCount")+1);
        };
        proxy.subscribe("selectedIbChanged",onSelectedIbChanged);
        return viewModel;

    });
