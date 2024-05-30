/**
 * Created by 1 on 07.04.2018.
 * pk.mainMenu dataSource
 */
define(["kendo.all.min"],function(kendo) {
    'use strict';
    var ds=
        [
            { text: "Месяц", value: 31 },
            { text: "Квартал", value: 31*3 },
            { text: "Пол года", value: 31*6 },
            { text: "9 месяцев", value: 31*9 },
            { text: "Год", value: 31*12 },
            { text: "2 года", value: 31*12*2 }
        ];
        return ds;
});