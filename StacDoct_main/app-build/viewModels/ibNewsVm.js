/**
 * Created by STAR_06 on 30.11.2015.
 */
define(['kendo', 'dataSources/ibNewsDataSource','router','services/proxyService'],
    function(kendo, newsDs,router,proxy) {
        var lastSelectedDataItem = null;
        var viewModel;
        viewModel = new kendo.data.ObservableObject({
            updateCount:0,
            dataSource: newsDs.newsReadDs,
            onChange: function (arg) {
                var grid = arg.sender;
                lastSelectedDataItem = grid.dataItem(grid.select());
            },
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
            onRefresh: function() {
//                viewModel.dataSource.options.batch=false;
                viewModel.dataSource.read();
                viewModel.set("updateCount",0);
            },
            update: function() {
                if (viewModel.get("updateCount")) {
                    viewModel.onRefresh();
                }
                else {
//                    viewModel.dataSource.fetch();
                    setTimeout(function() {
                        viewModel.dataSource.trigger("change");
                    },50);
                }
            }


        });
        var onSelectedIbChanged=function(data) {
            viewModel.set("updateCount",viewModel.get("updateCount")+1);
        };
        proxy.subscribe("selectedIbChanged",onSelectedIbChanged);

        return viewModel;
    }
);
