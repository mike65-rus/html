/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","models/sysEventsModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=sys_events&crud_action=read",
                dataType: "json",
                method: "post"
            },
            update: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=sys_events&crud_action=update",
                dataType: "json",
                method: "post"
            },
            create: {
                url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=sys_events&crud_action=create",
                dataType: "json",
                method: "post"
            },
            parameterMap: function(data,type) {
                return "data="+kendo.stringify(data);
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "sys_events.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});