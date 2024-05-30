/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/kdlListModel","utils","services/proxyService"], function(kendo,model,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({
            batch: "true",
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            transport: {
                read: "default.aspx?action=pk/pk_lab_AJAX&action2=show",
                dataType: "json"
            },
            schema: {
                data: "ids.rows",
                total: "records",
                errors: "error",
                model: {
                    fields: {
                        html: {
                            type: "string"
                        }
                    }
                }
            }
        });
        return ds;
    }
);