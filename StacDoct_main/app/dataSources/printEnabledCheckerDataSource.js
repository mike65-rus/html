/**
 * Created by STAR_06 on 25.11.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],
    function(kendo,utils,proxy) {
//  print Enabled
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/printEnabled_AJAX&action2=check_print_enabled",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "print.rows",
                total: "records",
                errors: "error",
                model: {
                    fields: {
                        is_print: {type:"number"},
                        reason: {type:"string"}
                    }
                }
            },
        });
        return ds;

}
);