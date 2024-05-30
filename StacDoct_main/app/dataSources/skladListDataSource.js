/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/skladModel","utils","services/proxyService"], function(kendo,skladModel,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 1000,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/services_AJAX&action2=sklad_list",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "sklad_list.rows",
                total: "records",
                errors: "error",
                model: skladModel
            },
//           change: function(e) {
//                kendo.ui.progress($("#myib1"),false);
//                proxyService.publish("arxReaded");
//            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);