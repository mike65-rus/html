
$(".app-1").on("click",function(e) {
    e.preventDefault();
    var href=e.target.href;
    var mode=$(e.target).closest("li").data("mode");
    $.ajax({
        url:"default.aspx?action=StacDoct_main/newIb_AJAX&action2=setStacMode",
        data:{mode:mode}
    }).done(function(msg) {
        window.location.href=href;
    });

//    console.log(e);
//    alert(e.target.href);
});