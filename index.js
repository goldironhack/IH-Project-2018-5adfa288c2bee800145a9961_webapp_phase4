const DISTRICT_URL ="http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=json";
const DEATHS_URL ="https://data.cdc.gov/api/views/xbxb-epbu/rows.json?accessType=DOWNLOAD";
const API_KEY ="AIzaSyDkBfoma7NvChlBTEcu0fZIuUs5lNKSQuI";

const HOUSING_URL ="https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";


var map;
var university_coordinates={lat: 40.7291, lng: -73.9965};
var bro_coordinates={lat: 40.650002, lng: -73.949997};
var ny_marker;
var bro_marker;
var directionsService;
var directionsRenderer;
//COLOR
/*#F8EFFB*/

map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: university_coordinates
    });
ny_marker = new google.maps.Marker({
    position: university_coordinates,
    map: map,
    animation: google.maps.Animation.DROP
});
directionsService = new google.maps.DirectionsService();
directionsRenderer=new google.maps.DirectionsService();

map.data.loadGeoJson(
          'http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson');
map.data.setStyle(function(feature) {
        return({
            fillColor: color(feature.getProperty('BoroCD')),
            fillOpacity: 0.5,      
            strokeColor: '#000000',
            strokeWeight: 1
          });
        });
        map.data.addListener('mouseover', function(event) {
            map.data.revertStyle();
            map.data.overrideStyle(event.feature, {strokeWeight: 2});
          });
        map.data.addListener('mouseout', function(event) {
            map.data.revertStyle();
        });
        map.data.addListener('click', function(event) {
            map.data.revertStyle();
            map.data.overrideStyle(event.feature, {strokeWeight: 2});
            infobox(event.feature.getProperty('BoroCD'));
          });
          
          
        
function markerEvents(marker){
    if(!(marker == "undefined")){
      marker.addListener("click",function(){
          getRoute();
      });
  }
}

function color(BoroCD){
    if (BoroCD-100*parseInt(BoroCD/100)<20){
            if (parseInt(BoroCD/100) == 5){
                return '#FF0000';
            }else if (parseInt(BoroCD/100) == 4){
                return '#0000FF';
            }else if (parseInt(BoroCD/100) == 3){
                return '#01A9DB'; 
            }
            else if (parseInt(BoroCD/100) == 2){
                return '#BF00FF'
            }
            else if (parseInt(BoroCD/100) == 1){
                return '#FF8000';
            }
    }
    else{
        return '#00FF00';
    }
}

function infobox(BoroCD){
    if (BoroCD-100*parseInt(BoroCD/100)<20){
            document.getElementById('Informacion').style.display = 'block';
            document.getElementById('Informacion1').style.display = 'block';
            document.getElementById('B_Iconos').style.display = 'block';
            document.getElementById('Titulo2').style.display = 'block';
            if (parseInt(BoroCD/100) == 5){
            document.getElementById('Titulo1').textContent="Staten Island";
            document.getElementById('Titulo1').style.color="#FF0000";
            }else if (parseInt(BoroCD/100) == 4){
            document.getElementById('Titulo1').textContent="Queens";
            document.getElementById('Titulo1').style.color="#0000FF";
            }else if (parseInt(BoroCD/100) == 3){
            document.getElementById('Titulo1').textContent="Brooklyn";
            document.getElementById('Titulo1').style.color="#01A9DB";
            }else if (parseInt(BoroCD/100) == 2){
            document.getElementById('Titulo1').textContent="Bronx";
            document.getElementById('Titulo1').style.color="#4C0B5F";
            }else if (parseInt(BoroCD/100) == 1){
            document.getElementById('Titulo1').textContent="Manhattan";
            document.getElementById('Titulo1').style.color="#FF8000";
            }
            document.getElementById('Titulo').style.fontSize="large";
            document.getElementById('Titulo2').textContent= "District Number: "+(BoroCD-100*parseInt(BoroCD/100)).toString();
            document.getElementById('Ranking').textContent="Value";
            document.getElementById('Safety').textContent="Value";
            document.getElementById('Distance').textContent="Value";
            document.getElementById('Affordability').textContent="Value";
   }else{
       document.getElementById('Titulo1').style.color="#00FF00";
       document.getElementById('Titulo1').textContent="Green Area";
       document.getElementById('Informacion').style.display = 'none';
       document.getElementById('Informacion1').style.display = 'none';
       document.getElementById('B_Iconos').style.display = 'none';
       document.getElementById('Titulo2').style.display = 'none';
   }
}


function getRoute(){
    var request = {
      origin: ny_marker.position,
      destination: bro_marker.position,
      travelMode:'DRIVING'
    }
    directionsRenderer.setMap(map);
    directionsService.route(request,function(result,status){
        if(status=="OK"){
          directionsRenderer.setDirections(result);
        }
    });
}

var distritos = [];
var polydistritos = [];
function getDistritos(){
    var data = $.get(DISTRICT_URL,function(){
    })
    .done(function(){
        var json = JSON.parse(data.responseText);
        var dataRow = json.features;
        for (var i = 0; i < dataRow.length; i++) {
            distritos.push([dataRow[i].attributes.BoroCD,dataRow[i].geometry.rings.reverse()]);
        }
        for (var j = 0; j < distritos.length; j++) {
            reversa = [];
            for (var k = 0; k < distritos[j][1].length; k++) {
                for(var o = 0; o<distritos[j][1][k].length;o++){
                    var c= {lat: 0, lng: 0};
                    c.lat = distritos[j][1][k][o][1];
                    c.lng = distritos[j][1][k][o][0];
                    reversa.push(c);
                }
            }
            distritos[j][1] = reversa;
            var Distrito = new google.maps.Polygon({
            paths: reversa
            });
            polydistritos.push(Distrito);
        }
        /*
        for (var k = 0; k<distritos.length;k++){
            path = []
            for (var l = 0; l<distritos[k][1].length;l++){
                for (var m = 0; m<distritos[k][1][l].length;m++){
                    path.push(distritos[k][1][l][m]);
                }

            }
            polydistritos.push(path);
        }
        */
         console.log(polydistritos);
         console.log(distritos);
    })
    .fail(function(error){
        console.log(error);
    });
}
getDistritos();
setTimeout(function(){
    console.log(distritos)
    for (var i = 0; i < housing.length; i++) {
        var punto= {lat: 0, lng: 0};
        punto.lat = housing[1];
        punto.lng = housing[2];
        if  (google.maps.geometry.poly.containsLocation(punto,polydistritos[0]) == true){
            console.log("HERE");
        }
    }
    /*
    for (var i = 0; i < housing.length; i++) {
        for (var j = 0; j<distritos.length;j++){
            pathsdistrito = []
            for (var k = 0; j<distritos[j].length;k++){
                
            new google.maps.LatLng(25.774, -80.190),
            new google.maps.LatLng(18.466, -66.118),
            new google.maps.LatLng(32.321, -64.757)
                }
            var Distrito = new google.maps.Polygon({
            paths: []
            
        });
        }
        
        if  (google.maps.geometry.poly.containsLocation(event.latLng,bermudaTriangle) == true){
            
        }
         google.maps.geometry.poly.containsLocatio
        console.log(housing[i]);
    }*/
    
   // drawDistritos(distritos);
    
},2000);
console.log(distritos);
console.log(distritos[1]);
/*
var infoRows = [];
function getData(){
  var data = $.get(DEATHS_URL,function(){})
    .done(function(){
        var dataRow = data.responseJSON.data;
        for (var i = 0; i < dataRow.length; i++) {
          infoRows.push([dataRow[i][8],dataRow[i][13],dataRow[i][9]]);
        }
        var tableReference= $("#tableBody")[0];
        var newRow,state,deaths,year;
        for (var j = 0; j < infoRows.length; j++) {
          newRow = tableReference.insertRow(tableReference.rows.length);
          state = newRow.insertCell();
          deaths = newRow.insertCell();
          year = newRow.insertCell();
          state.innerHTML = infoRows[j][0];
          deaths.innerHTML = infoRows[j][1];
          year.innerHTML = infoRows[j][2];
        }
    })
    .fail(function(error){
        console.log(error);
    });
}
*/

var housing = [];
function getHousing(){
  var data = $.get(HOUSING_URL,function(){})
    .done(function(){
        var dataRow = data.responseJSON.data;
        console.log(dataRow);
        //15 23 24 31
        for (var i = 0; i < dataRow.length; i++) {
            if (dataRow[i][23] != null){
            housing.push([dataRow[i][15],dataRow[i][23],dataRow[i][24],dataRow[i][31]]);
            }
        }
    })
    .fail(function(error){
        console.log(error);
    });
}



$("document").ready(function(){
  getHousing();
  //$("#getData").on("click",getDistritos)
  $("#exportData").click(function(){
  $("table").tableToCSV();
  });
  
});