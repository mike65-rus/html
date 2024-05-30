/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/ibModel","utils","services/proxyService"], function(kendo,ibModel,utils,proxyService){
        'use strict';
        var myIbDS=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=myib",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "myib.rows",
                total: "records",
                errors: "error",
                model: ibModel
            },
            change: function(e) {
//                kendo.ui.progress($("#myib1"),false);
               try {
                   proxyService.publish("initEnd");
               }
               catch (e) {

               }
            },
            error: function(e) {
                try {
                    utils.ajax_error(e);
                }
                catch (e) {

                }
            }
        });
        return myIbDS;
}
);
//data:{uid: localStorage['last_user'],outed: false},
