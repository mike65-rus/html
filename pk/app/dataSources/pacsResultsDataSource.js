define(["kendo.all.min","utils","services/proxyService"], function(kendo,model,utils,proxy){
    'use strict';
    var ds=new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=pacs",
                dataType: "json"
            }
        },
        schema: {
            data: "alinks.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                  ahtml:{ type:"string"}
                }
            }
        }
    });
    return ds;
});
