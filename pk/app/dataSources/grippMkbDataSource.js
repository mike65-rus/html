define(["kendo.all.min","utils"],
    function(kendo,utils) {
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 100,
            transport: {
                read: "default.aspx?action=StacDoct_main/MKB_AJAX&action2=get_gripp_pnevm",
                dataType: "json"
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "gp.rows",
                total: "records",
                errors: "error",
                model: {
                    fields: {
                        id: { type: "string" },
                        name: { type: "string" }
                    }
                }
            }
        });
        return ds;
    }
);