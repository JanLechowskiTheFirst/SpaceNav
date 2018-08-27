// this is the construction helping me testing function with nodejs
var outcome = function (message){
  var ship = setShip(0, 0, 1, 1, 1);
  saveDataToFile("/home/jan/test1", ship);
  calculatePostionAfterMove(ship, 0, 180, 180);
  saveDataToFile("/home/jan/test1", ship); // in the place of /home/jan/test1  put the address to the file when the logs will be written to
  //process.argv[2] - this is the way for using command line attibutes in nodejs - argv[2] is the first arrgument after the name of the script.
}
console.log(outcome());
//this is the end of construction helping me testing function with nodejs

function degreeToRadian(angle){
	return angle * (Math.PI / 180);
}

// all changes in the attitude will be the rotation of the localCoordinatesSystem according to globalCoordinatesSystem. In fact, we will rotate just one point that is in this local system, that is the front of the ship. The back is in its middle, so no rotation is required.
//this function takes 4 arguments, ship, distance, azimuth in deg (positive value means turn right, negative, turn left) and elevation in deg(postive value means go up, negative go down)
function calculatePostionAfterMove(ship, distance, azimuth, elevation){
	//rotation of the ships front
	rotateShip(ship, azimuth, elevation);
	makeAmove(ship, distance);
	return ship; // this function return ship, it has back and front global coordintes calculated, and the attitude, ship.shipAttitude.xRoll, ship.shipAttitude.yPith, ship.shipAttitude.zYaw. They hold negative values of the input (so if you commanded the +90deg turn as a azimuth,  ship.shipAttitude.zYaw will hold -90)
}

function makeAmove(ship, distance){
	//SHIP FRONT MOVEMENT
	var frontMultiplayer = distance+1;//divided by length of the ship - but its always 1
	ship.shipFrontGlobalCoordinates.x += ship.shipFrontLocalCoordinates.x*frontMultiplayer-1;//-1 becouse at the beginning we set global x=1 and local x=1, that sums to 2. When changing gobal position by the total change of local, we have to substract this local x =1;
	ship.shipFrontGlobalCoordinates.y += ship.shipFrontLocalCoordinates.y*frontMultiplayer;
	ship.shipFrontGlobalCoordinates.z += ship.shipFrontLocalCoordinates.z*frontMultiplayer;
	//SHIP BACK MOVEMENT
	var backMultiplayer = distance;//divided by length of the ship - but its always 1
	ship.shipBackGlobalCoordinates.x += ship.shipFrontLocalCoordinates.x*backMultiplayer;
	ship.shipBackGlobalCoordinates.y += ship.shipFrontLocalCoordinates.y*backMultiplayer;
	ship.shipBackGlobalCoordinates.z += ship.shipFrontLocalCoordinates.z*backMultiplayer;
}

function updateGlobalCoordinates(ship){
	//SHIP FRONT UPDATE
	ship.shipFrontGlobalCoordinates.x += ship.shipFrontLocalCoordinates.x-1;//-1 becouse at the beginning we set global x=1 and local x=1, that sums to 2. When changing gobal position by the total change of local, we have to substract this local x =1;
	ship.shipFrontGlobalCoordinates.y += ship.shipFrontLocalCoordinates.y;
	ship.shipFrontGlobalCoordinates.z += ship.shipFrontLocalCoordinates.z;
}

// function rotatePointAgainstTheXAxis(ship, angleValueOfRotation){   // THIS ONE WILL NOT BE USED - ship will never roll - part of requirments. Still this function can be used if roll should be added.
// 	ship.shipFrontLocalCoordinates.y =  Math.cos(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.y - Math.sin(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.z;
// 	ship.shipFrontLocalCoordinates.z = Math.sin(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.y + Math.cos(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.z;
// }

//rotate ships front against Y axis - it used the matrix rotation exation for rotation against Y axis with the angle equal to the 'elevation'.
function rotatePointAgainstTheYAxis(ship, angleValueOfRotation){
	var tempX = ship.shipFrontLocalCoordinates.x;
	ship.shipFrontLocalCoordinates.x = Math.cos(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.x + Math.sin(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.z;
	ship.shipFrontLocalCoordinates.z = -Math.sin(degreeToRadian(angleValueOfRotation)) * tempX + Math.cos(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.z;
}
//rotate ships front against Z axis - it used the matrix rotation exation for rotation against Z axis with the angle equal to the 'azimuth'.
function rotatePointAgainstTheZAxis(ship, angleValueOfRotation){
	var tempX = ship.shipFrontLocalCoordinates.x;
	ship.shipFrontLocalCoordinates.x = Math.cos(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.x - Math.sin(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.y;   
	ship.shipFrontLocalCoordinates.y = Math.sin(degreeToRadian(angleValueOfRotation)) * tempX + Math.cos(degreeToRadian(angleValueOfRotation)) * ship.shipFrontLocalCoordinates.y;
}

// function to set ships starting postion/attitude
function setShip(azimuthVal, elevationVal, xVal, yVal, zVal){
    var ship = {shipAttitude : {xRoll:0, yPitch:0, zYaw:0}, // Ships Attidude in deegres from the global axis.  Ship is a vector [1,0,0] at the beginning, so its length one vector pointet along axis X. The back is point (0,0,0) of local coordinates system. The front is (1,0,0) of local coordinate system (at least at the beginning, befor rotations)
	shipBackGlobalCoordinates : {x:xVal, y:yVal, z:zVal}, // this are the coordinates accordint to 'center of the galaxy', ship back is located at its center at the very beginning
	shipBackLocalCoordinates : {x:0, y:0, z:0}, //local coordinates of ship back - always 0,0,0.
	shipFrontGlobalCoordinates : {x:(xVal+1), y:yVal, z:zVal}, //front is a translated by vector[1,0,0] accoding to back 
	shipFrontLocalCoordinates : {x:1, y:0, z:0}, // coordinates of the ships front, preset as vector [1,0,0] with front a the value 1 of X axis, according to galaxy center
	};
	//after setting coordnates, we now set the rotations
	rotateShip(ship, azimuthVal, elevationVal); 
	updateGlobalCoordinates(ship);//updating global coordinates after rotation
	return ship;
}

//rotate ship agains Z and Y axis
function rotateShip(ship, azimuth, elevation){
	ship.shipAttitude.yPitch += -elevation;
	ship.shipAttitude.zYaw += - azimuth;
	var tempShip = ship;
	rotatePointAgainstTheYAxis(ship, ship.shipAttitude.yPitch);
	rotatePointAgainstTheZAxis(tempShip, ship.shipAttitude.zYaw);
	ship.shipFrontLocalCoordinates.x=tempShip.shipFrontLocalCoordinates.x;
	ship.shipFrontLocalCoordinates.y=tempShip.shipFrontLocalCoordinates.y;
}



//TEST FUNCTION - file saving
//The file will be saved on local HDD in the localtion given by user
function saveDataToFile(fileLocation, ship){ 
	var fs = require('fs');
	fs.appendFile(fileLocation, shipParametersLog(ship), function (err) {
	    if (err) return console.log(err);
	    console.log('writing to file: success');
	});
}

//TEST FUNCTION - parameters that will be saved to the file
//function changing ship paramteres into report that will be saved to a file later. 
//all coordinates that actually change, are rounded to 2 deciamal points(only for displaying purposes, 0 looks better than 3.0123012301230-e27 :P)
function shipParametersLog(ship){
	var attitudeParam = "Ship attitude:xRoll" + " Pitch " + " zRoll \n" + ship.shipAttitude.xRoll + " " + ship.shipAttitude.yPitch + " " + ship.shipAttitude.zYaw;
	var globalBackCoords = "\nShip globalBackCoords:X" + " Y " + " Z \n" + Math.round(100*ship.shipBackGlobalCoordinates.x)/100 + " " + Math.round(100*ship.shipBackGlobalCoordinates.y)/100 + " " + Math.round(100*ship.shipBackGlobalCoordinates.z)/100;
	var localBackCoords = "\nShip localBackCoords:X" + " Y " + " Z \n" + ship.shipBackLocalCoordinates.x + " " + ship.shipBackLocalCoordinates.y + " " + ship.shipBackLocalCoordinates.z;
	var globalFronCoords = "\nShip globalFrontCoords:X" + " Y " + " Z \n" + Math.round(100*ship.shipFrontGlobalCoordinates.x)/100 + " " + Math.round(100*ship.shipFrontGlobalCoordinates.y)/100 + " " + Math.round(100*ship.shipFrontGlobalCoordinates.z)/100;
    var localFronCoords = "\nShip localFrontCoords:X" + " Y " + " Z \n" + Math.round(100*ship.shipFrontLocalCoordinates.x)/100 + " " + Math.round(100*ship.shipFrontLocalCoordinates.y)/100 + " " + Math.round(100*ship.shipFrontLocalCoordinates.z)/100;
	return attitudeParam + globalBackCoords + localBackCoords + globalFronCoords +  localFronCoords + "\n\n\n\n\n";
}
