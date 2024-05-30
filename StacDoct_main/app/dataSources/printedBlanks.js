/**
 * Created by STAR_06 on 25.11.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],
    function(kendo,utils,proxy) {
//  cancer
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 100,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_printed_blanks",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "p_blanks.rows",
                total: "records",
                errors: "error",
                model: {
                    id : "ask_id",
                    fields: {
                        ask_id: {type:"string"},
                        xray: {type:"number"}
                    }
                }
            },
        });
        return ds;

}
);