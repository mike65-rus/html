/**
 * Created by 1 on 21.11.2015.
 */
define(["kendo.all.min", 'dataSources/allRecomListDataSource', 'models/allRecomModel',
        'dataSources/allLdoListDataSource',
        'dataSources/allKdlListDataSource',
        'dataSources/adminInfoDataSource',
        'dataSources/notificationsDataSource',
        'dataSources/ibPlanOutDataSource',
        'router','services/proxyService','utils','kendoHelpers'],
    function(kendo, ds, model, dsLdo, dsKdl, dsAdmInfo, dsNotifications, dsIbPlanOut, router, proxy,utils,kendoHelpers) {
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
            onRefresh: function () {
                indexViewModel.dataSource.read();
            },
            dataSource: ds,
            dataSourceLdo:dsLdo,
            dataSourceKdl:dsKdl,
            dataSourceAdmInfo:dsAdmInfo,
            dataSourceNotifications:dsNotifications,
            dataSourceIbPlanOut:dsIbPlanOut,
            onChange: function (arg) {
                var grid = arg.sender;
                lastSelectedDataItem = grid.dataItem(grid.select());
            },
            onDataBound: function (arg) {
                if (lastSelectedDataItem == null) return; // check if there was a row that was selected
                var grid = arg.sender; // get the grid
                var view = this.dataSource.view(); // get all the rows
                for (var i = 0; i < view.length; i++) { // iterate through rows
                    if (view[i].recomid == lastSelectedDataItem.recomid) { // find row with the lastSelectedProductd
                        try {
                            grid.select(grid.table.find("tr[data-uid='" + view[i].uid + "']")); // set the selected row
                        }
                        catch (ex) {
                        }
                        break;
                    }
                }
            },
            markAsReaded: function(e) {
                var id=$(e.target).attr("id");
                var itemId=Number(id.substr(3));
                var dataItem=dsNotifications.get(itemId);
                if (dataItem) {
                    var items=[];
                    items.push(dataItem.id);
                    dataItem.set("viewdatetime",new Date());
                    var $markButton=$("button#b2-"+itemId.toString());
                    $markButton.html(dataItem.markButtonHtml()).attr("disabled","disabled");
                    proxy.publish("updateNotificationsViewDateTime",{items:items}); // subscribed in mainMenu
                }
                return dataItem;
            },
            openIb:function(e) {
                var dataItem=indexViewModel.markAsReaded(e);
                if (dataItem) {
                    proxy.publish("navigateCommand","/ib/"+dataItem.ask_id);    // subscribed in router
                }
            },
            onNotificationsDataBound: function(e) {
//                lastNotifications=kendo.stringify(e.sender.dataItems());
            },
            onTabSelect: function(e) {
                var contentElement=e.contentElement;
                var mainDiv=$(contentElement);
                //.find("div").first();
                var height=utils.getAvailableHeight()-50-20-20;
                $(mainDiv).css("height",height.toString()+"px");
                $(mainDiv).css("overflow-y","hidden");
                $(mainDiv).resize();


                return;
                /*
                var tabStrip=e.sender;
                var itemIndex=tabStrip.select().index();
                if (itemIndex>=0) {
                    var href=window.location.href;
                    if (href.indexOf("?q=")>0) {
                        var q=Number(href.substr(href.length-1))-1;
                        if (!(q==itemIndex)) {
                            e.preventDefault();
                            setTimeout(function() {
                                proxy.publish("navigateCommand",href.replace("?q="+q.toString(),"?q="+(itemIndex+1).toString()));
                            },2);
                        }
                    }
                }
                */
            }

        });

        var onRowDoubleClick=function(dataItem) {
            var suffix="";
            if (dataItem.ext1) {
                if (dataItem.ext1.startsWith("{")) {
                    suffix="/"+dataItem.ext1;
                }
            }
            router.navigate("#/ib/"+dataItem.ask_id+suffix);
        };
        var onNavigateToMe=function(data) {
            if (data.q) {
                var $tabStripEl=$("#recom-tabs");
                if ($tabStripEl.length) {
                    var tabStrip=$tabStripEl.data("kendoTabStrip");
                    if (tabStrip) {
                        try {
                            tabStrip.select(data.q-1);
                        }
                        catch (ex) {
                        }
                    }
                }
            }
        };
        var onNewRecomendationsData=function() {
            var scrollTop=-1;
            var $tabStripEl=$("#recom-tabs");
            if ($tabStripEl.length) {
                var tabStrip = $tabStripEl.data("kendoTabStrip");
                if (tabStrip) {
                    var curTab=tabStrip.select();
                    if (curTab) {
                        var idx=curTab.index();
                        var contentHolder=tabStrip.contentHolder(idx);
                        var gridEl=$(contentHolder).find("div.ibgrid");
                        if (gridEl.length) {
                            var gridContent=gridEl.find(".k-grid-content").first();
                            if (gridContent.length) {
                                scrollTop=$(gridContent).scrollTop();
                            }
                        }
                    }
                }
            }
            kendo.ui.progress($("#app"),true);
            var tmId=setTimeout(function() {
                kendo.ui.progress($("#app"),false);
                if (scrollTop>=0) {
                    $(gridContent).scrollTop(scrollTop);
                }
                clearTimeout(tmId);
            },1000*3);
        };
        setTimeout(function(){
            var grid=$("#grid").data("kendoGrid");
            kendoHelpers.grid.eventRowDoubleClick(grid,onRowDoubleClick);
        },1000);
        proxy.subscribe("navigateToRecomendations",onNavigateToMe);
        proxy.subscribe("newRecomendationsData",onNewRecomendationsData);
        return indexViewModel;

    });
