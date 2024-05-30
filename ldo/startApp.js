/**
 * Created by 1 on 03.01.2015.
 */
function startApp() {
    /*
    $.ytLoad({startPercentage: 50,
            startDuration: 3000,
            completeDuration: 500,
            fadeDelay: 100,
            fadeDuration: 100
    });
    */
    examsModel.initControls();
    setTimeout(function() {
        examsModel.set("selectedPerson","");
        examsModel.set("selectedPerson",null);
    },1000);

    return;


}
