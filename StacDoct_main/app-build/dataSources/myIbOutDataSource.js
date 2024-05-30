/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo","models/ibModel","utils"], function(kendo,ibModel,utils){
        var myIbDS=new kendo.data.DataSource({
            type: "json",
            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=myib",
                    data: {uid: localStorage['last_user'],outed: true},
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "myib.rows",
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
        return myIbDS;
}
);