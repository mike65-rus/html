/**
 * Created by 1 on 28.11.2015.
 */
define(['kendo', 'dataSources/ibRecomListDataSource',
        'router','services/proxyService','viewModels/recomEditor'],
    function(kendo,recomDs,router,proxy,recomEditor) {
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            recomDs:recomDs,
            updateCount:0,
            onRefresh: function() {
                viewModel.recomDs.read();
                viewModel.set("updateCount",0);
            },
            onListViewChange: function(e) {
                var data=recomDs.view();
                var widget= e.sender;
                var row=widget.select();
                var dataItem=widget.dataItem(row);
//                console.log("Selected: " + dataItem.recomid);
                recomEditor.edit(dataItem);
            },
            update: function() {
                if (viewModel.get("updateCount")) {
                    viewModel.onRefresh();
                }
            }


        });
        var onSelectedIbChanged=function(data) {
            viewModel.set("updateCount",viewModel.get("updateCount")+1);
        };
        var onRecomUpdated=function() {
            viewModel.onRefresh();
        };

        proxy.subscribe("selectedIbChanged",onSelectedIbChanged);
        proxy.subscribe("recomUpdated",onRecomUpdated);
        return viewModel;
    }
);