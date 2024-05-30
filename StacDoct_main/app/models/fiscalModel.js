/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "sluch_id",
            fields: {
                sluch_id: { type: "string" },
                user_id: {
                    type: "number"
                },
                arm_id: {type: "number"},
                created: {
                    type: "date"
                },
                otd: {type:"string"},
                otkaz:{ type:"number"},
                in_vyp:{type:"number"},
                ksg:{type:"string"},
				ksg_id:{type:"number"},
				ves:{type:"number"},
                ksg_name:{type:"string"},
                mkb:{type:"string"},
                mkb2:{type:"string"},
                mkb_name:{type:"string"},
                mkb2_name:{type:"string"},
                mkb_vers:{type:"number"},
                isxod:{type:"number"},
                result:{type:"number"},
                summa:{type:"number"},
                czab: {type:"number"},
                usl_list:{type:"string"},
                fss_answer:{type:"number"},
                fss_num:{type:"string"},
                fss_d1:{type:"date"},
                fss_d2:{type:"date"},
                fss_d3:{type:"date"},
                fss_inoe:{type:"string"},
                kslp1:{type:"number"},
                kslp1_detail:{type:"number"},
                kslp2:{type:"number"},
                kslp2_detail:{type:"number"},
                kslp3:{type:"number"},
                kslp3_detail:{type:"number"},
            }
        });
        return model;
    }
);