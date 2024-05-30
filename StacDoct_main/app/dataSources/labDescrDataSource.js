/**
 * Created by STAR_06 on 25.11.2015.
 */
define(["kendo.all.min","models/labDescrModel","utils","services/proxyService"],
    function(kendo,model,utils,proxy) {
        //  описания лабораторных показателей
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_lab_descr",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "lab_descr.rows",
                total: "records",
                errors: "error",
                model: model
            }
        });
        return ds;
}
);