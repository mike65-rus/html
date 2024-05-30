/**
 * Created by 1 on 07.04.2018.
 */
define(['kendo.all.min','services/proxyService','dataSources/mainMenuDataSource'],function(kendo,proxy,dataSource) {
    'use strict';
    var viewModel;
    var findDataItemUrl= function(text,ds) {
        // menu items MUST have unique text !!!
        if (Array.isArray(ds)) {    // на всякий случай
            for (var i=0;i<ds.length;i++) {
                var dsEl=ds[i];
                if (dsEl.items) {
                    if (dsEl.items.length) {
                        return findDataItemUrl(text,dsEl.items);    // recursive call
                    }
                }
                else {
                    if ((dsEl.text) && (dsEl.text==text)) {
                        return dsEl;
                    }
                }
            }
       }
       return null;
    };
    viewModel= new kendo.data.ObservableObject({
        onSelect: function(e) {
//            var menuItem=findDataItemUrl($(e.item).text(),dataSource);
            var menuItem=$(e.item);
            if (menuItem && menuItem.attr("url")) {
//                console.log(menuItem.attr.url);
                proxy.publish("navigateCommand","/"+menuItem.attr("url"));
            }
        },
        initMenu: function() {
            var ds= dataSource;
            var menuEl=$("#main-menu");
            $(menuEl).kendoMenu({
                dataSource:ds,
                select: viewModel.onSelect
            });
        }
    });
    return viewModel;
} );

