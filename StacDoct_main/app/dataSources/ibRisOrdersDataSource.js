/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","models/ibRisModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 10000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=get_ris_orders",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ris_orders.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});