function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function updateTime(){
    d=new Date();
    //alert(d.getHours().toString().lenght);
    if ((d.getHours().toString().length===1)){
        hours="0"+d.getHours().toString();
    }else{
        hours=d.getHours().toString();
    }

    if ((d.getMinutes().toString().length===1)){
        minutes="0"+d.getMinutes().toString();
    }else{
        minutes=d.getMinutes().toString();
    }


    $("#hours").text(hours);
    $("#minutes").text(minutes);
}


$("#inforow").css("visibility","hidden");
updateTime();
setTimeout(blink,1000-new Date().getMilliseconds());
function blink(){
    if($("#timeseparator").css("visibility")==="hidden"){
            $("#timeseparator").css("visibility","visible");
    }else{
        $("#timeseparator").css("visibility","hidden");
    }
    updateTime();
    setTimeout(blink,1000-new Date().getMilliseconds());
}

function setData(row,column,data){
    $("#the-table").children()[0].children[row].children[column].innerHTML=data;
}
