/**
 * Created by 1 on 07.04.2018.
 * pk.mainMenu dataSource
 */
define(["kendo.all.min",'models/deseasesDetailsModel'],function(kendo,model) {
    'use strict';
    var ds=new kendo.data.DataSource({
        data:[],
        schema: {
            model:model
        }
    });
    return ds;
});