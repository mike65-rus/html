/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/mkbKsgModel","utils","services/proxyService"],
    function(kendo,model,utils,proxyService){
        'use strict';
        var ds=new kendo.data.DataSource({
            transport: {
                read: {
                    url: "default.aspx?action=StacDoct_main/services_AJAX&action2=mkb_list_with_ksg",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "mkb_ksg.rows",
                total: "records",
                errors: "error",
                model:model
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);