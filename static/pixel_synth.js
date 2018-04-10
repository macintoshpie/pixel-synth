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

/*
TODO:
figure out a good layout for computer and mobile
make all controls accessible (eg feedback)

*/

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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
			yy.push(ar[i+(c*j)])
		}
	}
	return yy;
}
aScale = crappy(aScale, 5, 4)

var red_syn; 
var grn_syn;
var blu_syn;

var isMobile;

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
var display_scale;
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

var mouseIsDown = false;

var MAX_RGB_VAL = 255;
var KNOB_THICKNESS = "1"
var KNOB_WIDTH = 140
var KNOB_HEIGHT = KNOB_WIDTH

var mod_1 = new Wave("mod 1", saw(10), 1)
var mod_2 = new Wave("mod 2", saw(5), 1)
var red_chn = new Channel("red", new Wave("red", triangle(294), 293), 1)
var grn_chn = new Channel("green", new Wave("green", triangle(200), 10), 1)
var blu_chn = new Channel("blue", new Wave("blue", saw(30), 1), 0)


var current_chn = red_chn;
var modSrcSelect;

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

/// Cool stuff
// weave pattern:
// [0.7521494744354535, 0.4347796215412103, 0.7302891006691259, 0.2128949687500059, 0.06995696939676943, 0.14339837839656688, 0.5855996042781819, 0.10942467418781865, 0.7998073376048322, 0.17136031525777384]
var weave = [0.75, 0, 0.75, 0, 0, 0, 0.75, 0, 0.75, 0]
var lightning = [0.09823295104804686, 0.01498873108676757, 0.1606971882062982, 0.7991849387392078, 0.7755476116559195, 0.6999722361959793, 0.014976423578878073]
var twoD = [[.1, .5, .1], [.5, 1, .5], [.1, .5, .1]]
var manTimes = 100
var man = 0

window.onload = initialize;



function Wave(label, wave_list, frequency) {
	this.label = label;
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
		if (mod < 0) {
			//alert("ALERTTTT")
		}
		//ADD m BELOW TO MODIFY FREQUENCY WITH THE MOD PARAMETER
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
	this.label = color_str;
	this.wave = wave;
	this.weight = weight;
	this.mod = mod_1;//new Wave(saw(10), 1);
	this.phase_mod_amt = 0; // Determines the magnitude of the modulation on the wave
	this.freq_mod_amt = 0;
	// Mod Destinations:
	// - Frequency of wave
	// - phase of wave
	this.mod_dest = "phase"

	this.getMod = function(index, recursion_depth) {
		if (recursion_depth > MAX_RECURSION) {
			m = 0; // NOT applying any mod since we've recursed to the max
		}
		else {
			rd = recursion_depth + 1
			m = this.mod.getVal(i, false, rd);
		}
		return m;
	}
	

	this.getVal = function(index, with_weight, recursion_depth) {
		i = index;

		if (this.mod_dest == "phase") {
			m = Math.floor(negPosInt(this.getMod(i, recursion_depth)) * this.phase_mod_amt)
			w = this.wave.getVal(i + m, false)
		}
		else if (this.mod_dest == "weight") {
			m = this.getMod(index, recursion_depth) * this.phase_mod_amt
			w = this.wave.getVal(i, false) * m
		}
		else {
			w = this.wave.getVal(i, false)
		}
		//w = this.wave.getVal(i + m, false)
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
		if (this.mod_dest == "frequency") {
			m = this.getMod(index, 0)
		}
		else {
			m = 0.5 // 0.5 means no mod b/c it is halfway between 0 and 1
		}
		
		this.wave.step(m, this.phase_mod_amt)//this.mod.getVal(index, false, 0), this.phase_mod_amt);
		if (this.mod instanceof Wave) {
			this.mod.step(0.5, 0); // currently not modding mods... (.5 means no mod b/c halfway between 0 and 1)
		}
	}
}

function initialize() {
	// myCanvas = document.createElement("canvas");
	// document.body.appendChild(myCanvas);


	myCanvas = document.getElementById("myCanvas")
	disp_width = $("#myCanvas").parent().width()
	disp_height = disp_width

	myCanvas.width = disp_width;
	myCanvas.height = disp_height;
	display_scale = Math.floor(disp_width / data_width)
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
		if (current_chn instanceof Wave) {
			w = current_chn
		} else {
				w = current_chn.wave
		}
		w.wave_function = eval(waveSelect.value)
		l = w.wave_list.length
		w.wave_list = w.wave_function(l)
	})

	// Mod source
	modSrcSelect = $("#modSourceSelect")
	modSrcSelect.change(function() {
		if (current_chn instanceof Channel) {
			nmod = this.value
			current_chn.mod = wave_name_map[this.value]["src"]
		}
	})

	// Mod destination
	modDestSelect = $("#modDestinationSelect")
	modDestSelect.change(function() {
		if (current_chn instanceof Channel) {
			ndest = this.value
			current_chn.mod_dest = this.value
		}
	})


	rb = document.getElementById("rb")
	rb.addEventListener('click', function(e) {
		current_chn = red_chn
		waveSelect.value = red_chn.wave.wave_function.name
		updateKnobs();
	})

	gb = document.getElementById("gb")
	gb.addEventListener('click', function(e) {
		current_chn = grn_chn
		waveSelect.value = grn_chn.wave.wave_function.name
		updateKnobs();
	})

	bb = document.getElementById("bb")
	bb.addEventListener('click', function(e) {
		current_chn = blu_chn
		waveSelect.value = blu_chn.wave.wave_function.name
		updateKnobs();
	})

	m1b = $("#m1btn")
	m1b.click(function() {
		console.log("asdf")
		current_chn = mod_1;
		waveSelect.value = mod_1.wave_function.name
		updateKnobs();
	})

	m2b = $("#m2btn")
	m2b.click(function() {
		current_chn = mod_2;
		waveSelect.value = mod_2.wave_function.name
		updateKnobs();
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
			'width': KNOB_WIDTH,
			'height': KNOB_HEIGHT,
			"inputColor": "000000",
			'thickness': KNOB_THICKNESS,
			'change': function(v) {updateCurrentWave(Math.floor(v/100*max_list_len))}
		});
	});

	// FREQUENCY
	$(function() {
		$("#dial-frequency").knob({
			'width': KNOB_WIDTH,
			'height': KNOB_HEIGHT,
			"inputColor": "000000",
			'thickness': KNOB_THICKNESS,
			'change': function(v) {
				if (current_chn instanceof Wave) {
					wl = current_chn.wave_list.length
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
			'width': KNOB_WIDTH,
			'height': KNOB_HEIGHT,
			"inputColor": "000000",
			'thickness': KNOB_THICKNESS,
			'change': function(v) {current_chn.phase_mod_amt=v}
		});
	});

	// CHANNEL WEIGHT
	$(function() {
		$("#dial-weight").knob({
			'width': KNOB_WIDTH,
			'height': KNOB_HEIGHT,
			"inputColor": "000000",
			'thickness': KNOB_THICKNESS,
			'change': function(v) {current_chn.weight=v/100}
		});
	});


	//SETUP SYNTHS
	isMobile = window.mobilecheck()
	if (!isMobile) {
		red_syn = new Tone.Oscillator(440, "square12").toMaster().start();
		grn_syn = new Tone.Oscillator(440, "sine12").toMaster().start();
		blu_syn = new Tone.Oscillator(440, "triangle12").toMaster().start();
	}

	// Set everything properly at first
	updateKnobs()

}

function updateKnobs() {
	if (current_chn instanceof Wave) {
		wav = current_chn
	} else  {
		wav = current_chn.wave
	}
	console.log(wave_name_map[current_chn.label]['color'])
	
	$('.dial').trigger(
		'configure',
		{
			"fgColor": wave_name_map[current_chn.label]['color']
		}
	);
	$("#dial-wave").val(wav.wave_list.length * 100 / max_list_len).trigger('change')
	$("#dial-frequency").val(wav.frequency * 100 / wav.wave_list.length).trigger('change')
	

	// get mod source and destination
	if (current_chn instanceof Channel) {
		// Update mod knobs
		$("#dial-mp-container").css('visibility', 'visible');
		$("#dial-weight-container").css('visibility', 'visible');
		$("#dial-mod-phase").val(current_chn.phase_mod_amt).trigger('change')
		$("#dial-weight").val(current_chn.weight * 100).trigger('change')

		// Update the mod selector
		modSrcSelect.val(current_chn.mod.label)
		modSrcSelect.prop( "disabled", false );
		//$("#modSourceSelect option:contains('" + current_chn.label + "')").attr("disabled","disabled");//.attr('disabled', 'disabled')//removeAttr('disabled');
		$("#modSourceSelect option").each(function() {
			if ($(this)[0].innerText == current_chn.label) {
				$(this).attr("disabled", "disabled")
			} else {
				$(this).removeAttr("disabled")
			}
		})
		modDestSelect.val(current_chn.mod_dest)
		modDestSelect.prop( "disabled", false );
	} else {
		// Update mod knobs
		$("#dial-mp-container").css('visibility', 'hidden');
		$("#dial-weight-container").css('visibility', 'hidden');

		// Update mod selector
		modSrcSelect.val("None")
		modSrcSelect.prop( "disabled", true );
		modDestSelect.val("None")
		modDestSelect.prop( "disabled", true );
	}

	//Update button colors
	// $(".btn").each(function() {
	// 	n = $(this)[0].innerText.toLowerCase()
	// 	if (current_chn.label == n) {
	// 		$(this).css('background-color', wave_name_map[n]['color']);
	// 	}
	// 	else {
	// 		console.log("nope")
	// 	}
	// })
	
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
	if (current_chn instanceof Wave) {
		w = current_chn
	} else {
		w = current_chn.wave
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

	if (!isMobile){
		updateSynths(i)
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

function updateSynths(i) {
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

function square(length) {
	var temp_array = new Array(length)
	for (var sq=0; sq<length; sq++) {
		temp_array[sq] = sq<length/2 ? 1 : 0;
	}
	return temp_array;
}

function rand(length) {
	r = [];
	for (var q=0; q<length; q++) {
		r.push(Math.random());
	}
	return r;
}

setInterval(draw, 60); //need to decide drawing frequency
