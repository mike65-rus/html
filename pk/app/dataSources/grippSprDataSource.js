define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var dsLabs= new kendo.data.DataSource({
            data:['ГБУЗ СК «Пятигорская городская клиническая больница №2»',
                'ГБУЗ СК «Пятигорский Межрайонный Родильный Дом»',
                'ФБУЗ «Центр Гигиены и эпидемиологии в Ставропольском крае»']
        });
        var dsGrippTypes=new kendo.data.DataSource({
            data:["A","B","C","SARS"]
        });
        var dsGrippSubtypes=new kendo.data.DataSource({
            data:["A/H1-swin","A/H1N1","A/H3N2","A/H7N9","A/H5N1","B","C","SARS-CoV-2","SARS-CoV"]
        });
        var dsIvl=new kendo.data.DataSource({
            data:["не проводилась","проводилась 1 день","проводилась 2 дня","проводилась 3 дня","проводилась 4 дня","проводилась 5 дней","проводилась 6 дней"]
        });
        var dsMethod=new kendo.data.DataSource({
            data:["РНК","ИФА Ig"]
        });
        dsLabs.read();
        dsGrippTypes.read();
        dsGrippSubtypes.read();
        dsIvl.read();
        dsMethod.read();
        return {labs:dsLabs,types:dsGrippTypes,subtypes:dsGrippSubtypes,ivl:dsIvl,method:dsMethod};
    }
);