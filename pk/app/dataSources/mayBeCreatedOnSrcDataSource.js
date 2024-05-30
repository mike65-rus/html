/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/mayBeCreatedOnSrcModel","utils","services/proxyService"],
    function(kendo,model,utils,proxy){
        'use strict';

        var ds=new kendo.data.DataSource({
            batch: false,
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            autoSync:false,
            transport: {
                read: {
                    url:"default.aspx?action=pk/PKDOCS_AJAX&action2=get_created_on_src",
                    dataType: "json"
                }
            },
            schema: {
                data: "dista.rows",
                total: "records",
                errors: "error",
                model: model
            },
            requestEnd: function(e) {
//                updateNotClosedVisitsDs(e,this,notClosedDs);
            }
            /*
            change: function(e) {
                console.log(e);
            }
            */
        });
        return ds;
    }
);