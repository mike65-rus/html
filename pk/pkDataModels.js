// new 2018
//
/* посещения */
var dataModels=
    {
    Visit: kendo.data.Model.define({
        id: "id",
        fields: {
            id: {editable: false, nullable: true, type: "number"},
            case_id: {editable: true, nullable: false, type: "number"},
            user_id: {type: "number"},
            user_name: {type: "string"},
            otd_id: {type: "number"},
            otd_name: {type: "string"},
            spec_id: {type: "number"},
            spec_name: {type: "string"},
            visit_code: {type: "number", defaultValue: 0},
            d_start: {type: "date", defaultValue: new Date(), validation: {required: true}},
            ist_fin: {type: "number", defaultValue: 1}
        }
    })
}



