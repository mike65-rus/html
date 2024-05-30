/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/kodifModel","utils","services/proxyService"], function(kendo,model,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=pk/CASES_AJAX&action2=get_kodif",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "kodif.rows",
                total: "records",
                errors: "error",
                model: model
            },
            error: function(e) {
//                utils.ajax_error(e);
//                throw new Error(e);
                proxy.publish("readError",e);
            }
        });
        return ds;
    }
);