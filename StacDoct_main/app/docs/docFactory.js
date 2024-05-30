/**
 * Created by 1 on 11.12.2015.
 */
define(["docs/Doc01", "docs/Doc11", "docs/Doc31", "docs/Doc57", "docs/Doc58", "docs/Doc59", "docs/Doc60", "docs/Doc61",
        "docs/Doc62", "docs/Doc63", "docs/Doc64", "docs/Doc65", "docs/Doc66", "docs/Doc67", "docs/Doc68", "docs/Doc69", "docs/Doc70", "docs/Doc71", "docs/Doc72", "docs/Doc73", "docs/Doc74"],
    function(Doc01,Doc11,Doc31,Doc57,Doc58,Doc59,Doc60,Doc61,Doc62,Doc63,Doc64,Doc65,Doc66,Doc67,Doc68,Doc69,Doc70,Doc71,Doc72,Doc73,Doc74){
    "use strict";
    var createDoc=function(data,sUuid,iDocSub) {
        var oRet=null;
        switch (data.doc_id) {
            case 1:
                oRet=new Doc01(data,sUuid);    // выписка
                break;
            case 11:
                oRet=new Doc11(data,sUuid);    // первичный осмотр
                break;
            case 58:
                oRet = new Doc58(data,sUuid);    // извещение форма 58
                break;
            case 31:
                oRet = new Doc31(data, sUuid);    // направление на исследование в другие ЛПУ
                break;
            case 59:
                oRet = new Doc59(data, sUuid);    // бланки по новообразованиям
                break;
            case 57:
                oRet = new Doc57(data, sUuid);    // бланк отравление
                break;
			case 60:
                oRet = new Doc60(data, sUuid);    // заявка на переливание крови
                break;
			case 61:
                oRet = new Doc61(data, sUuid);    // посмертный эпикриз
                break;
			case 62:
                oRet = new Doc62(data, sUuid);    // суицидальный случай
                break;
			case 63:
                oRet = new Doc63(data, sUuid);    // протокол заседания ВК
                break;
			case 64:
                oRet = new Doc64(data, sUuid);    // КИЛИ
                break;
			case 65:
                oRet = new Doc65(data, sUuid);    // КИЛИ новая форма
                break;
			case 66:
                oRet = new Doc66(data, sUuid);    // Протокол работы мультидисциплинарной команды
                break;
			case 67:
                oRet = new Doc67(data, sUuid);    // Переводной эпикриз
                break;
			case 68:
                oRet = new Doc68(data, sUuid);    // Консультация
                break;
			case 69:
                oRet = new Doc69(data, sUuid);    // Дневниковая запись
                break;
			case 70:
                oRet = new Doc70(data, sUuid);    // Дневниковая заметка
                break;
			case 71:
                oRet = new Doc71(data, sUuid);    // Извещение КВД
                break;
			case 72:
                oRet = new Doc72(data, sUuid);    // Статкарта инфаркт
                break;
			case 73:
                oRet = new Doc73(data, sUuid);    // Статкарта инсульт
                break;				
			case 74:
                oRet = new Doc74(data, sUuid);    // Рецензия КИЛИ
                break;
        }
        return oRet;
    };
    return {
        createDoc: createDoc
    };
});