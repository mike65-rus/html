/**
 * Created by 1 on 29.11.2015.
 */
define(['models/ibRecomModel',"kendo.all.min","utils","services/proxyService"], function(ibRecomModel,kendo,utils,proxy) {
    'use strict';
    var ds;
    ds=new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=update_ib_recomendation",
                dataType: "json"
            }
        },
        requestStart: utils._onRequestStart,
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "myrecoms.rows",
            total: "records",
            errors: "error",
            model: ibRecomModel
        },
        change: function(e) {
            proxy.publish("recomUpdated");
        },
        error: function(e) {
            utils.ajax_error(e);
        }

    });
    return ds;
});