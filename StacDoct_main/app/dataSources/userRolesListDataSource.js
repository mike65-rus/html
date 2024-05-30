/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/userRoleModel","utils","services/proxyService"], function(kendo,roleModel,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 20,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/services_AJAX&action2=get_user_roles",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "user_roles.rows",
                total: "records",
                errors: "error",
                model: roleModel
            },
           change: function(e) {
//                kendo.ui.progress($("#myib1"),false);
                proxy.publish("backgroundReaded","user_roles");
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);