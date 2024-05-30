/**
 * Created by 1 on 30.11.2015.
 */
define(['kendo', 'services/proxyService'],
    function (kendo,proxy) {
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            isOpen: false,
            isIbSelected: false,
            selectedIb:null,
            isIbHeaderVisible:false,
            getIbLink: function() {
                var sRet="";
                try {
                    sRet="#/ib/" + viewModel.get("selectedIb").ask_id;
                }
                catch (e) {

                }
                return sRet;
            },
            getIbMenuHeader: function() {
                var sRet="";
                try {
                    sRet="ИБ № "+viewModel.get("selectedIb").niib.toString();
                }
                catch (e) {

                }
                return sRet;
            }
        });
        var onIbSelected=function(data) {
            viewModel.set("selectedIb",data);
            viewModel.set("isIbSelected",true);

        };
        var onIbHeaderOnScreen=function(data) {
            viewModel.set("isIbHeaderOnScreen",(data)?true:false);
        };
        proxy.subscribe("selectedIbChanged",onIbSelected);
        proxy.subscribe("ibHeaderOnScreen",onIbHeaderOnScreen);
        return viewModel;
    }
);
