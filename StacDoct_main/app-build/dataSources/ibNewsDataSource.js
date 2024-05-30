/**
 * Created by 1 on 29.11.2015.
 */
define(['models/ibNewsModel',"kendo","utils","services/proxyService"], function(ibNewsModel,kendo,utils,proxy) {
    var newsRead = new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        pageSize: 15,
        transport: {
            read: {
                url:"default.aspx?action=StacDoct_main/ibNews_AJAX&action2=list",
                dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {ask_id:selIb.ask_id}
                }
            }
        },
//        batch: true,
        requestStart: function(e) {
            if (e.type=="read") {
                if (this.options.batch) {
                    e.preventDefault();
                    console.log("Empty news request prevented");
//                    proxy.publish("onRecomReaded",this._data);
                }
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ibnews.rows",
            total: "records",
            errors: "error",
            model: ibNewsModel,
            sort: {
                field: "curdate", dir: "desc",
                field: "curtime", dir: "desc"
            }
        },
        change: function (e) {
  //          this.options.batch=true;
//            updateMyIbNewsStatus(this);
        },
        error: function (e) {
//            this.options.batch=true;
            utils.ajax_error(e);
        }
    });
    var newsUpdate=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        pageSize: 15,
        transport: {
            read: {
               url:"default.aspx?action=StacDoct_main/ibNews_AJAX&action2=set_last_view",
                dataType: "json"
            }
        },
        schema: {
            data: "issl_upd.rows",
            total: "records",
            errors: "error"
        },
        error: function(e) {
            utils.ajax_error(e);
        },
        change: function(e) {
            // ibModel.readNews();
        }
    });
    return {
        newsReadDs: newsRead,
        newsUpdateDs: newsUpdate
    }
});