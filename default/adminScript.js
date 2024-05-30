var dsUsers = new kendo.data.DataSource({
    pageSize: 1000,
    transport: {
        read: {
            url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=getAllUsers",
            dataType: "json"
        }
    },
/*    requestEnd: utils._onRequestEnd,  */
    schema: {
        data: "users.rows",
        total: "records",
        errors: "error",
        model: { id:"id",
            fields: {
                id: {type:"number"},
                name: {type:"string"},
                fio: {type:"string"}
            }
        }
    },
    error: function(e) {
/*        utils.ajax_error(e); */
    }
});

dsUsers.read().then(function(){
//    console.log("users readed");
//    console.log(dsUsers.data());
});

var kendoWindow;

var closeWindow=function() {
    var selector="#adminWindow";
    kendo.unbind("#admin-content");
    kendoWindow.destroy();
    $(selector).remove();
};


var adminViewModel=new kendo.data.ObservableObject({
    users:dsUsers,
    selectedUser:null,
    href:null,

    openWindow:function() {
        dsUsers.sort({field:"name",dir:"asc"});
        var sHtml="<div id='admin-content'>";
        var sHtml=sHtml+"<div>";
        sHtml=sHtml+"<input id='u-list' data-role='dropdownlist' data-text-field='name' data-value-field='id' ";
        sHtml=sHtml+" data-bind='value:selectedUser,source:users'";
        sHtml=sHtml+" style='width:600px' />";
        sHtml=sHtml+"</div>";
        sHtml=sHtml+"<div style='text-align:center;margin-top:20px;' >";
        sHtml=sHtml+"<button class='k-button' data-role='button' data-bind='events:{click:exec}'>ОК</button>";
        sHtml=sHtml+"&nbsp;&nbsp;&nbsp";
        sHtml=sHtml+"<button class='k-button' data-role='button' data-bind='events:{click:cancel}'>Cancel</button>";
        sHtml=sHtml+"</div>";
        sHtml=sHtml+"</div>";

        kendoWindow=$("<div id='adminWindow'/>").kendoWindow({
            title: 'Эмуляция пользователя',
            modal:true,
            animation:false,
            width:700,
            height:300,
            close: closeWindow
        }).data("kendoWindow");
        kendoWindow.open().center();
        kendoWindow.content(sHtml);
        kendo.bind("#admin-content",adminViewModel);
//        console.log("window opened");

    },
    exec: function(e) {
        var vm=adminViewModel;
        if (!(vm.get("selectedUser"))) {
            return;
        }
        $.ajax({
            url:"default.aspx?action=default/TimeLine_AJAX&action2=set_emul_mode",
            data:{user_id:vm.selectedUser.id,user_name:vm.selectedUser.name}
        }).done(function(msg) {
            localStorage.setItem("last_user",vm.selectedUser.id);
            window.location.href=vm.get("href");
        })
    },
    cancel: function(e) {
        kendoWindow.close();
    }
});

$(".app-1").on("click",function(e) {
    e.preventDefault();
    adminViewModel.set("href",e.target.href);
    var mode=$(e.target).closest("li").data("mode");
    $.ajax({
        url:"default.aspx?action=StacDoct_main/newIb_AJAX&action2=setStacMode",
        data:{mode:mode}
    }).done(function(msg) {
        adminViewModel.openWindow();
    });
//    console.log(e);
//    alert(e.target.href);
});

$(".app-3").on("click",function(e) {
    e.preventDefault();
    adminViewModel.set("href",e.target.href);
    adminViewModel.openWindow();
    /*
    var mode=$(e.target).closest("li").data("mode");
    $.ajax({
        url:"default.aspx?action=StacDoct_main/newIb_AJAX&action2=setStacMode",
        data:{mode:mode}
    }).done(function(msg) {
        adminViewModel.openWindow();
    });
    */
//    console.log(e);
//    alert(e.target.href);
});
