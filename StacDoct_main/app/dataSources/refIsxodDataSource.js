/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/refsModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 2000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ref",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ref.rows",
            total: "records",
            errors: "error",
            model: model
        },
        change: function(e) {
            proxy.publish("backgroundReaded","refIsxod");
        },
        error: function(e) {
            proxy.publish("backgroundReadError","refIsxod");
        }

    });
    return ds;
});