/**
 * Created by 1 on 21.11.2015.
 */
define(['kendo', 'dataSources/myIbInDataSource', 'router','services/proxyService'],
    function(kendo, myIbDataSource, router, proxy) {
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

                );
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
            selIb: null,
            onSearchFieldChange: function(e) {
                var selIb=this.get("selIb");
                if (selIb) {
                    proxy.publish("openIb",{ask_id:selIb.ask_id});
                    this.set("selIb",null);
                    this.dataSource.filter([]); // clear DS filter
                }

            }

        });

        if (myIbDataSource._total==undefined) {
//            myIbDataSource.read();
        }

        return indexViewModel;

    });
