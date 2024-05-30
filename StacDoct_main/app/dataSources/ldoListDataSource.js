/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ldoListModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=list",
                dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {
                        ask_id: selIb.ask_id,
                        sort_order: "desc"
                    }
                }
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "lablist.rows",
            total: "records",
            errors: "error",
            model: model
        },
        sort: [
            {field: "curdate", dir: "desc"},
            {field: "curtime", dir: "desc"}
        ],
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});