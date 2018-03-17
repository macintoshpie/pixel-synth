/*
Input Ideas:
-allow users to create lists of any size
-random list generator
-saw list generator
-triangle list generator
-sine list generator
-draw a pattern, then it gets translated into a list
-type a word which then gets translated into a list
-select from preset lists
-draw the wave shape (like that ableton synth)
-draw a pattern in a square box, then drag around a cropping area over the drawing to select what's used in the list

*/

/*
Refactoring Ideas:
-can one mod another? (e.g. the final red output mods green)

Channel class:
-color
-waveform
-modulation waveform
-phase
-frequency?
-"weight"
*/

/*
Design ideas:
have like 2 selects at the bottom: waveform, frequency
have a toggle switch to determine if you are editing the main wave or if you are editing the wave's mod
have 3 buttons at bottom to select color to manipulate
can lock an attribute down, so that clicking and dragging on screen only affects one (rather than both)
*/


///////
// VARS
var myCanvas;
var canvasX;
var canvasY;
var disp_width = 500;
var disp_height = 500;
var data_width = 26;
var data_height = 26;
var ctx;
var imgData;
var displayImage;
var display_scale = 15;
var display_unit = new Array(display_scale*4);
display_unit = [255, 0, 0, 255, 255, 0, 0, 255];
red_pixel = [255, 0, 0, 255]
var red_freq = 1
var green_freq = 1
var blue_freq = 1
var mod_freq = 1

var max_list_len = 100;

var red_list = saw(20);
var green_list = triangle(36);
var blue_list = saw(32);
var mod_list = [0, .2, .4, .6, .8, 1];

var red_mod = [1];
var green_mod = [1];
var blue_mod = [1]; 

var red_weight = 1
var green_weight = 0
var blue_weight = 0

window.onload = initialize;

var mouseIsDown = false;

var MAX_RGB_VAL = 255;

var red_chn = new Channel("red", new Wave(saw(10), 1))
var grn_chn = new Channel("green", new Wave(triangle(24), 1))
var blu_chn = new Channel("blue", new Wave(saw(30), 1))
var current_chn = red_chn;

/// Cool stuff
// weave pattern:
// [0.7521494744354535, 0.4347796215412103, 0.7302891006691259, 0.2128949687500059, 0.06995696939676943, 0.14339837839656688, 0.5855996042781819, 0.10942467418781865, 0.7998073376048322, 0.17136031525777384]
var weave = [0.75, 0, 0.75, 0, 0, 0, 0.75, 0, 0.75, 0]
var lightning = [0.09823295104804686, 0.01498873108676757, 0.1606971882062982, 0.7991849387392078, 0.7755476116559195, 0.6999722361959793, 0.014976423578878073]
var twoD = [[.1, .5, .1], [.5, 1, .5], [.1, .5, .1]]

function Wave(wave_list, frequency) {
	this.wave_list = wave_list;
	this.frequency = frequency;

	this.step = function(mod) {
		//FIXME: THIS IS BAD. a better solution is to somehow figure out the new value using getVal
		f = this.frequency + Math.floor(negPosInt(mod) * 3) //will need to replace constant with a variable "magnitude"
		t = this.wave_list.splice(0, f)
		this.wave_list = this.wave_list.concat(t);
	}

	this.getVal = function(index) {
		return this.wave_list[index%this.wave_list.length];
	}
}

function Channel(color_str, wave) {
	this.color = color_str;
	this.wave = wave;
	this.weight = 1;
	this.mod = new Wave(saw(10), 1);
	this.phase = 0;

	this.getVal = function(index) {
		i = index;
		w = this.wave.getVal(i);
		m = this.mod.getVal(i);
		return w * this.weight;
	}

	this.stepAll = function(index) {
		this.wave.step(this.mod.getVal(index));
		if (this.mod instanceof Wave) {
			this.mod.step(0.5);
		}
	}
}

function initialize() {
	myCanvas = document.createElement("canvas");
	document.body.appendChild(myCanvas);
	myCanvas.width = disp_width;
	myCanvas.height = disp_height;
	ctx = myCanvas.getContext("2d");
	
	imgData = ctx.createImageData(data_width, data_height);
	displayImage = ctx.createImageData(data_width*display_scale, data_height*display_scale)
	//imgData2 = ctx.createImageData(data_width, data_height);
	for (var i=0; i<imgData.data.length; i+=4) {
		imgData.data[i] = 0;
		imgData.data[i+1] = 0;
		imgData.data[i+2] = 0;
		imgData.data[i+3] = 255;
		// imgData2.data[i] = 0;
		// imgData2.data[i+1] = 0;
		// imgData2.data[i+2] = 0;
		// imgData2.data[i+3] = 255;
		
	}

	for (var i=0; i<displayImage.data.length; i+=4) {
		displayImage.data[i] = 0;
		displayImage.data[i+1] = 0;
		displayImage.data[i+2] = 0;
		displayImage.data[i+3] = 255;
	}

	//ctx.putImageData(imgData, 0, 0);
	//ctx.putImageData(imgData2, 0, 0);
	ctx.putImageData(displayImage, 0, 0);

	//Add input box and button
	myInput = document.createElement("input");
	document.body.appendChild(myInput);

	myBtn = document.createElement("button");
	document.body.appendChild(myBtn);

	myBtn.onclick = function() {
		color_data = myInput.value.split(",");
		newList = color_data.map(colorMap)
		myInput.value = newList
		red_list = newList;
	};

	//Add input box and button
	modInput = document.createElement("input");
	document.body.appendChild(modInput);

	modBtn = document.createElement("button");
	document.body.appendChild(modBtn);

	modBtn.onclick = function() {
		mod_data = modInput.value.split(",");
		newMod = mod_data.map(colorMap)
		modInput.value = newMod
		red_mod = newMod;
	};

	myRange = document.getElementById("myRange");
	myRange.oninput = function() {
		red_freq = this.value;
	}


	document.addEventListener('keydown', function(event) {
		draw()
		if (event.code == 'KeyR') {
			// edit red
			current_chn = red_chn
		}
		else if (event.code == 'KeyG') {
			current_chn = grn_chn
		}
		else if (event.code == 'KeyB') {
			current_chn = blu_chn
		}
	});

	//Setup mouse input
	canvasX = myCanvas.getBoundingClientRect().left
	canvasY = myCanvas.getBoundingClientRect().top
	myCanvas.onmousedown = function(e) {
		mouseIsDown = true;
	}

	myCanvas.addEventListener('touchmove', function(e) {
		var touch = event.touches[0]
		wavePct = posToPercent(touch.clientX - canvasX)
		freqPct = posToPercent(touch.clientY - canvasY)

		waveLen = Math.floor(max_list_len * wavePct)
		if (waveLen != current_chn.wave.wave_list.length) {
			current_chn.wave = new Wave(saw(waveLen))
		}

		freqVal = Math.floor(freqPct * waveLen)
		if (freqVal != current_chn.wave.frequency) {
			current_chn.wave.frequency = freqVal
		}
	})

	myCanvas.onmouseup = function(e) {
		mouseIsDown = false;
	}
	myCanvas.onmousemove = function(e) {
		if (mouseIsDown) {
			//NOTE: may want to use the change in position rather than
			// absolute position in the future...
			wavePct = posToPercent(e.clientX - canvasX)
			freqPct = posToPercent(e.clientY - canvasY)

			waveLen = Math.floor(max_list_len * wavePct)
			if (waveLen != current_chn.wave.wave_list.length) {
				current_chn.wave = new Wave(saw(waveLen))
			}

			freqVal = Math.floor(freqPct * waveLen)
			if (freqVal != current_chn.wave.frequency) {
				current_chn.wave.frequency = freqVal
			}
		}
	}
}

function posToPercent(position) {
	if (position > disp_width) {
		return 1
	} else if (position < 0) {
		return 0
	}
	return position / disp_width
}

function negPosInt(x) {
	//takes the range from 0 through 1 and maps it to -1 through 1
	return (x-0.5)/0.5
}


function updateWave(wave_name, wave_type, wave_param) {
	red_list = saw(wave_param)
}

function colorMap(color_string) {
	alphabet = "qwertyuiopasdfghjklzxcvbnm".split("")
	color_string = color_string.toLowerCase();
	if (!isNaN(parseFloat(color_string))) {
		return parseFloat(color_string).toFixed(2);
	}
	else if (alphabet.indexOf(color_string) > 0) {
		return (alphabet.indexOf(color_string)/alphabet.length).toFixed(2);
	}
	else {
		return Math.random().toFixed(2);
	}
}

function flattenArray(an_array) {
	return [].concat(...an_array);
	// for (var x=0; x<an_array.length; x++) {
	// 	for (var y=0; y<x.length; y++) {

	// 	}
	// }
}

function updateImage() {
	for (var i=0; i<data_width*data_height; i++) {//*red_list.length) {	//jump at intervals as long as the my_list array
		//console.log(i)

		//TODO: incorporate feedback into mod

		basic_unit = [
			// red_list[i%red_list.length] * red_mod[i%red_mod.length] * red_weight * 255,
			// green_list[i%green_list.length] * green_mod[(i+ 2)%green_mod.length] * green_weight * 255,
			// blue_list[i%blue_list.length] * blue_mod[(i+ 1)%blue_mod.length] * blue_weight * 255,
			// 255
			red_chn.getVal(i) * MAX_RGB_VAL,
			grn_chn.getVal(i) * MAX_RGB_VAL,
			blu_chn.getVal(i) * MAX_RGB_VAL,
			MAX_RGB_VAL
		]
		var disp_arr = []
		for (var display_i=0; display_i<display_scale; display_i++){
			disp_arr = disp_arr.concat(basic_unit)
		}

		// Get the upper left cell for the displayimage
		display_row_start = (i * Math.pow(display_scale, 2) - ((i % data_width) * display_scale * (display_scale - 1)))
		//console.log("index: ", i, "->", display_row_start)

		for (var display_i=0; display_i<display_scale; display_i++) {
			insert_index = (display_row_start + (displayImage.width * display_i))
			//console.log("col: ", i, " row:", display_i, "->", insert_index)
			insert_index = insert_index * 4
			displayImage.data.set(disp_arr, insert_index);

			//console.log(insert_index)
		}
		
		//displayImage.data.set(display_unit, img_idx*display_scale);
		//displayImage.data.set(display_unit, (img_idx+data_width)*display_scale)

		// imgData.data[img_idx+0] = red_list[i%red_list.length] * mod_list[i%mod_list.length]
		// imgData.data[img_idx+1] = green_list[i%green_list.length] * mod_list[(i+2)%mod_list.length]
		//imgData2.data[imgData2.data.length-img_idx+1] = green_list[i%green_list.length] * green_weight
		// imgData.data[img_idx+2] = blue_list[i%blue_list.length] * blue_weight
	}

	//TODO: these shifts should be determined by the list length
	// specifically, what would be the next value after writing the last (bottom right) pixel?
	// ie. the red_list.length % data_width*data_height
	// Decide which version I like better....
	new_red = red_list.splice(0, red_freq)//((data_width*data_height) % red_list.length));
	red_list = red_list.concat(new_red);
	new_green = green_list.splice(0, (data_width*data_height) % green_list.length);
	green_list = green_list.concat(new_green);
	new_blue = blue_list.splice(0, (data_width*data_height) % blue_list.length);
	blue_list = blue_list.concat(new_blue);
	// new_green = green_list.splice(0, green_freq);
	// green_list = green_list.concat(new_green);
	// new_blue = blue_list.splice(0, blue_freq);
	// blue_list = blue_list.concat(new_blue);

	new_mod = mod_list.splice(mod_freq);
	mod_list = mod_list.concat(new_mod);

	new_red_mod = red_mod.splice(mod_freq)
	red_mod = red_mod.concat(new_red_mod)
	new_blue_mod = blue_mod.splice(mod_freq)
	blue_mod = blue_mod.concat(new_blue_mod)
	new_green_mod = green_mod.splice(mod_freq)
	green_mod = green_mod.concat(new_green_mod)

	//NEW STUFF
	red_chn.stepAll(i)
	grn_chn.stepAll(i)
	blu_chn.stepAll(i)
}

function draw() {
	updateImage();

	ctx.putImageData(displayImage, 0, 0)
	//ctx.putImageData(imgData, 0, 0);
	// ctx.putImageData(imgData2, data_width, 0)
	// ctx.putImageData(imgData2, 0, data_height)
	// ctx.putImageData(imgData, data_width, data_height)
}

function saw(length) {
	var temp_array = new Array(length);
	increment = 1/length
	for (var s=0; s<length; s++) {
		temp_array[s] = s*increment
	}
	return temp_array
}

function triangle(length) {
	if (length%2 != 0) {
		length += 1
	}
	var temp_array = new Array(length);
	// quarter = Math.ceil(length/4)
	// increment = 1/Math.floor(length/4);
	// temp_array[0] = 0;
	// for (var t=1; t<length; t++) {
	// 	temp_array[t] = temp_array[t-1] + increment
	// 	//rescale for range 0 to 1
	// 	temp_array[t] = (temp_array[t] + 1)/2
	// 	if (t == quarter || t == quarter*3) {
	// 		increment = increment * -1;
	// 	}
	// }
	half = length/2
	increment = 1/half
	temp_array[0] = 0
	for (var t=1; t<length; t++) {
		temp_array[t] = temp_array[t-1] + increment
		if (t == half) {
			increment = increment * -1
		}
	}

	return temp_array

}

function randomList(length) {
	r = [];
	for (var q=0; q<length; q++) {
		r.push(Math.random());
	}
	return r;
}

setInterval(draw, 33);
