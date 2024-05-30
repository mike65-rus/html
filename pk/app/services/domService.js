/**
 * Created by 1 on 23.11.2015.
 */
define(['kendo.all.min','amplify'],function(kendo,amplify) {
    function initialize() {
    // prevent from screen-selection of ibgrid's content
        $(document).on("selectstart","table.k-selectable>tbody>tr", function(e){
            return false;
        }).css( 'MozUserSelect','none' ).mousedown( function( ) {
    //        return false;
        });

        //
    // row double-click on ib's grids
        $(document).on("dblclick","table.k-selectable>tbody>tr", function(e){
            var sAskId=$(this).find("td[role='gridcell']:first").text();
            if (sAskId && sAskId.length==26) {
                amplify.publish("openIb",{ask_id:sAskId});
            }
        });

    }
    return {
        initialize: initialize
    }
});