/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/visitModel",'dataSources/notClosedVisitsDataSource',"utils","services/proxyService"],
    function(kendo,model,notClosedDs,utils,proxy){
        'use strict';
        var updateNotClosedVisitsDs=function(e,that,notClosedVisitsDs) {
            var ds=that;
            var response=e.response;
            if (!response) {
                return;
            }
            if (response.error) {
                return;
            }
            if (!(response.visits)) {
                return;
            }
            var data=response.visits.rows;
            if (e.type=="read") {
                // remove all items
                for (var i=notClosedVisitsDs.data().length-1;i>=0;i--) {
                    var item2=notClosedVisitsDs.at(i);
                    notClosedVisitsDs.remove(item2);
                }
            }
            for (var i=0;i<data.length;i++) {
                var item=data[i];
                var item2=notClosedVisitsDs.get(item.visit_id);
                if (item2) {
                    notClosedVisitsDs.remove(item2);
                }
                if (!(item.talon_id)) {
                     if ((Number(item.visit_type)>=1) && (Number(item.visit_type)<=12)) {
                         var curUser=Number(localStorage['last+user']);
                         if (!(curUser==Number(item.user_id))) {
                             notClosedVisitsDs.add(item);
                         }
                     }
                }
            }
            for (var i=0; i<notClosedVisitsDs.data().length;i++) {
                var item2=notClosedVisitsDs.at(i);
                item2.visit_date=kendo.parseDate(item2.visit_date,"yyyy-MM-ddTHH:mm:sszzz");
            }
            notClosedVisitsDs.sort({field:"visit_date",dir:"asc"});
          //  console.log(notClosedVisitsDs.data());
        };

        var ds=new kendo.data.DataSource({
            batch: false,
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            transport: {
                read: {
                    url:"default.aspx?action=pk/cases_AJAX&action2=patient_visits_crud&crud_action=read",
                    dataType: "json"
                },
                create:{
                    url:"default.aspx?action=pk/cases_AJAX&action2=patient_visits_crud&crud_action=create",
                    dataType: "json"
                },
                update:{
                    url:"default.aspx?action=pk/cases_AJAX&action2=patient_visits_crud&crud_action=update",
                    dataType: "json"
                },
                destroy:{
                    url:"default.aspx?action=pk/cases_AJAX&action2=patient_visits_crud&crud_action=destroy",
                    dataType: "json"
                },
                parameterMap: function(data,type) {
                        return "data="+kendo.stringify(data);
                }
            },
            schema: {
                data: "visits.rows",
                total: "records",
                errors: "error",
                model: model,
                sort: {
                    field: "visit_date", dir: "desc"
                }
            },
            requestEnd: function(e) {
                updateNotClosedVisitsDs(e,this,notClosedDs);
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