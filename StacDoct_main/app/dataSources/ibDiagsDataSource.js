/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getIbDiags",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ibd.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    ask_id: {type:"string"},
                    pac_name: {type:"string"},
                    ib_no: {type:"number"},
                    dta: {type:"date"},
                    user_id: {type:"number"},
                    user_name: {type:"string"},
                    doc_id: {type:"number"},
                    doc_descr:{type:"string"},
                    diag1: {type:"string"},
                    diag2: {type:"string"},
                    diag3: {type:"string"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});