/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"record_id",
            fields: {
/*				id:{type:"number",nullable:true},	*/
				ask_id:{type:"string"},
				blood_type:{type:"string"},
				rh:{type:"string"},
				phenotype:{type:"string"},
				hb:{type:"number"},
				ht:{type:"number"},
				indications:{type:"string"},
				component:{type:"string"},
				volume:{type:"number"},
				purpose:{type:"string"},
				pregnancy_anamnesis:{type:"string"},
				transfusion_anamnesis:{type:"string"},
				user_id:{type:"number"},
				patient_name:{type:"string"},
				patient_age:{type:"number"},
				niib:{type:"number"},
				curdate:{type:"date"},
				otd:{type:"string"},
				diagnosis:{type:"string"},
				direction:{type:"string"},
				record_id:{type:"string"},
				doses:{type:"number"}
            }

        });
        return model;

    }
);
