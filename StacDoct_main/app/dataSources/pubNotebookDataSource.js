/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/notebookModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_public_notebook",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "pub_notes.rows",
            total: "records",
            errors: "error",
            model: model,
            parse: function(response) {
                var values=response.pub_notes.rows;
                var n=values.length;
                for (var i=0;i<n;i=i+1) {
                    var sId=(values[i].record_id).toString();
                    values[i].record_id=sId;
                }
                return response;
            }

        },
        change: function(e) {
            proxy.publish("backgroundReaded","publicNotebook");
        },
        error: function(e) {
            proxy.publish("backgroundReadError","publicNotebook");
        }

    });
    return ds;
});