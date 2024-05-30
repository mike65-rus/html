define(["kendo.all.min","models/ibModel","utils"], function(kendo,ibModel,utils){
        'use strict';
        var myObservationDS=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "https://tele.pgb2.ru/Medsystem/Gb2Ajax/home/observationlist",
					//url: "http://localhost/Medsystem/Gb2Ajax/home/observationlist",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "rowlist.rows",
                total: "records",
                errors: "error",
                model: ibModel
            },
            change: function(e) {
//                kendo.ui.progress($("#myib1"),false);
//                amplify.publish("initEnd");
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return myObservationDS;
}
);