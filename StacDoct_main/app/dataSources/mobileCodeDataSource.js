/**
 * Created by 1 on 22.11.2015.
 */
define(["kendo.all.min","utils","services/proxyService"], function(kendo,utils,proxyService){
    'use strict';
    var ds= new kendo.data.DataSource({
        serverPaging: false,
        serverSorting: false,
        pageSize: 15,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_mobile_code",
                dataType: "json"
            }
        },
        schema: {
            data: "mob_code.rows",
            total: "records",
            errors: "error"
        },
        requestEnd: utils._onRequestEnd,
        error: function(e) {
            utils.ajax_error(e);
        },
        change: function(e) {
//            proxyService.publish("mobileCodeChanged");
        }
    });
    return ds;
});
