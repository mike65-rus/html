/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getOtdUsers",
                dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {
                        otd1:selIb.otd1,
                        otd2:selIb.otd2,
                        mode: selIb.user_id ? 1:3
                    }
                }
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