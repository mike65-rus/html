define(['kendo.all.min','utils'],function(kendo,utils) {
    'use strict';
    var config={
        ui: {
            patient_card: {
                tabs: [
                    {
                        name: "visits",
                        label:"Посещения",
                        order: 0,
                        available: false
                    },
                    {
                        name: "issled",
                        label:"Исследования",
                        order: 1,
                        available: true,
                        tabs: [
                            {
                                name: "kdl",
                                label:"КДЛ",
                                order: 0,
                                available: true
                            },
                            {
                                name: "ldo",
                                label: "ЛДО",
                                order: 1,
                                available: true
                            },
                            {
                                name: "pacs",
                                label: "PACS",
                                order: 2,
                                available: true
                            },
                            {
                                name: "napr-ldo",
                                label: "Направления в ЛДО",
                                order: 3,
                                available: true
                            }
                        ]
                    },
                    {
                        name: "deseases",
                        label: "Заболевания",
                        order: 2,
                        available: true,
                        tabs: [
                             {
                                name: "all",
                                label: "Все",
                                order: 0,
                                available: true
                            },
                            {
                                name: "disp38",
                                label: "ДиспУчет-38",
                                order: 1,
                                available: true
                            },
                            {
                                name: "disp",
                                label: "ДиспУчет",
                                order: 2,
                                available: false
                            }

                        ]
                    },
                    {
                        name: "prof-events",
                        label:"Проф. мероприятия",
                        order: 3,
                        available: !(utils.isUserLdo()),
                        tabs: [
                            {
                                name: "monitor-tfoms",
                                label: "Диспансеризация ТФОМС",
                                order: 0,
                                available: true
                            },
                            {
                                name: "all-monitor-tfoms",
                                label: "Незавершенные по Диспансеризации",
                                order: 1,
                                available: true
                            },
                            {
                                name: "monitor-du-tfoms",
                                label: "Дисп. наблюдение ТФОМС",
                                order: 2,
                                available: false
                            }/*,
                            {
                                name: "all-monitor-du-tfoms",
                                label: "Все ДН ТФОМС",
                                order: 3,
                                available: false
                            } */
                        ]
                    },
                    {
                        name: "docs",
                        label:"Документация",
                        order: 4,
                        available: true,
                        tabs: [
                            {
                                name: "list",
                                label: "Список",
                                order: 0,
                                available: true
                            }
                        ]

                    },


                ]
            }
        }
    };
    var getPatientCardMenuItems=function() {
        var aTabs=[];
        var tabs = configService.getConfigProperty("ui.patient_card.tabs")
            .sort(function (a, b) {
                return a.order - b.order;
            });
        for (var i=0;i<tabs.length;i++) {
            if (tabs[i].available) {
                aTabs.push({text:tabs[i].label,attr:{url:"patient_card/<current>/"+tabs[i].name}});
            }
        }
        return aTabs;
    };
    var configService={
        getConfigProperty:function(desc) {
            var obj=config;
            var arr = desc.split('.');
            while (arr.length && (obj = obj[arr.shift()]));
            return obj;
        },
        getPatientCardTabs: function(sParentName) { // optional parent name
            if (!sParentName) {
                sParentName="";
            }
            var aParentName=sParentName.split(".");
            var tabs2;
            var aTabs = [];
            var tabs = configService.getConfigProperty("ui.patient_card.tabs")
                .sort(function (a, b) {
                    return a.order - b.order;
                });
            var tabs3=tabs;
            if (sParentName) {
                for (var j=0; j<aParentName.length;j++) {
                    for (var i = 0; i < tabs3.length; i++) {
                        if (!(tabs3[i].name == aParentName[j])) {
                            continue;
                        }
                        tabs3 = tabs3[i].tabs;
                        if (j==(aParentName.length-1)) {
                            tabs2=tabs3;
                        }
                        break;
                    }
                }
                if (!tabs2) {
                    return aTabs;
                }
                else {
                    tabs = tabs2;
                }
            }
            tabs.sort(function (a, b) {
                return a.order - b.order;
            });
            for (var i=0;i<tabs.length;i++) {
                if (tabs[i].available) {
                    aTabs.push(tabs[i].name);
                }
            }
            if (aTabs.indexOf("visits")>=0) {
                aTabs.push("visit");
            }
            return aTabs;
        },
        getMenuItems: function() {
            var menuItem;
            var menuItems=[{
                text:"Меню",
                items: []
            }];
            menuItem={text:"Амбулаторная карта",attr:{url:"patient_card"},items:[]};
            menuItem.items=getPatientCardMenuItems();
            menuItems[0].items.push(menuItem);
            menuItem={text:"О программе",attr:{url:"about"}};
            menuItems[0].items.push(menuItem);

            return menuItems;
        }
    };
    return configService;
}

);