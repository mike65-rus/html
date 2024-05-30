/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ibDocModel"],function(kendo,model){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ibDocs",
                dataType: "json"
            }
        },
        schema: {
            data: "ibdocs.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
//            utils.ajax_error(e);
        }
    });
    return ds;
});