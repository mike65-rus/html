/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getStacMode",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "stac_mode.rows",
            total: "records",
            errors: "error",
        },
        error: function(e) {
//            utils.ajax_error(e);
            utils.setStacMode(e.errors);    // oSession("StacMode") returned in erros
        }
    });
    return ds;
});