/**
 * Created by 1 on 23.11.2015.
 */
define(["kendo.all.min","models/ibModel","utils","services/proxyService"], function(kendo,ibModel,utils,proxyService) {
        'use strict';
        var oneIbSource= new kendo.data.DataSource({
            transport: {
                read: {
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=zakrib",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "curib.rows",
                total: "records",
                errors: "error",
                model: ibModel
            },
            error: function(e) {
                utils.ajax_error(e);
            },
            change: function(e) {
                proxyService.publish("ibReaded",this._data[0]);
            }
        });
        return oneIbSource;
}
);