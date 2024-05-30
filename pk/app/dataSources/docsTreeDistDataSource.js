/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],function(kendo,utils,proxy){
   'use strict';
    var ds = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: "default.aspx?action=pk/PKDOCS_AJAX&action2=get_all_dist_docs_vid",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "docs",
            errors: "error",
            model: {
                id: "doc_type",
                children: "sub_items.docs",
                hasChildren: function (item) {
                    var bRet=false;
                    try {
                        bRet=item.sub_items.docs.length > 0;
                    }
                    catch(e) {
                        bRet=false;
                    }
                    return bRet;
                }
            }
        },
        error: function(e) {
            // utils.ajax_error(e);
            proxy.publish("readError",e);
        }
    });
    return ds;
});