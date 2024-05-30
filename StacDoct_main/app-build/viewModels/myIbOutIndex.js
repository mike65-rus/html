/**
 * Created by 1 on 21.11.2015.
 */
define(['kendo', 'dataSources/myIbOutDataSource', 'dataSources/ibScopeDataSource','router','services/proxyService'],
    function(kendo, myIbDataSource, ibScopeDataSource,router,proxy) {
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
                    proxy.publish("openIb",{ask_id:selIb.ask_id});
                    this.set("selIb",null);
                    this.dataSource.filter([]); // clear DS filter
                }

            }


        });

        if (myIbDataSource._total==undefined) {
  //          myIbDataSource.transport.read.data={uid: localStorage['last_user'],outed: true};
//            myIbDataSource.read({uid: localStorage['last_user'],outed: true});
        };

        return indexViewModel;

    });
