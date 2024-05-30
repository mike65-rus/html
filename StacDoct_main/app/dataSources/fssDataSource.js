/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/fiscalModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&&action2=read_fss",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "fss.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    ln_num:{ type: "string" },
                    ln_d1:{type:"date"},
                    ln_d2:{type:"date"},
                    ln_d3:{type:"date"},
                    vrach:{type:"string"},
                    dolg:{type:"string"},
                    inoe:{type:"string"},
                    src:{type:"string"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});