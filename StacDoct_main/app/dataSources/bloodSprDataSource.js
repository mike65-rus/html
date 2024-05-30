define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var dsBloodGroups= new kendo.data.DataSource({
            data:['0(I)','A(II)','B(III)','AB(IV)']
        });
        var dsBloodRezuses=new kendo.data.DataSource({
            data:["Rh+","Rh-"]
        });
        var dsBloodFenotypes=new kendo.data.DataSource({
            data:[
                "CcDee",
                "CCDee",
                "CcDEe",
                "ccddee",
                "ccDEe",
                "C(w)CDee",
                "ccDEE",
                "C(w)cDee",
                "ccDee",
                "Ccdee",
                "C(w)cDEe",
                "ccD(weak)ee"
            ]
        });
        dsBloodGroups.read();
        dsBloodRezuses.read();
        dsBloodFenotypes.read();
        return {groups:dsBloodGroups,rezus:dsBloodRezuses,fenotypes:dsBloodFenotypes};
    }
);