/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ibDocModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ibDocs",
                dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    var forAll=proxy.getSessionObject("forAllCases");
                    return {
                        ask_id: selIb.ask_id,
                        forAllCases: (forAll) ? "1":""
                    }
                }
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ibdocs.rows",
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