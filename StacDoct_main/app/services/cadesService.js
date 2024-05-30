/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'services/proxyService',
        'kendo-template!templates/signWindowTemplate'],
    function(kendo,proxy,signTemplateId) {
        'use strict';
        var badCrlError="0x800B010E";
        var cadesService;
        var defaultTlsServer="http://testca.cryptopro.ru/tsp/tsp.srf";
        var kendoWindow;
        function onCloseSignWindow() {
            kendo.unbind("#cades_sign_window");
            kendoWindow.destroy();
            $("#sign-window").remove();
        }
        cadesService= {
            isAvailable:false,
            certThumb:"",
            cert:null,
            coSign: function(data) {
                var signature=data.signature;
                var signedData=data.sign_hash;
                var signType=data.sign_type;
                var signingTime=null;
                var isBadCrlError=false;
                var newSignature="";
                cadesplugin.async_spawn(function*(arg) {
                    try {
                        var errormes = "";
                        var verifiedContent = "";
                        try {
                            var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
                        } catch (err) {
                            errormes = "Failed to create CAdESCOM.CPSigner: " + err.number;
                            throw errormes;
                        }
                        if (oSigner) {
                            try {
                                yield oSigner.propset_Certificate(arg[0]);
                            }
                            catch (err) {
                                errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
                                throw errormes;
                            }
                        }
                        else {
                            errormes = "Failed to create CAdESCOM.CPSigner";
                            throw errormes;
                        }
                        var tlsService =  cadesService.signModel.get("tlsServer");
                        if (signType>cadesplugin.CADESCOM_CADES_BES) {
                            yield oSigner.propset_TSAAddress(tlsService);
                        }
                        var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                        yield oSignedData.propset_Content(signedData);
                        try {
                            yield oSignedData.VerifyCades(signature, signType);
                            verifiedContent=yield oSignedData.Content;
                        }
                        catch (err) {
                            errormes = "Не удалось проверить подпись из-за ошибки: " + cadesplugin.getLastError(err);
                            if (errormes.endsWith("("+badCrlError+")")) {
                                // bad crl on no netwotk
                                isBadCrlError=true;
                                errormes="";
                                verifiedContent=signedData;
                            }
                            else {
                                throw errormes;
                            }
                        }
                        try {
                            newSignature=yield oSignedData.CoSignCades(oSigner, signType);
                        }
                        catch (ex) {
                            errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
                            throw errormes;

                        }

                    }
                    catch(ex) {
                    }
                    cadesService.signModel.set("error",errormes);
                    cadesService.signModel.set("verifiedContent",verifiedContent);
                    cadesService.signModel.set("signingTime",new Date());
                    cadesService.signModel.set("signature",newSignature);  // set this property last in order !!!
                },cadesService.cert.certificate);
            },
            sign: function(data) {
                var signingTime=null;
                var signature="";
                var dataToSign=data.dataToSign;
                var iSignType=data.signType;
                var bTest=data.test;
                var attributes=data.attributes;
                var docName="";
                var docDescr="";
                if (attributes) {
                    docName=attributes.docName || "";
                    docDescr=attributes.docDescr || "";
                }
                var result="";
                var isBadCrlError=false;
                cadesplugin.async_spawn(function*(arg) {
                    try {
                        var errormes = "";
                        var verifiedContent="";
                        try {
                            var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
                        } catch (err) {
                            errormes = "Failed to create CAdESCOM.CPSigner: " + err.number;
                            throw errormes;
                        }
                        if (oSigner) {
                            try {
                                yield oSigner.propset_Certificate(arg[0]);
                            }
                            catch (err) {
                                errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
                                throw errormes;
                            }
                        }
                        else {
                            errormes = "Failed to create CAdESCOM.CPSigner";
                            throw errormes;
                        }

                        // дополнительные подписываемые атрибуты
                        // время создания подписи
                        var oSigningTimeAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
                        yield oSigningTimeAttr.propset_Name(cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
                        var oTimeNow = new Date();
                        yield oSigningTimeAttr.propset_Value(oTimeNow);

                        var attr = yield oSigner.AuthenticatedAttributes2;
                        yield attr.Add(oSigningTimeAttr);
                        // имя документа
                        if (docName) {
                            var oSigningDocName = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
                            yield oSigningDocName.propset_Name(cadesplugin.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME);
                            yield oSigningDocName.propset_Value(docName);
                            yield attr.Add(oSigningDocName);
                        }
                        // описание документа
                        if (docDescr) {
                            var oSigningDocDescr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
                            yield oSigningDocDescr.propset_Name(cadesplugin.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_DESCRIPTION);
                            yield oSigningDocDescr.propset_Value(docDescr);
                            yield attr.Add(oSigningDocDescr);
                        }

                        var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                        var tlsService =  cadesService.signModel.get("tlsServer");
                        yield oSignedData.propset_Content(dataToSign);
                        yield oSigner.propset_Options(1); //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN
                        if (iSignType>cadesplugin.CADESCOM_CADES_BES) {
                            yield oSigner.propset_TSAAddress(tlsService);
                        }
                        try {
                            signature = yield oSignedData.SignCades(oSigner, iSignType);
                        }
                        catch (err) {
                            errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
                            throw errormes;
                        }
                        if (signature) {
                            oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                            try {
                                yield oSignedData.VerifyCades(signature, iSignType);
                                verifiedContent=yield oSignedData.Content;
                            }
                            catch (err) {
                                errormes = "Не удалось проверить подпись из-за ошибки: " + cadesplugin.getLastError(err);
                                if (errormes.endsWith("("+badCrlError+")")) {
                                    // bad crl on no netwotk
                                    isBadCrlError=true;
                                    errormes="";
                                    verifiedContent=dataToSign;
                                }
                                else {
                                    throw errormes;
                                }
                            }
                            if (!verifiedContent) {
                                if (isBadCrlError) {
                                    verifiedContent = yield oSignedData.Content;
                                }
                            }
                            var oSigners=yield oSignedData.Signers;
                            var iCnt=yield oSigners.Count;
                            var lastSigner=yield oSigners.Item(iCnt);
                            if (iSignType>cadesplugin.CADESCOM_CADES_BES) {
                                try {
                                    signingTime=yield lastSigner.SignatureTimeStampTime;
                                }
                                catch(ex) {

                                }
                            }
                            if (!signingTime) {
                                try {
                                    signingTime=yield lastSigner.SigningTime;
                                }
                                catch(ex) {
                                    if (!signingTime) {
                                        signingTime=new Date().toISOString();
                                    }
                                }
                            }
                            if (signingTime) {
                                signingTime=kendo.parseDate(signingTime);
                            }
                        }
                    }
                    catch(ex) {
                    }
                    cadesService.signModel.set("error",errormes);
                    cadesService.signModel.set("verifiedContent",verifiedContent);
                    cadesService.signModel.set("signingTime",signingTime);
                    cadesService.signModel.set("signature",signature);  // set this property last in order !!!
                },cadesService.cert.certificate);
            },
            verifySign: function(data) {
                var signature=data.signature;
                var signedData=data.sign_hash;
                var signType=data.sign_type;
                cadesplugin.async_spawn(function*(arg) {
                    try {
                        var errormes = "";
                        var verifiedContent="";
                        var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                        try {
                            yield oSignedData.propset_Content(arg[2]);
                            yield oSignedData.VerifyCades(arg[0],arg[1]);
                        }
                        catch (err) {
                            errormes = "Не удалось проверить подпись из-за ошибки: " + cadesplugin.getLastError(err);
//                            throw errormes;
                        }
                        verifiedContent=yield oSignedData.Content;
                        if (!(verifiedContent===arg[2])) {
                            errormes="Несоответствие подписанных данных";
                        }
                        var oSigners=yield oSignedData.Signers;
                        var cnt=yield  oSigners.Count;
                        for (var i=1;i<=cnt;i++) {
                            var oSigner=yield oSigners.Item(i);
                            var oCert=yield oSigner.Certificate;
                            var certThumb=yield oCert.Thumbprint;
//                            console.log(certThumb);
                            var validator = yield oCert.IsValid();
                            var isValid = yield validator.Result;
                            var signTime="";
                            var sCertText="";
                            var sOptText="";
                            if (arg[1]>cadesplugin.CADESCOM_CADES_BES) {
                               signTime=yield oSigner.SignatureTimeStampTime;
                            }
                            else {
                                signTime=yield oSigner.SigningTime;
                            }
                            if (signTime) {
                                signTime=kendo.toString(kendo.parseDate(signTime),"dd.MM.yyyy HH:mm:ss");
                            }
                            try {
                                var validFromDate = new Date((yield oCert.ValidFromDate));
                                sCertText = new CertificateAdjuster().GetCertInfoString(yield oCert.SubjectName, validFromDate);
                            }
                            catch (ex) {
                                alert("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
                            }
                            sOptText="<b>"+signTime+"</b> - "+sCertText;
                            if (sOptText) {
                                var sOptHtml="<li>"+sOptText+"</li>";
                                var sel=$("#signers_info");
                                $(sel).html(sOptHtml+$(sel).html());    // CADES ПРОверяется с последней к первой
                            }
//                            console.log(sOptText);
                        }
                    }
                    catch (ex) {

                    }
                },signature,signType,signedData);

            },
            verifySigns: function(data) {
                for (var i=0;i<data.length;i++) {
                    cadesService.verifySign(data[i]);
                }
            },
            startSign: function(data) {
                if (!cadesService.cert) {
                    return;
                }
                if (!data) {
                    return;
                }
                if (!data.dataToSign) {
                    return;
                }
                cadesService.signModel.clear();
                cadesService.signModel.set("dataToSign",data.dataToSign);
                cadesService.signModel.set("dataUid",data.dataUid);
                cadesService.signModel.set("silent",data.silent);
                cadesService.signModel.attributes=data.attributes;
                cadesService.signModel.test=data.test;
                cadesService.signModel.set("signType",cadesplugin.CADESCOM_CADES_BES);
                cadesService.signModel.set("mode",data.mode);
                cadesService.signModel.set("existingSigns",data.signs);
                cadesService.signModel.set("buttonTitle",(data.mode) ? "Добавить подпись":"Подписать");

                if (data.test) {
                    cadesService.signModel.set("tlsServer",defaultTlsServer);
                }
                if (!data.silent) {
                    kendoWindow = $("<div id='sign-window'/>").kendoWindow({
                        width: 700,
                        title: data.test ? "Тест электронной подписи" : "Подпись документа",
                        modal: true,
                        content: {
                            template: $("#" + signTemplateId).html()
                        },
                        close: onCloseSignWindow
                    }).data("kendoWindow");
                    var isFromContainer = cadesService.cert.isFromContainer;
                    FillCertInfo_Async(cadesService.cert.certificate, "CertListBox", isFromContainer);
                    kendo.bind("#cades_sign_window", cadesService.signModel);
                    kendoWindow.open().center();
                    if (data.mode && data.signs) {
                        var oSigns=JSON.parse(data.signs);
                        var aSigns=oSigns.signs.rows;
                        cadesService.verifySign(aSigns[aSigns.length-1]);
                    }
                }
                else {
                    if (!data.mode) {
                        cadesService.signModel.execSign();
                    }
                }
            },
            test:function() {
                cadesService.startSign({dataUid:"1",
                    dataToSign:"Hello World",test:true,silent:false,
                    attributes:{docName:"test",docDescr:"test Document"}
                });
            },
            showSignsInfo: function(data) {
                // console.log(data);
                var oSigns=JSON.parse(data.signs);
                var aSigns=oSigns.signs.rows;
                cadesService.verifySigns(aSigns);

            },
            signModel: new kendo.data.ObservableObject({
                dataUid:"",
                dataToSign:"",
                signature:"",
                error:"",
                verifiedContent:"",
                signType:0,
                test:true,
                silent:true,
                tlsServer:"",
                isTlsServerEnabled:false,
                isSignTypeEnabled:false,
                attributes:null,
                signingTime:null,
                mode:null,
                existingSigns:null,
                buttonTitle:"Подписать",
                signTypesDs: new kendo.data.DataSource({
                    data: [
                        {code:cadesplugin.CADESCOM_CADES_BES,name:"CADES-BES (Классическая)"},
                        {code:cadesplugin.CADESCOM_CADES_T,name:"CADES-T (Улучшенная со штампом времени)"},
                        {code:cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1,name:"CADES-X-Type-1 (Улучшенная cо штампом времени и доказательством подлинности)"},
                    ]
                }),
                execSignOrCoSign:function() {
                    if (this.mode) {
                        this.execCoSign();
                    }
                    else {
                        this.execSign();
                    }
                },
                execSign:function() {
                    this.signature="";
                    this.set("error","");
                    cadesService.sign({dataToSign:this.get("dataToSign"),signType:this.get("signType"),test:this.get("test"),
                        attributes:this.attributes});
                },
                execCoSign:function() {
                    this.signature="";
                    this.set("error","");
                    var oSigns=JSON.parse(this.get("existingSigns"));
                    var aSigns=oSigns.signs.rows;
                    cadesService.coSign(aSigns[aSigns.length-1]);
                },
                execCloseSignWindow: function() {
                    var data={
                        dataUid:cadesService.signModel.dataUid,
                        exit:1
                    };
                    proxy.publish("signExecuted",data);
                    kendoWindow.close();
                },
                clear: function () {
                    this.set("dataToSign","");
                    this.set("signature","");
                    this.set("dataUid","");
                    this.set("verifiedContent","");
                    this.set("error","");
                    this.set("signType",0);
                    this.test=false;
                    this.verifiedContent="";
                    this.set("test",true);
                    this.set("tlsServer","");
                    this.set("attributes",null);
                    this.set("signingTime",null);
                    this.set("mode",null);
                    this.set("existingSigns",null);
                }
            }),
            canSign: function() {
                if (cadesService.cert) {
                    return true;
                }
                return false;
            },
            checkCades: function(certThumb) {
                try {
                    include_async_code();
                }
                catch(ex) {

                }
                if (!(cadesplugin)) {
                    cadesService.isAvailable=false;
                    cadesService.certThumb="";
                }
                cadesplugin.then(function() {
                    cadesService.isAvailable=true;
                    try {
                        cadesService.certThumb=certThumb;
                        cadesService.findCertByThumb(certThumb);
                    }
                    catch (ex) {

                    }
                    },
                    function(error) {
                        cadesService.set("isAvailable",false);
                        cadesService.set("certThumb","");
                    }
                );
            },
            findCertByThumb: function(certThumb) {
                cadesService.cert=null;
                cadesplugin.async_spawn(function *() {
                    var thumb=certThumb;
                    var myStoreExists = true;
                    try {
                        var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
                        if (!oStore) {
                            kendo.alert("Create store failed");
                            return;
                        }
                        yield oStore.Open();
                    }
                    catch (ex) {
                        myStoreExists = false;
                    }
                    var oCerts;
                    var CAPICOM_CERTIFICATE_FIND_SHA1_HASH=0;
                    if (myStoreExists) {
                        oCerts = yield oStore.Certificates;
                        var oCerts2;
                        oCerts2=yield oCerts.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH,thumb);
                        var certs2Cnt=yield oCerts2.Count;
                        if (certs2Cnt) {
                            var oCert=yield oCerts2.Item(1);
                            cadesService.cert={certificate:oCert,isFromContainer:false};
                        }
                        yield oStore.Close();
                    }
                    if (cadesService.cert) {
                        return;
                    }
                    //В версии плагина 2.0.13292+ есть возможность получить сертификаты из
                    //закрытых ключей и не установленных в хранилище
                    try {
                        yield oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE);
                        oCerts = yield oStore.Certificates;
                        var oCerts2;
                        oCerts2=yield oCerts.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH,thumb);
                        var certs2Cnt=yield oCerts2.Count;
                        if (certs2Cnt) {
                            var oCert=yield oCerts2.Item(1);
                            cadesService.cert={certificate:oCert,isFromContainer:true};
                        }
                        yield oStore.Close();
                    }
                    catch (ex) {
                    }
                    /*
                    if (!(cadesService.cert)) {
                        cadesService.isAvailable=false;
                    }
                    */
                });
            }
        };
        function onSignModelChange(e) {
            if (e.field=="signature") {
                if (cadesService.signModel.signature) {
                    if (cadesService.signModel.test) {
                        kendo.alert("Подпись создана успешно!");
                    }
                    else {
                        var data={
                            dataUid:cadesService.signModel.dataUid,
                            error:cadesService.signModel.error,
                            signature:cadesService.signModel.signature,
                            content:cadesService.signModel.verifiedContent,
                            certThumb: cadesService.certThumb,
                            signType:cadesService.signModel.signType,
                            signingTime: cadesService.signModel.signingTime
                        };
                        proxy.publish("signExecuted",data);
                        try {
                            cadesService.signModel.execCloseSignWindow();
                        }
                        catch(ex) {

                        }
                    }
                }
            }
            cadesService.signModel.set("isTlsServerEnabled",
                (cadesService.signModel.test && (cadesService.signModel.signType>cadesplugin.CADESCOM_CADES_BES)));
            cadesService.signModel.set("isSignTypeEnabled",cadesService.signModel.test);
        }
        cadesService.signModel.bind("change",onSignModelChange);
        return cadesService;
    }
);