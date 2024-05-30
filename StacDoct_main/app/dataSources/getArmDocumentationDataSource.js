/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getArmDocumentation",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "links.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    fname: {type: "string"},
                    url: {type: "string"},
                    dta: {type: "date"},
                    app_build: {type:"date"},
                    app_build_time: {type:"string"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});