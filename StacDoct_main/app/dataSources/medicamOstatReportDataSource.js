/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","utils","services/proxyService"], function(kendo,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/services_AJAX&action2=make_medicam_ostat_report",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "alinks.rows",
                total: "records",
                errors: "error",
                model: {
                    fields: {
                        alink: {type:"string"}
                    }
                }
            },
           change: function(e) {
                proxy.publish("medicamOstatReportCreated",e);
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);