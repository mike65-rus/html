/**
 * Created by STAR_06 on 30.11.2015.
 */
define(["kendo.all.min", 'dataSources/ibNewsDataSource','router','services/proxyService'],
    function(kendo, newsDs,router,proxy) {
        'use strict';
        var lastSelectedDataItem = null;
        var viewModel;
        var gridSelector="#ibNewsGrid";
        var bindWidgets=function() {
            kendo.bind($(gridSelector),viewModel);
            kendo.bind($("#btnRefreshNews"),viewModel);
            try {
                var grid = $(gridSelector).data("kendoGrid");
                grid.dataSource.pageSize(grid.dataSource.total());
                grid.refresh();
            }
            catch (ex) {

            }
        };
        viewModel = new kendo.data.ObservableObject({
            updateCount:0,
            dataSource: newsDs.newsReadDs,
            updateDs: newsDs.newsUpdateDs,
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
//                kendo.ui.progress($("#ibNewsGrid"),true);
                viewModel.dataSource.read()
                    .then(function() {
                        bindWidgets();
                    });
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
                        bindWidgets();
                    },50);
                }
            }


        });
        var onNewsChange=function(e) {
            try {
                kendo.ui.progress($("ibNewsGrid"), false);
            }
            catch (e) {

            }
        };
//        proxy.subscribe("newsChange",onNewsChange);
        var onSelectedIbChanged=function(data) {
            viewModel.set("updateCount",viewModel.get("updateCount")+1);
        };
        var onNewsOpen=function(data) {
            var selIb=proxy.getSessionObject("selectedIb");
            if (!(selIb.user_id===Number(localStorage['last_user']))) {
                return;
            }
            var sDocList=[],sys_id= 0,ask_id="";
            var ds=viewModel.dataSource;
            for (var i=0; i<ds.total();i=i+1) {
                if (ds._data[i].ext3===data) {
                    if (ds._data[i].sys_id==1) {
                        // КДЛ
                        sDocList.push(ds._data[i].iddoc);
                    }
                    else {
                        // ЛДО
                        sDocList.push(ds._data[i].ext3);
                    }
                    sys_id=ds._data[i].sys_id;
                    ask_id=ds._data[i].ask_id;
                    ds._data.splice(i,1);
                }
            }
            if (sDocList.length>0) {
//                sDocList=sDocList.substr(0,sDocList.length-1);
                if (selIb.user_id===Number(localStorage['last_user'])) {
                    viewModel.updateDs.read({
                        ask_id: ask_id,
                        sys_id: sys_id,
                        doc_list: sDocList.join()
                    });
                }
            }

//            ds.fetch();
            ds.trigger("change");
        };
        var onNewsReaded=function(data) {
            var ds=viewModel.dataSource;
            var selIb=proxy.getSessionObject("selectedIb");
            var aId=selIb.ask_id;
            if (ds._data) {
                if (ds._data.length) {
//                    console.log(ds.data());
                    var senderAskId=data.ask_id;
                    var senderSysId=data.sys_id;
                    var sDocList=[];
                    for (var i=0; i<ds.total();i=i+1) {
                        var dataItem=ds._data[i];
                        if (dataItem.ask_id==senderAskId) {
                            if (dataItem.sys_id==senderSysId) {
                                switch (dataItem.sys_id) {
                                    case 1:
                                        // КДЛ
                                        sDocList.push(dataItem.iddoc);
                                        break;
                                    case 2:
                                        // ЛДО
                                        sDocList.push(dataItem.ext3);
                                        break;
                                }
                            }
                        }
                    }
                    if (sDocList.length) {
                        if (selIb.user_id===Number(localStorage['last_user'])) {
                            viewModel.updateDs.read({
                                ask_id: senderAskId,
                                sys_id: senderSysId,
                                doc_list: sDocList.join()
                            }).then(function() {
                                viewModel.dataSource.read();
                            });
                        }
                    }

                }
            }
        };
        proxy.subscribe("selectedIbChanged",onSelectedIbChanged);

        proxy.subscribe("newsOpen",onNewsOpen);

        proxy.subscribe("newsReaded",onNewsReaded);   // published from ibLdoVm and ibKldVm

        return viewModel;
    }
);
