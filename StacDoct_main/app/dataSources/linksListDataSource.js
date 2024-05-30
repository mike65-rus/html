/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/linksModel","utils","services/proxyService"], function(kendo,model,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 5,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/services_AJAX&action2=links_list",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "links_list.rows",
                total: "records",
                errors: "error",
                model: model
            },
           change: function(e) {
//                proxy.publish("medicamOstatReportCreated",e);
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);