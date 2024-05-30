/**
 * Created by 1 on 09.04.2018.
 * initial datasource readind (pseudo-synchrone):
 * users,paymentTypes,visitTypes,specialityList,userSpeciality,kodif
 */
define(['kendo.all.min','services/proxyService','utils',
    'dataSources/userSpecialityDataSource','dataSources/kodifDataSource','dataSources/usersListDataSource',
    'dataSources/paymentTypesDataSource','dataSources/visitTypesDataSource','datasources/specListDataSource',
    'dataSources/docsTreeDataSource'],
    function(kendo,proxy,utils,userSpecDs,kodifDs,usersListDs,paymentTypesDs,visitTypesDs,specListDs,docsTreeDs) {
    'use strict';
    var readError=null;
    window.appData={
        visitsListsLookups:{
            aSources:[],
            aOtdels:[],
            aUsers:[],
            aPayTypes:[],
            aVisitTypes:[],
            aSpec:[]
        }
    };
    //
    var itemCreatorUser=function(item) {
        return {value:Number(item.id),text:item.fio};
    };
    var itemCreatorSpec=function(item) {
        return {value:Number(item.num),text:item.name};
    };
    var itemCreatorPayTypes=function(item) {
        return {value:Number(item.code),text:item.code_name};
    };
    var itemCreatorVisitTypes=function(item) {
        return {value:Number(item.code),text:item.code_name};
    };

    var createLookup=function(ds,itemCreatorFn)  {
        var aArr=[];
        for (var i=0;i<ds.data().length;i++) {
            var item=ds.data()[i];
            var item2=itemCreatorFn(item);
            aArr.push(item2);
        }
        return aArr;
    };
    var onDocsTreeCompleted=function() {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            var readPromise = visitTypesDs.read();
            readPromise.then(onVisitTypesCompleted);
        }

    };
    //

    var onPaymentTypesCompleted=function() {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            appData.visitsListsLookups.aPayTypes=createLookup(paymentTypesDs,itemCreatorPayTypes);
//            var readPromise = visitTypesDs.read();
//            readPromise.then(onVisitTypesCompleted);
            var readPromise = docsTreeDs.read();
            readPromise.then(onDocsTreeCompleted);
        }
    };
    var onVisitTypesCompleted=function() {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            appData.visitsListsLookups.aVisitTypes=createLookup(visitTypesDs,itemCreatorVisitTypes);
            var readPromise = specListDs.read();
            readPromise.then(onSpecListCompleted);
        }
    };
    var onSpecListCompleted=function() {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            appData.visitsListsLookups.aSpec=createLookup(specListDs,itemCreatorSpec);
            localStorage["last_user_spec"]=JSON.stringify([]);
            var readPromise=userSpecDs.read({
                user_id: Number(localStorage['last_user'])
            });
            readPromise.then(onUserSpecCompleted);
        }
    };
    var onUsersListCompleted=function(e) {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            appData.visitsListsLookups.aUsers=createLookup(usersListDs,itemCreatorUser);
            var readPromise = paymentTypesDs.read();
            readPromise.then(onPaymentTypesCompleted);
        }
    };
    var onUserSpecCompleted=function(e) {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            var specId=0;
            if (userSpecDs.data().length) {
                specId=userSpecDs.data()[0].nspecid;
            }
            else {
                if (utils.isAdmin()) {
                    userSpecDs.pushCreate({
                        notdid: 19,
                        nspecid: 3,
                        sotdcode: "ТЕР",
                        sotdname:"Терапевтической",
                        nspeccode:3,
                        sspecname:"Участковый терапевт"
                    });
                }
            }
            if (userSpecDs.data().length) {
                localStorage["last_user_spec"]=JSON.stringify(userSpecDs.data());
                var $input=$("#current_user_spec");
                if ($input.length) {
                    $input.closest("span").removeAttr("style");
                    $input.kendoDropDownList({
                        dataSource: userSpecDs._data,
                        dataTextField:"sspecname",
                        dataValueField:"nspecid",
                        change: function(e) {
                            localStorage["current_spec_id"]=this.value();
                        }
                    });
                    setTimeout(function() {
                        $input.data("kendoDropDownList").trigger("change");
                    },100)
                }

            }
            if (!specId) {
                specId=3;   // участковый терапевт
            }
            // commented 15/11/2018
            /*
            var readPromise=kodifDs.read({spec_id:specId});
            readPromise.then(onInitCompleted);
            */
            onInitCompleted();  // getKodif removed (not in ADS database!)
        }
    };
    var onInitCompleted=function(e) {
        if (readError) {
            proxy.publish("initError",readError) ;
        }
        else {
            proxy.publish("initCompleted");
        }
    };
    var onReadError=function(data) {
        readError=data;
    } ;
    var createOtdels=function() {
        var aArr=[];
        aArr.push({value:12,text:"ЖК"});
        aArr.push({value:19,text:"ТЕР"});
        aArr.push({value:25,text:"КВД"});
        appData.visitsListsLookups.aOtdels=aArr;
    };
    var createSources=function() {
        var aArr=[];
        aArr.push({value:1,text:"Талоны"});
        aArr.push({value:2,text:"ВД"});
        aArr.push({value:3,text:"ПрофОсм"});
        appData.visitsListsLookups.aSources=aArr;
    };
    var initService={
        start: function() {
            //
            createSources();
            createOtdels();

            readError=null;
            proxy.subscribe("readError",onReadError);


            var readPromise=usersListDs.read().then(onUsersListCompleted);
        }
    };
    return initService;
});