/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/profEventsMonitorTfomsModel","utils","services/proxyService"],
    function(kendo,model,utils,proxy){
        'use strict';

        var ds=new kendo.data.DataSource({
            batch: false,
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            transport: {
                read: {
                    url:"default.aspx?action=pk/cases_AJAX&action2=mon_prof_history",
                    dataType: "json"
                }
            },
            schema: {
                data: "mon_prof_h.rows",
                total: "records",
                errors: "error",
                model: model,
                sort: {
                    field: "created", dir: "desc"
                }
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