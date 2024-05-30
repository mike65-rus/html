define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type:"number"}, // primary key
                created:{type:"date"},  // timestamp
                updated:{type:"date"},  // timestamp NULL
                user_id:{type:"number"}, // id врача по AVFP
                user_name:{type:"string"},  // наименование врача
                disp_code:{type:"string"},  // код мероприятия ДВ4-первый этап ВД, ДВ2-второй этап ВД, ОПВ-проф.осмотр
                pin:{type:"string"},    // varchar 10
                evn:{type:"number"},    // evn in konti
                fa:{type:"string"},  //varchar 50
                im:{type:"string"}, //varchar 50
                ot:{type:"string"}, //varchar 50    NULL
                sex:{type:"string"}, //char 1
                birt:{type:"date"}, // date
                polis_vid:{type:"number"},  // 1-старый, 2- временное, 3-ЕНП
                polis:{type:"string"},  // varchar 40
                date_beg:{type:"date",nullable: false, validation:{required:true}}, // дата начала мероприятия date
                date_end:{type:"date"}, // date NULL дата окончания мероприятия
                send_dt:{type:"date"},  // timestamp
                send_type:{type:"number"}, // признак заполненности конечной даты
                send_err:{type:"string"}    // описание ишибки
            }
        });
        return model;
    }
);
