/* THIS IS A VERY ROUGH PROTOTYPE */


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
Channel class:
-color
-waveform
-modulation waveform
-phase
-frequency?
-"weight"?
*/

/*
Design ideas:
have like 2 selects at the bottom: waveform, frequency
have a toggle switch to determine if you are editing the main wave or if you are editing the wave's mod
have 3 buttons at bottom to select color to manipulate
can lock an attribute down, so that clicking and dragging on screen only affects one (rather than both)
*/

////////////
// SOME VARS
var myCanvas;
var canvasX;
var canvasY;
var disp_width = 400;
var disp_height = 400;
var data_width = 60;
var data_height = 60;
var ctx;
var imgData;
var displayImage;
var display_scale;

var max_list_len = 200;
var MAX_RECURSION = 3;

var mouseIsDown = false;
var sc_mouse_down = false;

var MAX_RGB_VAL = 255;
var KNOB_THICKNESS = 1;
var KNOB_CHOICE_THICKNESS = .5;
var KNOB_PADDING = 8;
var KNOB_WIDTH = 140;
var KNOB_HEIGHT = KNOB_WIDTH;

// // Create our channels and waves with demo
var red_chn, grn_chn, blu_chn, mod_1, mod_2;
initChannels();
demoSimple();

var current_chn = red_chn;
var modSrcSelect;

var chn_list = [red_chn, grn_chn, blu_chn, mod_1, mod_2];
var wave_funcs = [saw, triangle, square, rand];
var mod_dests = ["phase", "frequency", "weight"];

var wave_name_map = {
	'red': {
		'src': red_chn,
		'color': "#FF0000"
	},
	'green': {
		'src': grn_chn,
		'color': "#00FF00"
	},
	'blue': {
		'src': blu_chn,
		'color': "#0000FF"
	},
	'mod 1': {
		'src': mod_1,
		'color': "#8b8b8b"
	},
	'mod 2': {
		'src': mod_2,
		'color': "#8b8b8b"
	}
}

var updateCurrentChannel = function(chnIdxPct) {
	select_idx = Math.floor(chnIdxPct * chn_list.length);
	current_chn = chn_list[select_idx];
	updateKnobs();
	drawShapeCanvas();
}

var updateCurrentShape = function(waveIdxPct) {
	wave_func_idx = Math.floor(waveIdxPct * wave_funcs.length);
	new_wave_func = wave_funcs[wave_func_idx];
	if (current_chn instanceof Wave) {
		w = current_chn
	} else {
		w = current_chn.wave
	}
	if (w.wave_function != new_wave_func) {
		w.wave_function = new_wave_func;
		l = w.wave_list.length;
		w.wave_list = w.wave_function(l);
	}
	drawShapeCanvas();
}

var updateCurrentLength = function(lenPct) {
	if (current_chn instanceof Wave) {
		w = current_chn
	} else {
		w = current_chn.wave
	}
	newLen = Math.floor(lenPct * max_list_len);
	orig_freq_pct = w.frequency / w.wave_list.length;
	if (newLen != w.wave_list.length) {
		w.wave_list = w.wave_function(newLen)
	}
	updateCurrentFrequency(orig_freq_pct)
	drawShapeCanvas();
}

var updateCurrentFrequency = function(freqPct) {
	if (current_chn instanceof Wave) {
		w = current_chn
		wl = w.wave_list.length
	} else {
		w = current_chn.wave
		wl = w.wave_list.length
	}
	newFreq = Math.round(freqPct*wl);
	if (newFreq != w.frequency) {
		w.frequency = newFreq;
	}
}

var updateCurrentModAmt = function(amtPct) {
	//TODO: replace 100 with variable so that each mod type (phase, weight, frequency) is different??
	current_chn.phase_mod_amt = amtPct*100
}

var updateCurrentWeight = function(weightPct) {
	current_chn.weight = weightPct;
}

var updateCurrentModSrc = function(chnIdxPct) {
	src_idx = Math.floor(chnIdxPct * chn_list.length);
	if (current_chn instanceof Wave) {
		return;
	}
	if (current_chn.mod != chn_list[src_idx]) {
		current_chn.mod = chn_list[src_idx];
	}
}

var updateCurrentModDest = function(destIdxPct) {
	dest_idx = Math.floor(destIdxPct * mod_dests.length);
	if (current_chn instanceof Wave) {
		return;
	}
	if (current_chn.mod_dest != mod_dests[dest_idx]) {
		current_chn.mod_dest = mod_dests[dest_idx];
	}
}

// trackers for click/drag input
var x_function = updateCurrentLength
var y_function = updateCurrentFrequency
var prev_x_pos = 0;
var prev_y_pos = 0;
var shift_x = false;
var shift_y = false;

var mouseInputFunc = function(e) {
	if (mouseIsDown) {
		//NOTE: may want to use the change in position rather than
		// absolute position in the future...
		x_pct = posToPercent(e.clientX - canvasX, disp_width);
		y_pct = posToPercent(e.clientY - canvasY, disp_width);

		if (shift_x & e.shiftKey) {
			x_function(x_pct)
		}
		else if (shift_y & e.shiftKey) {
			y_function(y_pct)
		}
		else if (e.shiftKey) {
			// first movement with shift down
			if (e.screenX - prev_x_pos > e.screenY - prev_y_pos) {
				shift_x = true;
			} else {
				shift_y = true;
			}
		} else {
			shift_x = false;
			shift_y = false;
			x_function(x_pct);
			y_function(y_pct);
		}

		updateKnobs();
	}
	prev_x_pos = e.screenX;
	prev_y_pos = e.screenY;

}

function Wave(label, wave_list, frequency) {
	this.label = label;
	this.wave_list = wave_list;
	this.frequency = frequency;
	this.wave_function = triangle
	this.current_idx = 0; //Used for applying the pseudo frequency
	this.phase = 0;

	this.step = function(mod, mod_amt) {
		// updates the current "starting position"
		m = Math.floor(negPosInt(mod) * mod_amt)
		this.current_idx = (this.current_idx + this.frequency + m)%this.wave_list.length
		if (isNaN(this.current_idx)) throw "Parameter is not a number!";
	}

	this.getVal = function(index) {
		j = (this.current_idx + index)%this.wave_list.length
		return this.wave_list[j];
	}
}

function Channel(color_str, wave, weight) {
	this.label = color_str; // name/color
	this.wave = wave; // base Wave
	this.weight = weight; // strength of channel
	this.mod = mod_1; // source channel/wave for modulation
	this.phase_mod_amt = 0; // amt to mod phase
	this.freq_mod_amt = 0; // amt to mod frequency
	// Mod Destinations:
	// - frequency of wave
	// - phase of wave
	// - weight of wave
	this.mod_dest = "phase"

	this.getMod = function(index, recursion_depth) {
		// TODO: search for methods of tracking recursion depth...
		// T(n) = O(1) if recursion_depth > MAX_RECURSION
		// T(n) = O(1) if recursion_depth <= MAX_RECURSION && Mod is a simple wave
		// T(n) = O(V(n)) if recursion_depth <= MAX_RECURSION && Mod is another channel who's time is V(n) to get val
		if (recursion_depth > MAX_RECURSION) {
			m = 0; // NOT applying any mod since we've recursed to the max
		}
		else {
			rd = recursion_depth + 1
			m = this.mod.getVal(index, false, rd);
		}
		return m;
	}
	

	this.getVal = function(index, with_weight, recursion_depth) {
		i = index;
		// if Wave mod: O(1)
		// if Channel mod: O(M(n)) where M(n) is time for mod to get val
		if (this.mod_dest == "phase" && this.phase_mod_amt !== 0) {
			m = Math.floor(negPosInt(this.getMod(i, recursion_depth)) * this.phase_mod_amt)
			w = this.wave.getVal(i + m, false)
		}
		else if (this.mod_dest == "weight" && this.phase_mod_amt !== 0) {
			m = this.getMod(index, recursion_depth) * this.phase_mod_amt
			w = this.wave.getVal(i, false) * m
		}
		else {
			w = this.wave.getVal(i, false)
		}

		if (with_weight) {
			return w * this.weight;
		} else {
			return w;
		}
	}

	this.stepAll = function(index) {
		if (this.mod_dest == "frequency") {
			m = this.getMod(index, 0);
		}
		else {
			m = 0.5; // 0.5 means no mod b/c it is halfway between 0 and 1
		}
		
		this.wave.step(m, this.phase_mod_amt)//this.mod.getVal(index, false, 0), this.phase_mod_amt);
		if (this.mod instanceof Wave) {
			this.mod.step(0.5, 0); // currently not modding mods... (.5 means no mod b/c halfway between 0 and 1)
		}
	}
}

var initialize = function() {
	myCanvas = document.getElementById("myCanvas")
	disp_width = $("#myCanvas").parent().width()
	disp_height = disp_width
	window_height = $(window).height();
	KNOB_WIDTH = Math.floor(window_height / 4) - 4 * KNOB_PADDING;
	KNOB_HEIGHT = KNOB_WIDTH;

	myCanvas.width = data_width // disp_width;
	myCanvas.height = data_height // disp_height;
	display_scale = Math.floor(disp_width / data_width)
	ctx = myCanvas.getContext("2d", { alpha: false });
	
	imgData = ctx.createImageData(data_width, data_height);
	displayImage = ctx.createImageData(data_width*display_scale, data_height*display_scale)
	for (var i=0; i<imgData.data.length; i+=4) {
		imgData.data[i] = 255;
		imgData.data[i+1] = 0;
		imgData.data[i+2] = 0;
		imgData.data[i+3] = 255;	
	}

	for (var i=0; i<displayImage.data.length; i+=4) {
		displayImage.data[i] = 0;
		displayImage.data[i+1] = 0;
		displayImage.data[i+2] = 0;
		displayImage.data[i+3] = 255;
	}
	ctx.putImageData(imgData, 0, 0);
	
	// Add some keyboard listeners for selecting a channel
	document.addEventListener('keydown', function(event) {
		draw()
		if (event.code == 'KeyR') {
			current_chn = red_chn
			updateKnobs();
		}
		else if (event.code == 'KeyG') {
			current_chn = grn_chn
			updateKnobs();
		}
		else if (event.code == 'KeyB') {
			current_chn = blu_chn
			updateKnobs();
		}
	});

	document.addEventListener('keyup', function(event) {
		if (event.key == "Shift") {
			shift_x = false;
			shift_y = false;
		}
	})

	//Setup mouse input
	canvasX = myCanvas.getBoundingClientRect().left
	canvasY = myCanvas.getBoundingClientRect().top
	myCanvas.onmousedown = function(e) {
		mouseIsDown = true;
	}

	myCanvas.addEventListener('touchmove', function(e) {
		event.preventDefault();
		var touch = event.touches[0]
		wavePct = posToPercent(touch.clientX - canvasX, disp_width)
		freqPct = posToPercent(touch.clientY - canvasY, disp_width)

		waveLen = Math.floor(max_list_len * wavePct)
		freqVal = Math.floor(freqPct * waveLen)

		updateCurrentWave(waveLen, freqVal)
	}, false)

	myCanvas.onmouseup = function(e) {
		mouseIsDown = false;
	}
	myCanvas.onmousemove = function(e) {
		mouseInputFunc(e);
	}

	// Setup the shape canvas (for viewing and editing 2d waveform)
	shapeCanvas = $('#shapeCanvas')[0];
	shapeCanvas.width = disp_width;
	shapeCanvas.height = 300;
	s_ctx = shapeCanvas.getContext("2d");
	sCanvasX = shapeCanvas.getBoundingClientRect().left
	sCanvasY = shapeCanvas.getBoundingClientRect().top

	shapeCanvas.onmousedown = function(e) {
		sc_mouse_down = true;
	}
	shapeCanvas.onmouseup = function(e) {
		sc_mouse_down = false;
	}
	shapeCanvas.onmousemove = function(e) {
		if (sc_mouse_down) {
			// get mouse x position
			x_pct = posToPercent(e.clientX - sCanvasX, shapeCanvas.width);
			y_pct = posToPercent(e.clientY - sCanvasY, shapeCanvas.height);

			// flip y_pct because we are drawing the graph upside down
			y_pct = 1-y_pct;

			// map x position to index in current wave
			if (current_chn instanceof Wave) {
				w = current_chn
			} else {
				w = current_chn.wave
			}
			edit_idx = Math.floor(w.wave_list.length * x_pct);
			// update the wave
			w.wave_list[edit_idx] = y_pct;
			drawShapeCanvas();
		}
	}
	shapeCanvas.onmouseout = function(e) {
		sc_mouse_down = false;
	}

	// A WHOLE 'LOTTA KNOB INPUTS
	// TODO: Refactor all of this (will not use knobs, and will not be in this file)
	// WAVE LENGTH
	$("#dial-wave").knob({
		'displayInput': false,
		'step': '.2',
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_THICKNESS,
		'change': function(v) {
			updateCurrentLength(v/100)
			x_function = updateCurrentLength
			y_function = updateCurrentFrequency
			updateKnobs(); // required since it may modify frequency
		}
	});

	// FREQUENCY
	$("#dial-frequency").knob({
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_THICKNESS,
		'change': function(v) {
			updateCurrentFrequency(v/100)
			x_function = updateCurrentLength
			y_function = updateCurrentFrequency
		}
	});

	// MOD AMT
	$("#dial-mod-phase").knob({
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_THICKNESS,
		'change': function(v) {
			updateCurrentModAmt(v/100)
			x_function = updateCurrentModAmt
			y_function = updateCurrentWeight
		}
	});

	// CHANNEL WEIGHT
	$("#dial-weight").knob({
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_THICKNESS,
		'change': function(v) {
			updateCurrentWeight(v/100)
			x_function = updateCurrentModAmt
			y_function = updateCurrentWeight
		}
	});

	//SELECT WHAT TO EDIT
	knob_select = $("#dial-select").knob({
		'cursor': 10,
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_CHOICE_THICKNESS,
		'change': function(v) {
			updateCurrentChannel(v/100);
			x_function = updateCurrentChannel
			y_function = updateCurrentShape
		},
		'draw': function() {
			this.g.textAlign="center";
			this.g.textBaseline="middle";
			this.g.font = "bold 20px Arial";
			this.g.fillText(current_chn.label.toUpperCase(), KNOB_WIDTH/2, KNOB_HEIGHT/2)
		}
	});

	//CHANNEL SHAPE
	$("#dial-shape").knob({
		'cursor': 10,
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_CHOICE_THICKNESS,
		'change': function(v) {
			updateCurrentShape(v/100);
			x_function = updateCurrentChannel
			y_function = updateCurrentShape
		},
		'draw': function() {
			this.g.textAlign="center";
			this.g.textBaseline="middle";
			this.g.font = "bold 20px Arial";
			if (current_chn instanceof Wave) {
				f = current_chn.wave_function.name
			} else {
				f = current_chn.wave.wave_function.name
			}
			this.g.fillText(f.toUpperCase(), KNOB_WIDTH/2, KNOB_HEIGHT/2)
		}
	});

	
	//MOD SOURCE
	knob_md_src = $("#dial-md-src").knob({
		'cursor': 10,
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_CHOICE_THICKNESS,
		'change': function(v) {
			updateCurrentModSrc(v/100);
			x_function = updateCurrentModSrc
			y_function = updateCurrentModDest
		},
		'draw': function() {
			if (current_chn instanceof Channel) {
				this.g.textAlign="center";
				this.g.textBaseline="middle";
				this.g.font = "bold 20px Arial";
				this.g.fillText(current_chn.mod.label.toUpperCase(), KNOB_WIDTH/2, KNOB_HEIGHT/2)
			}
		}
	});

	//MOD DESTINATION
	$("#dial-md-dest").knob({
		'cursor': 10,
		'displayInput': false,
		'width': KNOB_WIDTH,
		'height': KNOB_HEIGHT,
		"inputColor": "000000",
		'thickness': KNOB_CHOICE_THICKNESS,
		'change': function(v) {
			updateCurrentModDest(v/100);
			x_function = updateCurrentModSrc
			y_function = updateCurrentModDest
		},
		'draw': function() {
			if (current_chn instanceof Channel) {
				this.g.textAlign="center";
				this.g.textBaseline="middle";
				this.g.font = "bold 20px Arial";
				this.g.fillText(current_chn.mod_dest.toUpperCase(), KNOB_WIDTH/2, KNOB_HEIGHT/2)
			}
		}
	});

	// Refresh/update knobs and shape canvas
	updateKnobs();
	drawShapeCanvas();


	// TESTING CSS SCALING
	var scaleX = 10
	var scaleY = 10

	var scaleToFit = Math.min(scaleX, scaleY);
	var scaleToCover = Math.max(scaleX, scaleY);

	myCanvas.style.transformOrigin = '0 0'; //scale from top left
	myCanvas.style.transform = 'scale(' + scaleToFit + ')';
}

window.onload = initialize;

function updateKnobs() {
	// TODO: refactor all of this, very unorganized...
	// Function for setting the appearance of the knobs according to which Channel we are editing
	if (current_chn instanceof Wave) {
		wav = current_chn
	} else  {
		wav = current_chn.wave
	}

	$('.dial').trigger(
		'configure',
		{
			"fgColor": wave_name_map[current_chn.label]['color']
		}
	);

	c_idx = chn_list.findIndex(x => x.label==current_chn.label)
	$("#dial-select").val(c_idx * (100/chn_list.length)).trigger('change');
	shp_idx = wave_funcs.findIndex(x => x == wav.wave_function)
	$("#dial-shape").val(shp_idx * (100/wave_funcs.length)).trigger('change');
	$("#dial-wave").val(wav.wave_list.length * 100 / max_list_len).trigger('change')
	$("#dial-frequency").val(wav.frequency * 100 / wav.wave_list.length).trigger('change')
	
	// get mod source and destination
	if (current_chn instanceof Channel) {
		// Update mod knobs
		$(".chn-only-container").css('visibility', 'visible');
		$("#dial-mod-phase").val(current_chn.phase_mod_amt).trigger('change')
		$("#dial-weight").val(current_chn.weight * 100).trigger('change')

		s_idx = chn_list.findIndex(x => x.label==current_chn.mod.label)
		$("#dial-md-src").val(s_idx * (100/chn_list.length)).trigger('change');
		d_idx = mod_dests.findIndex(x => x==current_chn.mod_dest)
		$("#dial-md-dest").val(d_idx * (100/mod_dests.length)).trigger('change');
	} else {
		// Hide containers that are only for channels (i.e. the mod stuff)
		$(".chn-only-container").css('visibility', 'hidden');
	}
}

function myMod(n, m) {
	return ((n % m) + m) % m;
}

function posToPercent(position, length) {
	// returns percentage that "position" is of "length"
	if (position > length) {
		return 1
	} else if (position < 0) {
		return 0
	}
	return position / length
}

function negPosInt(x) {
	// takes the range from 0 through 1 and maps it to -1 through 1
	return (x-0.5)/0.5
}

function updateImage() {
	// loop through img data array getting vals from all channels
	for (var i=0; i<imgData.data.length; i++) {		
		basic_unit = [
			red_chn.getVal(i, true, 0) * MAX_RGB_VAL,
			grn_chn.getVal(i, true, 0) * MAX_RGB_VAL,
			blu_chn.getVal(i, true, 0) * MAX_RGB_VAL,
			MAX_RGB_VAL
		]
		imgData.data[i*4] = basic_unit[0]
		imgData.data[i*4+1] = basic_unit[1]
		imgData.data[i*4+2] = basic_unit[2]
		imgData.data[i*4+3] = MAX_RGB_VAL
	}
	// update step after updating the entire image
	red_chn.stepAll(i)
	grn_chn.stepAll(i)
	blu_chn.stepAll(i)
}

// Stuff for timing - to be removed
var total_counting = 0;
var update_total = 0;
var put_total = 0;
var update_avg = 0;
var put_avg = 0;

function draw() {
	total_counting += 1;

	// time update
	start_update = performance.now();
	updateImage();
	update_total += performance.now() - start_update;

	// time putting data
	start_put = performance.now();
	ctx.putImageData(imgData, 0, 0)
	put_total += performance.now() - start_put;

	update_avg = update_total / total_counting;
	put_avg = put_total / total_counting;
}

function drawShapeCanvas() {
	// Draw the 2d waveform in the editor
	if (current_chn instanceof Wave) {
		w = current_chn
	} else {
		w = current_chn.wave
	}
	s_ctx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
	bar_width = shapeCanvas.width / w.wave_list.length;
	console.log(bar_width)
	for (var i=0; i<w.wave_list.length; i++) {
		height = w.wave_list[i] * shapeCanvas.height;
		y = shapeCanvas.height - height;
		s_ctx.fillStyle=wave_name_map[current_chn.label]['color'];
		s_ctx.fillRect(i*bar_width, y, bar_width, height);
	}
}

function saw(length) {
	// create saw shaped array
	var temp_array = new Array(length);
	increment = 1/length
	for (var s=0; s<length; s++) {
		temp_array[s] = s*increment
	}
	return temp_array
}

function triangle(length) {
	// create a triangle shaped array
	if (length%2 != 0) {
		length += 1
	}
	var temp_array = new Array(length);
	half = length/2
	increment = 1/half
	temp_array[0] = 0
	for (var t=1; t<length; t++) {
		temp_array[t] = temp_array[t-1] + increment
		if (t == half) {
			increment = increment * -1;
		}
	}

	return temp_array;
}

function square(length) {
	// create a square shaped array
	var temp_array = new Array(length)
	for (var sq=0; sq<length; sq++) {
		temp_array[sq] = sq<length/2 ? 1 : 0;
	}
	return temp_array;
}

function rand(length) {
	// create an array of random vals
	var temp_array = new Array(length);
	for (var q=0; q<length; q++) {
		temp_array[q] = Math.random();
	}
	return temp_array;
}

function initChannels() {
	// Create our channels and waves
	mod_1 = new Wave("mod 1", saw(10), 1)
	mod_2 = new Wave("mod 2", saw(5), 1)
	red_chn = new Channel("red", new Wave("red", triangle(32), 1), 1)
	grn_chn = new Channel("green", new Wave("green", triangle(56), 2), 1)
	blu_chn = new Channel("blue", new Wave("blue", triangle(58), 56), 1)
}

function demoSimple() {
	// Create our channels and waves
	red_chn.wave = new Wave("red", triangle(32), 1);
	red_chn.weight = 1;
	grn_chn.wave = new Wave("green", triangle(56), 2);
	grn_chn.weight = 1;
	blu_chn.wave = new Wave("blue", triangle(58), 56);
	blu_chn.weight = 1;

	// Update red and grn for mods (to make it interesting)
	red_chn.mod = grn_chn;
	red_chn.mod_dest = "phase";
	red_chn.phase_mod_amt = 5.518;
	grn_chn.mod = blu_chn;
	grn_chn.mod_dest = "phase";
	grn_chn.phase_mod_amt = 8.129;
	blu_chn.phase_mod_amt = 0;
}

function demoEgg() {
	// egg it up boiz
	red_chn.wave = new Wave("red", saw(31), 1);
	red_chn.weight = 1;
	grn_chn.wave = new Wave("green", triangle(30), 1);
	grn_chn.weight = 0;
	blu_chn.wave = new Wave("blue", triangle(58), 57);
	blu_chn.weight = 0;

	// setup modulation
	red_chn.mod = grn_chn;
	red_chn.mod_dest = "phase";
	red_chn.phase_mod_amt = 8.335;
	grn_chn.mod = blu_chn;
	grn_chn.mod_dest = "weight";
	grn_chn.phase_mod_amt = 4.811;
	blu_chn.phase_mod_amt = 0;
}

function demoParallax() {
	red_chn.wave = new Wave("red", saw(20), 0);
	red_chn.weight = 1;
	grn_chn.wave = new Wave("green", saw(30), 29);
	grn_chn.weight = 1;
	blu_chn.wave = new Wave("blue", square(58), 1);
	blu_chn.weight = 1;

	// setup modulation
	red_chn.mod = grn_chn;
	red_chn.mod_dest = "phase";
	red_chn.phase_mod_amt = 5.82;
	grn_chn.mod = blu_chn;
	grn_chn.mod_dest = "phase";
	grn_chn.phase_mod_amt = 7.00;
	blu_chn.mod = red_chn;
	blu_chn.mod_dest = "phase";
	blu_chn.phase_mod_amt = 7.04;

}

setInterval(draw, 60); //need to decide drawing frequency
