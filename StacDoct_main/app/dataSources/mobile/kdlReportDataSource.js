/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/labReportModel"],function(kendo,model){
    'use strict';
    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/lab_AJAX&action2=make_lab_report",
                dataType: "json"
            }
        },
        schema: {
            data: "alinks.rows",
            total: "records",
            errors: "error",
            model: model
        },
        sort: [
            {field: "data_a", dir: "desc"},
            {field: "time", dir: "desc"}
        ],
        error: function(e) {
//            utils.ajax_error(e);
        }

    });
    return ds;
});