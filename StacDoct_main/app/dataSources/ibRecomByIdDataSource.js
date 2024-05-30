/**
 * Created by STAR_06 on 09.04.2019.
 */
define(['models/ibRecomModel',"kendo.all.min","utils","services/proxyService"],
    function(ibRecomModel,kendo,utils,proxyService) {
//  Рекомендации по списку recomid
        'use strict';
        var ds= new kendo.data.DataSource({
            transport: {
                read: {
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_ib_recoms_by_ids",
                    dataType: "json"
                }
            },
            requestStart: function(e) {
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "myrecoms.rows",
                total: "records",
                errors: "error",
                model: ibRecomModel
            },
            change: function(e) {
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);