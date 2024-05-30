/**
 * Created by 1 on 24.11.2015.
 */
define(['kendo', 'dataSources/oneIbDataSource','dataSources/ibRecomDataSource',
        'router','services/proxyService','viewModels/recomEditor','viewModels/ibNewsVm'],
    function(kendo,ibDs,recomDs,router,proxy,recomEditor,ibNewsVm){
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            currentId: "",
            selectedIb: null,
            recomDs:recomDs,
            isMenuIbHeaderVisible: false,
            showForm: function() {
                return this.get("selectedIb") !== null;
            },
            getPalataStr: function() {
                var sRet="";
                if (! this.showForm()) {
                    return sRet;
                }
                if (this.get("selectedIb").dnst>0) {
                    sRet="ДС";
                    return sRet;
                }
                sRet=kendo.toString(this.get("selectedIb").palata);
                return sRet;
            },
            getPeriodStr: function() {
                var sRet="";
                if (! this.showForm()) {
                    return sRet;
                }
                sRet=" c "+kendo.toString(this.get("selectedIb").date_ask,"d");
                if (this.get("selectedIb").date_out!==null) {
                    sRet=sRet+" по "+kendo.toString(this.get("selectedIb").date_out,"d");
                }
                return sRet;
            },
            isChangeOpenVisible: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return false;
                }
                if ((selIb.user_id!=0) &&  selIb.user_id===Number(localStorage['last_user']) ) {
                    return true;
                }
                return   (selIb.is_shef || selIb.is_nachmed || selIb.is_degur  || selIb.is_orit || this.get("isFromArx") );
            },
            isZakrMeVisible: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return false;
                }
                if (selIb.date_out) {
//            return false;
                }
                return  (selIb.user_id===0) && (!selIb.is_degur) &&(!selIb.is_orit);
            },
            isZakrOtherVisible: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return false;
                }
                if (selIb.date_out) {
//            return false;
                }
                return  (selIb.is_shef) && (!selIb.is_degur) &&(!selIb.is_orit);
            },
            maleFemale: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return "";
                }
                var sRet="fa fa-male";
                if (selIb.sex==="ж") {
                    sRet="fa fa-female";
                }
                return sRet;
            },
            plusMinus: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return "";
                }
                var sRet="icon-plus-sign";
                if (this.get("isMoreVisible")) {
                    sRet="icon-minus-sign";
                }
                return sRet;

            },
            showHide: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return "";
                }
                var sRet="Показать";
                if (this.get("isMoreVisible")) {
                    sRet="Скрыть";
                }
                return sRet+" дополнительную информацию";

            },
            changeShowMore: function() {
                this.set("isMoreVisible",!(this.get("isMoreVisible")));
            },
            getDoctStr: function() {
                var dataItem=this.get("selectedIb");
                if (! dataItem) {
                    return "";
                }
                var sRet="";
                sRet=dataItem.user_name.fio();
                if (sRet && dataItem.user2_name) {
                    sRet=sRet+" / ";
                }
                if (dataItem.user2_name) {
                    sRet=sRet+dataItem.user2_name.fio();
                }
                return sRet;
            },
            getBirt: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (selIb.birt!==null) {
                    sRet=sRet+kendo.toString(selIb.birt,"d");
                }
                return sRet;
            },
            getDateAsk: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (!(selIb.date_ask==null)) {
                    sRet=kendo.toString(selIb.date_ask,"dd.MM.yyyy HH:mm");
                }
                return sRet;
            },
            getDateOut: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (!(selIb.date_out==null)) {
                    sRet=kendo.toString(selIb.date_out,"dd.MM.yyyy HH:mm");
                }
                return sRet;
            },
            getMenuHeader: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (!selIb) {
                    return sRet;
                }
                return "ИБ № "+selIb.niib.toString();
            },
            getInvGr: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (selIb.inv_gr>0) {
                    sRet=kendo.toString(selIb.inv_gr);
                }
                return sRet;
            },
            /*
            isMenuIbHeaderVisible: function() {
                return true;
            },
            */
            isOpen: function() {
                var selIb=viewModel.get("selectedIb");
                if (!selIb) {
                    return false;
                }
                if (selIb.user_id===Number(localStorage['last_user']) ) {
                    return true;
                }

                return false;
            },
            getIbLink: function() {
                return "#/ib/"+this.get("currentId");
            },
            getIbNewsLink: function() {
                return "#/ib-news/"+this.get("currentId");
            },
            getIbKdlLink: function() {
                return "#/ib-kdl/"+this.get("currentId");
            },
            getIbLdoLink: function() {
                return "#/ib-ldo/"+this.get("currentId");
            },
            getIbDocsLink: function() {
                return "#/ib-docs/"+this.get("currentId");
            },
            getIbRecomLink: function() {
                return "#/ib-recom/"+this.get("currentId");
            },
            getRecomClass: function() {
                return "ib-recom-tr-warn";
            },
            readIbRecom: function(dataItem,iMode,iRecomId) {
                // рекомендации
                if (iMode<3) {
                    iRecomId=0;
                };

//                recomDs.transport.options.read.url="default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_ib_recomendation";
                recomDs.options.batch=false;
                recomDs.read({
                    recomid: iRecomId,
                    ask_id: dataItem.ask_id,
                    global_vn: dataItem.global_vn,
                    dnst: dataItem.dnst,
                    dateask:kendo.toString(dataItem.date_ask,"yyyyMMdd"),
                    dateout: (dataItem.dateout==null) ? "":kendo.toString(dataItem.date_ask,"yyyyMMdd"),
                    user_id: (iMode==1) ? Number(localStorage['last_user']) : 0,
                    mode: iMode
                });
            },

            isMoreVisible: false,
            isRecomVisible: false,
            getRecomTypeName: function (nType) {
                var sRet="";
                switch (nType) {
                    case 1:
                        sRet="R-профилактика заболеваний легких";
                        break;
                };
                return sRet;
            },
            onListViewChange: function(e) {
                var data=recomDs.view();
                var widget= e.sender;
                var row=widget.select();
                var dataItem=widget.dataItem(row);
//                console.log("Selected: " + dataItem.recomid);
                recomEditor.edit(dataItem);
            }


        });
        proxy.subscribe("ibReaded",onIbReaded);
        viewModel.bind("set", onSet);
        function onSet(e) {
            if (e.field == "currentId") {
                recomDs.options.batch=true;
                if (this.get("currentId") != e.value) {
                    this.set("selectedIb",null);
                    this.set("isRecomVisible",false);
                    kendo.ui.progress($("#content"),true);
                    ibDs.read({ask_id: e.value});
                }
            }
        }
        function onIbReaded(data) {
            kendo.ui.progress($("#content"),false);
            viewModel.set("selectedIb",data);
            proxy.setSessionObject('selectedIb',data);
            proxy.publish("selectedIbChanged",data);
            if (Number(localStorage['last_user'])==data.user_id) {
                if (!data.date_out) {
                    viewModel.readIbRecom(viewModel.get('selectedIb'),1);
                }
            }
        }
        proxy.subscribe("onRecomReaded",onRecomReaded);
        function onRecomReaded(data) {
//            var sHtml=viewModel.createMyRecoms(data);
//            viewModel.set("recomsHtml",sHtml);
            viewModel.set("isRecomVisible",(data || data.length>0));
//            viewModel.set("isRecomVisible",true);

        }
        proxy.subscribe("recomUpdated",onRecomUpdated);
        function onRecomUpdated() {
            var dataItem=viewModel.get("selectedIb");
            viewModel.readIbRecom(dataItem,1,0);
        }
        return viewModel;
});
