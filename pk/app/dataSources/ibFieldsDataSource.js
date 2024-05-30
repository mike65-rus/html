/**
 * Created by STAR_06 on 04.12.2015.
 * get all fields from Ib
 */
define(["kendo.all.min","models/ibFieldsModel","utils","services/proxyService"],
    function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 10000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ib_fields",
                dataType: "json",
                /*
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {
                        ask_id: selIb.ask_id
                    }
                } */
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ib_fields.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});