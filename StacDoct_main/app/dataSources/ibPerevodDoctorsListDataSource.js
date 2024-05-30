/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getUsersByOtdel",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "otd1.rows",
            total: "records",
            errors: "error",
            model: { id:"user_id",
                fields: {
                    user_id: {type:"number"},
                    user_name: {type:"string"},
                    is_shef: {type:"boolean"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});