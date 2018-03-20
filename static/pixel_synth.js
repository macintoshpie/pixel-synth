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

// Draw your own 2d filter??? that may be nice.

//sum notes
var aScale = [
277.2,	554.4,	1109,	2217,
311.1,	622.3,	1245,	2489,
349.2,	698.5,	1397,	2794,
392,	784,	1568,	3136,
493.9,	987.8,	1976,	3951,
]
function crappy(ar, r, c) {
	yy = []
	for (i=0; i<c; i++) {
		for (j=0; j<r; j++) {
			console.log(i+(c*j))
			yy.push(ar[i+(c*j)])
		}
	}
	return yy;
}
aScale = crappy(aScale, 5, 4)

//create a synth and connect it to the master output (your speakers)
var red_syn = new Tone.Oscillator(440, "square12").toMaster().start();
var grn_syn = new Tone.Oscillator(440, "sine12").toMaster().start();
var blu_syn = new Tone.Oscillator(440, "triangle12").toMaster().start();
///////
// VARS
var myCanvas;
var canvasX;
var canvasY;
var disp_width = 400;
var disp_height = 400;
var data_width = 40;
var data_height = 40;
var ctx;
var imgData;
var displayImage;
var display_scale = 10;
var display_unit = new Array(display_scale*4);
display_unit = [255, 0, 0, 255, 255, 0, 0, 255];
red_pixel = [255, 0, 0, 255]
var red_freq = 1
var green_freq = 1
var blue_freq = 1
var mod_freq = 1

var max_list_len = 400;
var MAX_RECURSION = 3;

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
var editingMod = false; // indicates when user is updating mod value rather than a main channel

var MAX_RGB_VAL = 255;
var KNOB_THICKNESS = "1"

var red_chn = new Channel("red", new Wave(triangle(294), 293), 1)
var grn_chn = new Channel("green", new Wave(triangle(200), 10), 1)
var blu_chn = new Channel("blue", new Wave(saw(30), 1), 0)
var current_chn = red_chn;

/// Cool stuff
// weave pattern:
// [0.7521494744354535, 0.4347796215412103, 0.7302891006691259, 0.2128949687500059, 0.06995696939676943, 0.14339837839656688, 0.5855996042781819, 0.10942467418781865, 0.7998073376048322, 0.17136031525777384]
var weave = [0.75, 0, 0.75, 0, 0, 0, 0.75, 0, 0.75, 0]
var lightning = [0.09823295104804686, 0.01498873108676757, 0.1606971882062982, 0.7991849387392078, 0.7755476116559195, 0.6999722361959793, 0.014976423578878073]
var twoD = [[.1, .5, .1], [.5, 1, .5], [.1, .5, .1]]
var manTimes = 100
var man = 0

function Wave(wave_list, frequency) {
	this.wave_list = wave_list;
	this.frequency = frequency;
	this.wave_function = triangle
	this.current_idx = 0; //Used for applying the pseudo frequency
	this.phase = 0;

	this.step = function(mod, mod_amt) {
		//FIXME: THIS IS BAD. a better solution is to somehow figure out the new value using getVal
		//f = this.frequency + Math.floor(negPosInt(mod) * 3) //will need to replace constant with a variable "magnitude"
		//t = this.wave_list.splice(0, f)
		//this.wave_list = this.wave_list.concat(t);
		m = Math.floor(negPosInt(mod) * mod_amt)
		//ADD m BELOW TO MODIPHY FREQUENCY WITH THE MOD PARAMETER
		this.current_idx = (this.current_idx + this.frequency + m)%this.wave_list.length // THIS IS WHAT MODIFIES PHASE!!
		if (isNaN(this.current_idx)) throw "Parameter is not a number!";
	}

	this.getVal = function(index) {
		// i = (this.current_idx + index)%this.wave_list.length //TESTING

			j = (this.current_idx + index)%this.wave_list.length
			return this.wave_list[j];
			// the variable being named "j" was what was causing those crazy effects (was called i)
		
	}
}

function Channel(color_str, wave, weight) {
	this.color = color_str;
	this.wave = wave;
	this.weight = weight;
	this.mod = new Wave(saw(10), 1);
	this.phase_mod_amt = 0; // Determines the magnitude of the modulation on the wave
	this.freq_mod_amt = 0;
	// Mod Destinations:
	// - Frequency of wave
	// - phase of wave
	

	this.getVal = function(index, with_weight, recursion_depth) {
		i = index;
		//DO SOMETHING WITH RECURSION DEPTH
		if (recursion_depth > 1) {
			//console.log("init r: ", recursion_depth)
		}
		
		if (recursion_depth > MAX_RECURSION) {
			m = 0; // NOT applying any mod since we've recursed to the max
		}
		else {
			rd = recursion_depth + 1
			m = Math.floor(negPosInt(this.mod.getVal(i, false, rd)) * this.phase_mod_amt); // this is used to mod the phase
		}
		w = this.wave.getVal(i + m, false)
		if (with_weight) { //this will apply weighting and other filters
			//if (m!=0) console.log(m)
			//m = 0//(Math.abs(m) == 0) ? 0 : m;
			//console.log(m + i)
			
			return w * this.weight; //*m;
		} else {
			return w;
		}

	}

	this.stepAll = function(index) {
		this.wave.step(this.mod.getVal(index, false, 0), this.freq_mod_amt);
		if (this.mod instanceof Wave) {
			this.mod.step(0.5, 0); // currently not modding mods... (.5 means no mod b/c halfway between 0 and 1)
		}
	}
}

function initialize() {
	// myCanvas = document.createElement("canvas");
	// document.body.appendChild(myCanvas);
	myCanvas = document.getElementById("myCanvas")
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

	//Add inputs
	waveSelect = document.getElementById("waveSelect")
	waveSelect.addEventListener('change', function() {
		if (!editingMod) {
			w = current_chn.wave
		} else {
			if (current_chn.mod instanceof Wave) {
				w = current_chn.mod
			} else {
				w = current_chn.mod.wave
			}
			
		}
		w.wave_function = eval(waveSelect.value)
		l = w.wave_list.length
		w.wave_list = current_chn.wave.wave_function(l)
	})

	rb = document.getElementById("rb")
	rb.addEventListener('click', function(e) {
		editingMod = false;
		current_chn = red_chn
		waveSelect.value = red_chn.wave.wave_function.name
	})

	gb = document.getElementById("gb")
	gb.addEventListener('click', function(e) {
		editingMod = false;
		current_chn = grn_chn
		waveSelect.value = grn_chn.wave.wave_function.name
	})

	bb = document.getElementById("bb")
	bb.addEventListener('click', function(e) {
		editingMod = false;
		current_chn = blu_chn
		waveSelect.value = blu_chn.wave.wave_function.name
	})

	mbtn = document.getElementById("mod")
	mbtn.addEventListener('click', function(e) {
		editingMod = true;
		if (current_chn.mod instanceof Wave) {
			waveSelect.value = current_chn.mod.wave_function.name
		} else {
			waveSelect.value = current_chn.mod.wave.wave_function.name
		}
		
	})

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
		event.preventDefault();
		var touch = event.touches[0]
		wavePct = posToPercent(touch.clientX - canvasX)
		freqPct = posToPercent(touch.clientY - canvasY)

		waveLen = Math.floor(max_list_len * wavePct)
		freqVal = Math.floor(freqPct * waveLen)

		updateCurrentWave(waveLen, freqVal)
	}, false)

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
			freqVal = Math.floor(freqPct * waveLen)

			updateCurrentWave(waveLen, freqVal)
		}
	}

	//KNOB INPUTS

	// WAVE LENGTH
	$(function() {
        $("#dial-wave").knob({
        	'step': '.2',
        	'thickness': KNOB_THICKNESS,
        	'change': function(v) {updateCurrentWave(Math.floor(v/100*max_list_len))}
    	});
    });

	// FREQUENCY
    $(function() {
        $("#dial-frequency").knob({
        	'thickness': KNOB_THICKNESS,
        	'change': function(v) {
        		if (editingMod) {
        			if (current_chn.mod instanceof Wave) {
	        			wl = current_chn.mod.wave_list.length
	        		} else {
	        			wl = current_chn.mod.wave.wave_list.length
	        		}
        		} else {
        			wl = current_chn.wave.wave_list.length
        		}
        		
        		freqVal = Math.floor(v/100*wl)
        		updateCurrentWave(null, freqVal)
        	}
    	});
    });

    // MOD AMT
    $(function() {
        $("#dial-mod-phase").knob({
        	'thickness': KNOB_THICKNESS,
        	'change': function(v) {current_chn.phase_mod_amt=v}
    	});
    });

    // CHANNEL WEIGHT
    $(function() {
        $("#dial-weight").knob({
        	'thickness': KNOB_THICKNESS,
        	'change': function(v) {current_chn.weight=v/100}
    	});
    });

}

function myMod(n, m) {
	return ((n % m) + m) % m;
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


function updateCurrentWave(waveLen, freqVal) {
	if (!editingMod) {
		w = current_chn.wave
	} else {
		if (current_chn.mod instanceof Wave) {
			w = current_chn.mod
		} else {
			w = current_chn.mod.wave
		}
	}
	if (waveLen && waveLen != w.wave_list.length) {
		w.wave_list = w.wave_function(waveLen)
	}

	//FIXME: decide what to do with freq (don't always wanna pass it maybe)
	if (freqVal && freqVal != w.frequency) {
		w.frequency = freqVal
	}
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
		

		basic_unit = [
			// red_list[i%red_list.length] * red_mod[i%red_mod.length] * red_weight * 255,
			// green_list[i%green_list.length] * green_mod[(i+ 2)%green_mod.length] * green_weight * 255,
			// blue_list[i%blue_list.length] * blue_mod[(i+ 1)%blue_mod.length] * blue_weight * 255,
			// 255
			red_chn.getVal(i, true, 0) * MAX_RGB_VAL,
			grn_chn.getVal(i, true, 0) * MAX_RGB_VAL,
			blu_chn.getVal(i, true, 0) * MAX_RGB_VAL,
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

	yuh = red_chn.getVal(i, true, 0)
	ggg = yuh ? Math.floor(yuh * aScale.length) : 0
	red_syn.frequency.value = aScale[ggg];
	red_syn.volume.value = red_chn.weight * 100 - 100

	asd = grn_chn.getVal(i, true, 0)
	fff = asd ? Math.floor(asd * aScale.length) : 0
	grn_syn.frequency.value = aScale[fff];
	grn_syn.volume.value = grn_chn.weight * 100 - 100

	jkl = blu_chn.getVal(i, true, 0)
	hhh = jkl ? Math.floor(jkl * aScale.length) : 0
	blu_syn.frequency.value = aScale[hhh];
	blu_syn.volume.value = blu_chn.weight * 100 - 100

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

function rand(length) {
	r = [];
	for (var q=0; q<length; q++) {
		r.push(Math.random());
	}
	return r;
}

setInterval(draw, 60); //need to decide drawing frequency
