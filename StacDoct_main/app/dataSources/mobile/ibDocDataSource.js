define(["kendo.all.min","models/ibDocModel"],
    function(kendo,model) {
    'use strict';

    var ds = new kendo.data.DataSource({
        pageSize: 100,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ibDoc",
                dataType: "json"
            }
        },
        schema: {
            data: "ibdoc.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function (e) {
//            utils.ajax_error(e);
        }
    });
    return ds;
});
