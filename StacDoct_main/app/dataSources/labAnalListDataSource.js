/**
 * Created by STAR_06 on 25.11.2015.
 */
define(['models/labListModel',"kendo.all.min","utils","services/proxyService"],
    function(model,kendo,utils,proxy) {
//  Admin data
        'use strict';
        var ds= new kendo.data.DataSource({
            data:[],
            schema: {
                model: model
            },
            change: function(e) {
//                proxy.publish("allRecomendationsChanged",e.sender._data || []);
            },
            error: function(e) {
                // utils.ajax_error(e);
            }
        });
        return ds;

}
);