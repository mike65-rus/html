/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/fiscalModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var dsRead = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&&action2=get_fiscal",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "fiscal.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    var dsSave = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&&action2=save_fiscal",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "fiscal.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });

    return {
        dsRead:dsRead,
        dsSave:dsSave
    };
});