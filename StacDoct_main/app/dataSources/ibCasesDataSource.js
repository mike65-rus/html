/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ibCasesModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 5,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibCases_AJAX&action2=get_cases",
                dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {
                        ask_id: selIb.ask_id
                    }
                }
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "stcases.rows",
            total: "records",
            errors: "error",
            model: model
        },
        sort: [
            {field: "date_ask", dir: "desc"}
        ],
        error: function(e) {
            utils.ajax_error(e);
        },
        change: function(e) {
            proxy.publish("ibCasesReaded");
        }
    });
    return ds;
});