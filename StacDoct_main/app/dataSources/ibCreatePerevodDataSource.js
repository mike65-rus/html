/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=createPerevod",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "pere.rows",
            total: "records",
            errors: "error",
            model: { id:"id",
                fields: {
                    id: {type:"number"},
                    ask_id:{type:"string"},
                    perevod_date:{type:"date"},
                    perevod_time:{type:"string"},
                    user_id:{type:"number"},
                    new_user_id:{type:"number"},
                    otd_id:{type:"number"},
                    new_otd_id:{type:"number"},
                    new_otd_id2:{type:"number"},
                    creator:{type:"number"},
                    create_time:{type:"date"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});