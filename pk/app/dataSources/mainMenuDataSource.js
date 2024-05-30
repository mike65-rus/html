/**
 * Created by 1 on 07.04.2018.
 * pk.mainMenu dataSource
 */
define(['services/configService'],function(configService) {
    'use strict';
    /*
    var ds=
            [{
                text:"Меню",
                items: [
                    {text:"Амбулаторная карта",
                    attr:{
                        url:"patient_card"
                    }},
                    {text:"О программе",
                        attr:{
                            url:"about"
                        }}
                ]
            }];
    */
    var ds=configService.getMenuItems();
    return ds;
});