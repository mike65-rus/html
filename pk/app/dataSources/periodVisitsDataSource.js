/**
 * Created by 1 on 07.04.2018.
 * pk.mainMenu dataSource
 */
define(["kendo.all.min"],function(kendo) {
    'use strict';
    var ds=
        [
            { text: "3 года", value: 31*12*3 },
            { text: "5 лет", value: 31*12*5 },
            { text: "10 лет", value: 31*12*10 },
            { text: "20 лет", value: 31*12*20 },
            { text: "более 20 лет", value: 31*12*200 }
        ];
        return ds;
});