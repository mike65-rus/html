/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getAllShefs",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "shefs.rows",
            total: "records",
            errors: "error",
            model: { id:"otdid",
                fields: {
                    otdid: {type:"number"},
                    user_name: {type:"string"},
                    user_fio: {type:"string"},
                    otd_code: {type:"string"},
                    otd_name: {type:"string"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});