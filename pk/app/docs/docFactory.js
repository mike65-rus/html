/**
 * Created by 1 on 11.12.2015.
 */
define(["docs/Doc58","docs/Doc59","docs/Doc71"],function(Doc58,Doc59,Doc71){
    "use strict";
    var docFactory;

    docFactory={
        createDoc: function(data,sUuid,iDocSub) {
            var oRet=null;
            switch (data.doc_id) {
                /*
                case 1:
                    oRet=new Doc01(data,sUuid);    // выписка
                    break;
                case 11:
                    oRet=new Doc11(data,sUuid);    // первичный осмотр
                    break;
                    */
                case 58:
                    oRet = new Doc58(data,sUuid,iDocSub);    // извещение форма 58
                    break;
                case 59:
                    oRet = new Doc59(data, sUuid,iDocSub);    // бланки по новообразованиям
                    break;
				case 71:
                    oRet = new Doc71(data, sUuid,iDocSub);    // извещение КВД
                    break;
                /*
            case 31:
                oRet = new Doc31(data, sUuid);    // направление на исследование в другие ЛПУ
                break;
            case 57:
                oRet = new Doc57(data, sUuid);    // бланк отравление
                break;
			case 60:
                oRet = new Doc60(data, sUuid);    // заявка на переливание крови
                break;
                */
            }
            return oRet;
        }
    };
    return docFactory;
});