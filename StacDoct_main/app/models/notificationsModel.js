/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            subSystemIcon: function() {
                var sRet="";
                if (this.subsystem==1) {
                    sRet="fa fa-desktop";
                }
                if (this.subsystem==2) {
                    sRet="fa fa-flask";
                }
                return sRet;
            },
            importantIcon: function() {
                var sRet="fa fa-info-circle";
                    if  (this.important==1) {
                        sRet="fa fa-exclamation-triangle";
                    }
                return sRet;
            },
            viewIcon: function() {
                var sRet="";
                if (this.viewdatetime) {
                    sRet="fa fa-check-square-o";
                }
                return sRet;
            },
            isCheckReadedEnabled: function() {
                var bRet=true;
                if (this.viewdatetime) {
                    bRet=false;
                }
                return bRet;
            },
            markButtonHtml: function() {
                var sRet="Отметить как прочитанное";
                if (this.viewdatetime) {
                    sRet=" <span style='font-size:smaller'>Прочитано "+ kendo.toString(this.viewdatetime,'dd.MM.yyyy - HH:mm')+"</span>"
                }
                return sRet;
            },
            id:"id",
            fields: {
                id: {type:"number"},
                ask_id:{type:"string"},
                curdatetime:{type:"date"},
                important:{type:"number"},
                niib:{type:"number"},
                patient_name:{type:"string"},
                sender:{type:"string"},
                subsystem:{type:"number"},
                sys_id:{type:"number"},
                text:{type:"string"},
                uid1:{type:"number"},
                uid2:{type:"number"},
                user_id:{type:"number"},
                viewdatetime:{type:"date"}
            }
        });
        return model;
    }
);
