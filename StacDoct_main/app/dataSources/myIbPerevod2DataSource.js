define(["kendo.all.min","models/ibModel","utils"], function(kendo,ibModel,utils){
        'use strict';
        var myPerevod2DS=new kendo.data.DataSource({

            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    //url: "https://tele.pgb2.ru/Medsystem/Gb2Ajax/Home/IbListTransferred",
					url: location.origin + "/Medsystem/Gb2Ajax/Home/IbListTransferred",
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
			   try {
                   proxyService.publish("initEnd");
               }
               catch (e) {

               }
            },
            error: function(e) {
                try {
                    utils.ajax_error(e);
                }
                catch (e) {

                }
            }
        });
        return myPerevod2DS;
}
);