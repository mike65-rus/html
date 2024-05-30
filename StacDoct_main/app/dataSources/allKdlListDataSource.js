/**
 * Created by STAR_06 on 25.11.2015.
 */
define(['models/allIssledModel',"kendo.all.min","utils","services/proxyService"], function(allRecomModel,kendo,utils,proxy) {
//  Рекомендации
        'use strict';
        var ds= new kendo.data.DataSource({
            data:[],
            schema: {
                model: allRecomModel
            },
            change: function(e) {
                proxy.publish("allRecomendationsChanged",e.sender._data || []);
            },
            error: function(e) {
                // utils.ajax_error(e);
            }
        });
        return ds;

}
);