/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/userSpecialityModel","utils","services/proxyService"], function(kendo,model,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
//            pageSize: 100000, // pageSize works incorrect with kendoListBox
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=pk/CASES_AJAX&action2=get_user_spec",
                    dataType: "json"
                }
            },
            schema: {
                data: "otdspec.items",
                total: "records",
                errors: "error",
                model: model
            },
            error: function(e) {
                // utils.ajax_error(e);
                proxy.publish("readError",e);
            }
        });
        return ds;
    }
);