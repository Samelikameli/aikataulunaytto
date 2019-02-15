"use strict"
var region="hsl";
function requestAPI(query) {
    var res=$.ajax({
        url:"https://api.digitransit.fi/routing/v1/routers/"+region+"/index/graphql",
        type:"POST",
        async:false,
        headers: {
            "Content-Type": "application/graphql"
        },
        data:query
    });

    if(res.status===200){
        return JSON.parse(res.responseText).data;
    }
    else{
        return res.status;
    }
}
function genClusterSearchQuery(name){
    return "\
{\
  stops(name:\""+name+"\"){\
    gtfsId\
    name\
    cluster {\
      gtfsId\
      name\
    }\
  }\
}"
}
function genGetClustersDeparturesQuery(name){
    return "{\
cluster(id:\""+name+"\") {\
    name\
    stops {\
      name\
      stoptimesWithoutPatterns(numberOfDepartures:13,omitNonPickups:true) {\
        stop {\
          gtfsId\
          name\
          vehicleType\
          platformCode\
        }\
        trip {\
          gtfsId\
          shapeId\
          pattern {\
            directionId\
            name\
            code\
            route {\
                longName\
                shortName\
            }\
            \
          }\
          \
        }\
        scheduledArrival\
        realtimeArrival\
        arrivalDelay\
        scheduledDeparture\
        realtimeDeparture\
        departureDelay\
        timepoint\
        realtime\
        realtimeState\
        pickupType\
        dropoffType\
        serviceDay\
        stopHeadsign\
        headsign\
      }\
    }\
  }\
}"
}

function searchClusters(name){
    var query=genClusterSearchQuery(name);
    var res=requestAPI(query);
    var clusters=[];
    var ids=[];
    for (var i = 0; i < res.stops.length; i++) {
        if (!ids.includes(res.stops[i].cluster.gtfsId)){
            ids.push(res.stops[i].cluster.gtfsId);
            clusters.push(res.stops[i].cluster)
        }
    }
    return clusters;
}
function getTimeString(stamp){
    stamp=getRelativeTimestamp(stamp);
    if (stamp>60*60){
        var minutes=stamp%3600;
        var hours=(stamp-minutes)/3600;
        return hours+" h "+Math.floor(minutes/60)+" min";
    }else{
        return Math.floor(stamp/60)+" min";
    }
    
}
function getSecondsOfDay(){
    var d=new Date();
    return d.getSeconds()+d.getMinutes()*60+d.getHours()*60*60;
}
function getRelativeTimestamp(t){
    if(t>60*60*24){
            t-=60*60*24;
        }

    var td= t-getSecondsOfDay();
    if(td<0){
            td+=60*60*24;
        }

    return td;
}
console.log(getSecondsOfDay());
function getClustersDepartures(ids){
    if(ids.constructor!==Array){
        ids=[ids]
    }
    var departures=[];
    for(var n=0;n<ids.length;n++){
        var query=genGetClustersDeparturesQuery(ids[n]);
        var res=requestAPI(query);
        console.log(res);

    
        for(var i=0; i<res.cluster.stops.length; i++){
            console.log(res.cluster.stops[i].stoptimesWithoutPatterns);
            for(var j=0; j<res.cluster.stops[i].stoptimesWithoutPatterns.length;j++){
                departures.push(res.cluster.stops[i].stoptimesWithoutPatterns[j]);
            }
        }
    }
    console.log(departures);
    departures.sort(function(a,b){
        return (a.realtimeDeparture+a.serviceDay)>(b.realtimeDeparture+b.serviceDay);
    })
    return departures;
}
var stop="Leppävaara";
var clusters=searchClusters(stop);
$("#title").text(stop);
$("#logoimg").attr("src",region+".png");
console.log(clusters);
var ids=[];
for(var i=0;i<clusters.length;i++){
    ids.push(clusters[i].gtfsId);
}
var metro="<img src=\"metro.svg\" id=metro />";
var departures=getClustersDepartures(ids);
for(var i=0;i<13;i++){
    setData(i,0,getTimeString(departures[i].realtimeDeparture));
    setData(i,1,departures[i].trip.pattern.route.shortName.replace(/M[0-9]+/,metro));
    setData(i,2,departures[i].headsign);
}
