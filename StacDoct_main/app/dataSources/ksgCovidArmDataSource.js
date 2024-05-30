/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/ksgCovidArmModel","utils","services/proxyService"],
    function(kendo,model,utils,proxyService){
        'use strict';
        var ds=new kendo.data.DataSource({
            transport: {
                read: {
                    url: "default.aspx?action=StacDoct_main/mkb_AJAX&action2=get_covid_arm_table",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "covid_arm.rows",
                total: "records",
                errors: "error",
                model:model
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return ds;
}
);