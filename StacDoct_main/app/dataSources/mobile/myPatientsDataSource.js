/**
 * Created by STAR_06 on 18.11.2015.
 * Мои пациенты
 */
define(["kendo.all.min","models/ibModel"], function(kendo,ibModel){
        'use strict';
        var myIbDS=new kendo.data.DataSource({
            offlineStorage: {
                getItem: function() {
                    return JSON.parse(sessionStorage.getItem("patients-key"));
                },
                setItem: function(item) {
                    sessionStorage.setItem("patients-key", JSON.stringify(item));
                }
            },
            serverPaging: false,
            serverSorting: false,
            pageSize: 60000,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=myib",
                    dataType: "json"
                }
            },
            schema: {
                data: "myib.rows",
                total: "records",
                errors: "error",
                model: ibModel
            },
            sort: [
                {field:"fio",dir:"asc"}
            ]
        });
        return myIbDS;
    }
);
//data:{uid: localStorage['last_user'],outed: false},
