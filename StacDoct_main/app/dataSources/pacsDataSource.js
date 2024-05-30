/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","models/pacsModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
    'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=pacs_by_dates&crud_action=read",
                dataType: "json",
                method:"post"
            },
            parameterMap: function(data,type) {
                return "data="+kendo.stringify(data);
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "pacs.rows",
            total: "records",
            errors: "error",
            model:model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    var issuersDs=new kendo.data.DataSource({
        data:[
            {id:"DCM4CHEE",name:"Не описанные"},
            {id:"PGB2",name:"Описанные"},
            {id:"-",name:"Все"}
        ]
    });
    issuersDs.read();
    return {pacsDs:ds,issuersDs:issuersDs}
});