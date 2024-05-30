define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var dsInoe= new kendo.data.DataSource({
            data:[
                {code:"31",name:"продолжает болеть"},
                {code:"32",name:"установлена инвалидность"},
                {code:"33",name:"изменение группы инвалидности"},
                {code:"34",name:"посмертно"},
                {code:"35",name:"отказ от проведения МСЭ"},
                {code:"36",name:"на прием не явился, признан трудоспособным"},
                {code:"37",name:"направлен на долечивание после стационарного лечения"}
                ]
        });
        dsInoe.read();
        var dsAnswers=new kendo.data.DataSource({
            data: [
                {code:0,name:"уточню позже"},
                {code:1,name:"не выдавался"},
                {code:2,name:"выдавался"},
            ]
        });
        dsAnswers.read();
        return {inoe:dsInoe,answers:dsAnswers};
    }
);