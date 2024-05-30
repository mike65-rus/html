/**
 * Created by 1 on 23.11.2015.
 */
define(["kendo.all.min",'amplify',"services/proxyService"],function(kendo,amplify,proxy) {
    function initialize() {
        // prevent from screen-selection of ibgrid's content
        $(document).on("selectstart", "table.k-selectable>tbody>tr", function (e) {
            return false;
        }).css('MozUserSelect', 'none').mousedown(function () {
            //        return false;
        });

        //
        // row double-click on ib's grids
        $(document).on("dblclick", "div.ibgrid>div.k-grid-content>table.k-selectable>tbody>tr", function (e) {
            var sAskId = $(this).find("td[role='gridcell']:first").text();
            if (sAskId && sAskId.length == 26) {
                if (false && ($(this).closest("div.ibgrid").attr("id")=="grid-noti")) {
                    amplify.publish("openIb", {ask_id: sAskId,suffix:{goto:"ib-docs",doc_id:1,doc_sub:1}});
                }
                else {
                    amplify.publish("openIb", {ask_id: sAskId});
                }
            }
        });
        // click on ibgrid diag
        $(document).on("click", "div.diag-in-grid", function (e) {
            var sAskId = $(this).closest("tr").find("td[role='gridcell']:first").text();
            amplify.publish("showDiagsList", {ask_id: sAskId});
        });
        // click on lab pokaz with comments
        $(document).on("click", "tr.lab-pokaz-with-comments", function (e) {
            var sPokazCode = $(this).data("pokaz-code");
            var sPokazName = $(this).data("pokaz-name");
            var commentId = $(this).data("comment-id");
            if (commentId) {
//                kendo.alert(sPokazCode);
                proxy.publish("getLabComment", {commentId: commentId, name: sPokazName, code: sPokazCode});
            }
        });
        $(document).on("click", "td.lab-razdel-with-comments", function (e) {
            var sPokazCode = $(this).data("pokaz-code");
            if (sPokazCode) {
                kendo.alert(sPokazCode);
            }
        });
        // click on check-button on oldIssl (lab,ldo)
        $(document).on("click", "button.lab-chk-button", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $tr = $(e.target).closest("tr");
            if ($tr.length) {
                proxy.publish("labGridCheckButtonClick", {uid: $tr.data("uid")});
            }
        });
        $(document).on("click", "button.ldo-chk-button", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $tr = $(e.target).closest("tr");
            if ($tr.length) {
                proxy.publish("ldoGridCheckButtonClick", {uid: $tr.data("uid")});
            }
        });
        // links to ib
        $(document).on("click", "a.ib-link", function (e) {
            e.preventDefault();
            e.stopPropagation();
            proxy.publish("gridIbLinkClicked",e);
        });
    }
    return {
        initialize: initialize
    }
});