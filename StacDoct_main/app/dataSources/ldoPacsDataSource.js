/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ldoReportModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=pacs",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "alinks.rows",
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