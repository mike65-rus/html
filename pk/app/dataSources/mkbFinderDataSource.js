define(["kendo.all.min","models/duEventsMonitorTfomsModel","utils","services/proxyService"],
    function(kendo,model,utils,proxy){
        'use strict';

        var ds=new kendo.data.DataSource({
            pageSize:100000,
            batch: false,
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            transport: {
                read: {
                    url: "default.aspx?action=pk/cases_AJAX&action2=get_matched_mkb_2",
                    dataType: "json",
                },
                parameterMap: function(data,type) {
//                    return "filter="+data.filter.filters[0].value;
                  return "filter="+data.filter1;
                }
            },
            schema: {
                data: "mkb.rows",
                total: "records",
                errors: "error",
                model: {
                    id: "id",
                    fields: {
                        id: {type: "string"}, // primary key
                        name:{type:"string"}
                    }
                },
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