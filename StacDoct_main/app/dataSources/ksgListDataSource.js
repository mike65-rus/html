/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ksgModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_ksg_list",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ksg_list.rows",
            total: "records",
            errors: "error",
            model: model
            /*
            parse: function (response) {
                var values = response.ksg_list.rows,
                    n = values.length,
                    i = 0,
                    value;
                for (; i < n; i++) {
                    value = values[i];
                    value.fullName = kendo.format("{0} {1}",
                        value.code,
                        value.name);
                }

                return response;
            }
            */
        },
        error: function(e) {
            proxy.publish("backgroundReadError","ksg");
        },
        change: function(e) {
            proxy.publish("backgroundReaded","ksg");
        }

    });
    return ds;
});