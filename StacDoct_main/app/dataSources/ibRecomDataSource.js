/**
 * Created by STAR_06 on 25.11.2015.
 */
define(['models/ibRecomModel',"kendo.all.min","utils","services/proxyService","viewModels/ib"],
    function(ibRecomModel,kendo,utils,proxyService,ibViewModel) {
//  Рекомендации
        'use strict';
        var getIbRecomSource= new kendo.data.DataSource({
            transport: {
                read: {
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_ib_recomendation",
                    dataType: "json"
                }
            },
            requestStart: function(e) {
                /*
                if (e.type=="read") {
                 if (this.options.batch) {
                     e.preventDefault();
                     console.log("Empty recom request prevented");
//                     proxyService.publish("onRecomReaded",this._data);
                 }
                }
                */
            },
            requestEnd: utils._onRequestEnd,
            batch: true,
            schema: {
                data: "myrecoms.rows",
                total: "records",
                errors: "error",
                model: ibRecomModel
            },
            change: function(e) {
                this.options.batch=false;

                var iRecs=this._data.length;
                var iMode=1;
                if (iRecs>0) {
                    iMode=this._data[0].mode;
                };
                if (iMode==1) { // get for current user
                    proxyService.publish("onRecomReaded",this._data);
                };
                /*
                if (iMode==4) { // all list
                    var sHtml=ibModel.createMyRecoms(this._data);
                    $("#ibRecomList").html(sHtml);
                };
                if (iMode==3) { // get by recomid
                    if (iRecs == 1) {
                        ibModel.showRecomWindow(this._data[0]);
                    }
                }
                */
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return getIbRecomSource;

}
);