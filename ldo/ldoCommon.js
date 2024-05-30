/**
 * Created by 1 on 03.01.2015.
 */
$(".pk-grid").delegate("tbody>tr", "selectstart", function(e){
    return false;
}).css( 'MozUserSelect','none' ).mousedown( function( ) {
//        return false;
});
$("a.menu-link").delegate("","click",function(e) {
    var sLink=$(this).attr("href").substr(1);
    appRouter.navigate(sLink);
    e.preventDefault;
});
// ajax-error window
$("#error").kendoWindow({
    modal: true,
    visible: false
});
