/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=openIbForEdit",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ib_changes.rows",
            total: "records",
            errors: "error",
            model: { id:"id",
                fields: {
                    id: {type:"number"},
                    ask_id: {type:"string"},
                    user_id: {type:"number"},
                    date_omo: {type:"date"},
                    create_ts: {type:"date"},
                    remove_ts: {type:"date"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});