/**
 * Created by 1 on 08.01.2015.
 */
/* обращения=талоны */
var ModelCase=kendo.data.Model.define({
    id: "case_id",
    fields: {
        case_id: {editable: false, nullable: true, type: "number"},
        user_id:{type:"number"},
        pin: {type:"string", validation: {required:true}},
        fam: {type: "string"},
        ima: {type:"string"},
        otch: {type:"string"},
        d_birt: {type:"string"},
        gender: {type:"string"},
        fio: {type:"string"},
        d_start: {type: "date"},
        d_end: {type: "date",nullable: true},
        spec_id: {type: "number"},
        otd_id: {type: "number"}
    },
    init: function (data) {
        kendo.data.Model.fn.init.call(this, data);
        // set up a change handler
        this.bind('change', this._onChange);
    },
    _onChange: function (e) {
        // call the base function
        kendo.data.Model.fn._notifyChange.call(this, e);
        this.dirty=true;
    }
});
/* посещения */
var ModelVisit=kendo.data.Model.define({
    id: "visit_id",
    fields: {
        visit_id: {editable: false, nullable: true, type: "number"},
        case_id: {editable: true, nullable: false, type: "number"},
        user_id:{type:"number"},
        otd_id: {type: "number"},
        spec_id: {type: "number"},
        visit_code: {type:"number",defaultValue:1,
            validation:{
                required:true,visitCodeValidation: function(input) {
                    if (input.is("[name='visit_code']")) {
                        input.attr("data-visitCodeValidation-msg", "Необходимо указать верный код посещения!");
                        return _.find(visitTypesDS.data(),function(obj){return obj.code==input.val()});
                    }
                    return true;
                }
            }
        },
        d_start: {type: "date",defaultValue:roundMinutes(new Date(),10),validation:{required:true}},
        ist_fin: {type:"number", defaultValue:1}
    },
    visit_name: function() {
        var sRet="";
        var code=this.get("visit_code");
        for (var i=0;i<visitTypesDS.data().length;i++) {
            if (visitTypesDS.data()[i].code==code) {
                sRet=visitTypesDS.data()[i].name;
                break;
            }
        }
        return sRet;
    }
});
/* услуги */
var ModelUsl=kendo.data.Model.define({
    id: "usl_id",
    fields: {
        usl_id: {editable: false, nullable: true, type: "number"},
        case_id: {editable: true, nullable: false, type: "number"},
        visit_id: {editable: true, nullable: false, type: "number"},
        usl_med_rab:{type:"number"},
        usl_vn:{type:"number"},
        usl_kol:{type:"number"},
        usl_date:{type:"date"},
        otd_id: {type: "number"},
        spec_id: {type: "number"},
        ist_fin: {type:"number", defaultValue:1},
        usl_num: {type:"string",defaultValue:1,
            validation:{
                required:true,uslCodeValidation: function(input) {
                    if (input.is("[name='usl_code']")) {
                        input.val(input.val().toUpperCase().trim());
                        input.attr("data-uslCodeValidation-msg", "Необходимо указать верный код услуги!");
                        return _.find(kodifDS.data(),function(obj){return obj.num==input.val()});
                    }
                    return true;
                }
            }
        }
    },
    usl_name: function() {
        var sRet="";
        var code=this.get("usl_num");
        for (var i=0;i<kodifDS.data().length;i++) {
            if (kodifDS.data()[i].num==code) {
                sRet=kodifDS.data()[i].name;
                break;
            }
        }
        return sRet;
    },
    usl_vn_read: function() {
        var nRet=0;
        var code=this.get("usl_num");
        for (var i=0;i<kodifDS.data().length;i++) {
            if (kodifDS.data()[i].num==code) {
                nRet=kodifDS.data()[i].vn;
                this.set("usl_vn",nRet);
                break;
            }
        }
        return nRet;
    }

});
var ModelOtdSpec=kendo.data.Model.define({
    fields: {
        notdid: {type:"number"},
        nspecid: {type:"number"},
        sotdcode: {type:"string"},
        sotdname:{type:"string"},
        nspeccode:{type:"number"},
        sspecname:{type:"string"}
    }
});
var ModelVisitTypes=kendo.data.Model.define({
    fields: {
        code: {type:"number"},
        name: {type:"string"},
        codarm: {type:"number"},
        dend:{type:"date",nullable:true}
    }
});
var ModelKodif=kendo.data.Model.define({
    fields: {
        vn: {type:"number"},
        num: {type:"string"},
        name: {type:"string"},
        vid: {type:"number"}
    }
});


