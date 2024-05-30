/**
 * Created by 1 on 22.11.2015.
 */
define(["kendo","utils","services/proxyService"], function(kendo,utils,proxyService){
    var ibScopeDataSource= new kendo.data.DataSource({
        serverPaging: false,
        serverSorting: false,
        pageSize: 15,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=myib_act",
                dataType: "json"
            }
        },
        schema: {
            data: "actions.rows",
            total: "records",
            errors: "error"
        },
        requestEnd: utils._onRequestEnd,
        error: function(e) {
            utils.ajax_error(e);
        },
        change: function(e) {
            proxyService.publish("ibScopeReady");
        }
    });
    return ibScopeDataSource;
});
