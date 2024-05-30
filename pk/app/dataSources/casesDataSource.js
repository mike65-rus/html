/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/casesModel","utils","services/proxyService"],
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
                    url:"default.aspx?action=pk/cases_AJAX&action2=cases_crud_2&crud_action=read",
                    dataType: "json"
                },
                create:{
                    url:"default.aspx?action=pk/cases_AJAX&action2=cases_crud_2&crud_action=create",
                    dataType: "json",
                    type:"post"
                },
                update:{
                    url:"default.aspx?action=pk/cases_AJAX&action2=cases_crud_2&crud_action=update",
                    dataType: "json",
                    type:"post"
                },
                destroy:{
                    url:"default.aspx?action=pk/cases_AJAX&action2=cases_crud_2m&crud_action=destroy",
                    dataType: "json",
                    type:"post"
                },
                parameterMap: function(data,type) {
                    return "data="+kendo.stringify(data);
                }
            },
            schema: {
                data: "cases.rows",
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