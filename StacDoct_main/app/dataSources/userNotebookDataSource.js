/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/notebookModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_notebook",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "notebook.rows",
            total: "records",
            errors: "error",
            model: model,
            parse: function(response) {
                var values=response.notebook.rows;
                var n=values.length;
                for (var i=0;i<n;i=i+1) {
                    var html=utils.removeClasses(utils.removeInlineStyles(values[i].html));
                    values[i].html=html;
                }
                return response;
            }
        },
        change: function(e) {
            proxy.publish("backgroundReaded","userNotebook");
        },
        error: function(e) {
            proxy.publish("backgroundReadError","userNotebook");
        }

    });
    return ds;
});