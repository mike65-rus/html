    define(["kendo.all.min","models/pkDocModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 10000,
        transport: {
            read: {
              url:"default.aspx?action=pk/PKDOCS_AJAX&action2=patient_docs_crud&crud_action=read",
              dataType: "json",
              type:"post"
            },
            parameterMap: function(data,type) {
                return "data="+kendo.stringify(data);
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "patdocs.rows",
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