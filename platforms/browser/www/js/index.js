 // Global variables for GPS
var ctime = 0;
var clat = 0;
var clon = 0;
var cacc = 0;

// Global variables file operations
var fileName = 'log.txt';
var currentstatus = 0;
var newstatus = 0;
var readwrite = 0;


// Positions for testing
var xlat = [42.1092751, 42.107954, 42.1061707, 42.2576586, 41.3290474, 41.2014197];
var xlon = [-83.381432, -83.3834758, -83.3835375, -83.1283092, -111.9725248, -112.0087641];
var i = 0;
var dist = 1000000;
var igps = 0;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		// Show splash screen
		navigator.splashscreen.show();
		window.setTimeout(function () {
			navigator.splashscreen.hide();
		}, 3000 - 500);
		
        app.receivedEvent('deviceready');
		
    },
	
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
	
};



function onConfirmExit() {
    navigator.app.exitApp(); // If user select a Yes, quit from the app.
}





function getGPS() {
	document.getElementById("gpsinfo").innerHTML = ('BUTTON WORKING...');
	document.getElementById("gpsinfo2").innerHTML = ('');
	document.getElementById("fileinfo").innerHTML = ('');
	
	navigator.geolocation.getCurrentPosition(GPSdata, onError, {maximumAge: 0, timeout: 10000, enableHighAccuracy: true});
	igps = 0;
}

// GPS Callback - gets data, writes to variables, calls function for geodistance
function GPSdata(position) {
	ctime = position.timestamp;
	clat = position.coords.latitude;
	clon = position.coords.longitude;
	cacc = position.coords.accuracy;
	
	//i = document.getElementById("ivalue").value;
	i = document.getElementById("SelectLocation").selectedIndex;
	geodistance(clat, clon, xlat[i], xlon[i]);

    //position.coords.latitude
    //position.coords.longitude
    //position.coords.altitude
    //position.coords.accuracy
    //position.coords.altitudeAccuracy
    //position.coords.heading
    //position.coords.speed
    //position.timestamp
}

// onError Callback receives a PositionError object 
function onError(error) {
	alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}


// Calculate distance between 2 decimal degree GPS coordinates (not very precise for long distances)
function geodistance1(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515 * 5280;
	
	writeGPS(dist);
}


function geodistance(lat1, lon1, lat2, lon2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dlat = Math.PI * (lat2 - lat1) / 180;
  var dlon = Math.PI * (lon2 - lon1) / 180;
  var a = (Math.sin(dlat / 2) * Math.sin(dlat / 2)) + (Math.cos(Math.PI * (lat1) / 180) * Math.cos(Math.PI * (lat2) / 180) * Math.sin(dlon / 2) * Math.sin(dlon / 2));
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  d = d * 3.280839895; // Convert meters to feet
  
  writeGPS(d);
}




function writeGPS(xfeet) {
	document.getElementById("gpsinfo").innerHTML = (Math.round(cacc*10)/10 + ' / ' + clat + ' / ' + clon);
	document.getElementById("gpsinfo2").innerHTML = ('Feet from target (' + i + '): ' + Math.round(xfeet*10)/10);
	
	if (igps < 5) {
		if (cacc > 100) {
			navigator.geolocation.getCurrentPosition(GPSdata, onError, {maximumAge: 0, timeout: 10000, enableHighAccuracy: true});
			igps = igps + 1;
			document.getElementById("fileinfo").innerHTML = 'Low accuracy result... trying again';
		}
	}
	
	if (igps > 0) {
		if (cacc <=100) {
			document.getElementById("fileinfo").innerHTML = 'Improved accuracy in ' + igps + ' tries';
		}
	}
	
	//if (ctime > 1483693200000) {
	//	greeting = "Test 1";
	//} else if (ctime > 1480007371530) {
	//	greeting = "Test 2";
	//} else {
	//	greeting = "Test 3";
	//}
}





function writefile() {
	readwrite = 1;
	newstatus = 10000;
	workfile();
}

function readfile() {
	readwrite = 2;
	workfile();
}

//Could use: cordova.file.applicationStorageDirectory
function workfile() {
	alert(cordova.file.dataDirectory);
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, gotFS, fail);
}

function gotFS(fileSystem) {
	alert('2');
	fileSystem.getFile('log.txt', {create: true}, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
	alert('3');
	if (readwrite == 1) {
		fileEntry.createWriter(gotFileWriter, fail);
	} else if (readwrite == 2) {
		fileEntry.file(gotFileReader, fail)
	}
	readwrite = 0;
}

function gotFileWriter(writer) {
	writer.onwriteend = function(evt) {
		writer.write(newstatus);
		currentstatus = newstatus;
		// comment the rest of this out?  or just leave a blank onwriteend event...?
		writer.onwriteend = function(evt) {
			alert('Write complete: ' + newstatus);
		};
	};
	alert('4');
	// reset file first for writing new values
	writer.truncate(0);
	//writer.write(ctime);
}


function gotFileReader(file) {
	readAsText(file);
}

function readAsText(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		currentstatus = evt.target.result
		alert("Current Status: " + currentstatus);
	};
	reader.readAsText(file);
}

function fail(error) {
	alert(error.code);
}

// http://docs.phonegap.com/en/edge/cordova_file_file.md.html


function setstatus() {
	currentstatus = 10;
	newstatus = 10;
	alert(currentstatus + " / " + newstatus);
}

