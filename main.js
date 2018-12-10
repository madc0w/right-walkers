const params = {
	walkerCreationProb : {
		value : 0.5,
		input : "walker-create-prob-input",
		factor : 100
	},
	walkerSpeed : {
		value : 0.01,
		input : "walker-speed-input",
		factor : 2000
	},
	walkerRadius : {
		value : 0.06,
		input : "walker-width-input",
		factor : 600
	},
	forceRightProb : {
		value : 0.25,
		input : "right-walkers-ratio-input",
		factor : 100
	},
};

walkers = [];
isRunning = true;
totalNumWalkers = 0;
totalRatioRightWalkers = 0;
itNum = 0;

function onLoad() {
	init();

	intervalId = setInterval(function() {
		if (isRunning) {
			step();
			updateStats();
			paint();
		}
	}, 20);
}

function paint() {
	canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
	canvasCtx.fillStyle = "rgba(200, 200, 0, 0.6)";
	canvasCtx.fillRect(canvas.width / 2 - 6, 0, 4, canvas.height);
	canvasCtx.fillRect(canvas.width / 2 + 2, 0, 4, canvas.height);
	for (var i in walkers) {
		const walker = walkers[i];
		const x = walker.pos.x * canvas.width;
		const y = walker.pos.y * canvas.height;

		canvasCtx.beginPath();
		canvasCtx.arc(x, y, walker.radius * canvas.width, 0, 2 * Math.PI, false);
		canvasCtx.fillStyle = walker.color;
		canvasCtx.fill();

		canvasCtx.beginPath();
		canvasCtx.moveTo(x, y);
		canvasCtx.lineTo(x + (walker.vel.x * canvas.width * 4), y + (walker.vel.y * canvas.height * 4));
		canvasCtx.strokeStyle = "red";
		canvasCtx.stroke();
	}
}

function init() {
	canvas = $("#canvas")[0];
	canvas.height = innerHeight - 40;
	canvasCtx = canvas.getContext("2d");
	//	addWalker(0.5, 1);
	//	addWalker(0.51, 0);


	$("body").keyup(function(e) {
		if (e.key == "Escape") {
			closeWtf();
		}
	});

	for (var key in params) {
		const el = $("#" + params[key].input);
		el.on("input", setValue);
		const value = params[key].value * params[key].factor;
		el.val(value);
	}
}

function updateStats() {
	itNum++;
	totalNumWalkers += walkers.length;
	const meanNumWalkers = (totalNumWalkers / itNum).toFixed(2);
	$("#num-walkers").html(walkers.length);
	$("#mean-num-walkers").html(meanNumWalkers);

	var numRightWalkers = 0;
	for (var i in walkers) {
		const walker = walkers[i];
		if ((walker.pos.x >= 0.5 && walker.vel.y < 0) || (walker.pos.x < 0.5 && walker.vel.y > 0)) {
			numRightWalkers++;
		}
	}

	if (walkers.length > 0) {
		const ratioRightWalkers = 100 * numRightWalkers / walkers.length;
		$("#right-walkers").html(numRightWalkers + " ( " + ratioRightWalkers.toFixed(2) + "% )");
		totalRatioRightWalkers += ratioRightWalkers;
		const meanRatioRightWalkers = totalRatioRightWalkers / itNum;
		$("#mean-right-walkers").html(meanRatioRightWalkers.toFixed(2) + "%");
	} else {
		$("#right-walkers").html(0);
	}

	const expectedRatioRightWalkers = 50 * (1 + params.forceRightProb.value);
	$("#expected-right-walkers").html(expectedRatioRightWalkers.toFixed(2) + "%");

	$("#right-walkers-ratio").html((params.forceRightProb.value * 100).toFixed(0) + "%");
	$("#walker-create-prob").html((params.walkerCreationProb.value * 100).toFixed(0) + "%");
	$("#walker-width").html((params.walkerRadius.value * 2).toFixed(2));
	$("#walker-speed").html((100 * params.walkerSpeed.value).toFixed(1));
}

function step() {
	const toRemove = [];
	for (var i in walkers) {
		const walker = walkers[i];
		if (walker.pos.y > 1 || walker.pos.y < 0) {
			toRemove.push(i);
		}
		walker.pos.x += walker.vel.x;
		walker.pos.y += walker.vel.y;
	}

	for (var i in toRemove) {
		walkers.splice(toRemove[i], 1);
	}

	for (var i in walkers) {
		const walker = walkers[i];
		for (var j in walkers) {
			if (j != i) {
				const walker2 = walkers[j];
				if (Math.sign(walker.vel.y) != Math.sign(walker2.vel.y) && Math.abs(walker.pos.x - walker2.pos.x) < 2 * params.walkerRadius.value) {
					// collision predicted!
					const dx = Math.abs(walker.vel.y - walker2.vel.y) * ((2 * params.walkerRadius.value) - Math.abs(walker.pos.x - walker2.pos.x)) / (walker.pos.y - walker2.pos.y);
					walker.pos.x += dx;
				}
			}
		}
	}

	if (Math.random() < params.walkerCreationProb.value) {
		addWalker();
	}
}


function addWalker(x, y) {
	var yPos;
	if (y || y === 0) {
		yPos = y;
	} else {
		yPos = Math.random() < 0.5 ? 0 : 1;
	}
	var x;
	if (x || x === 0) {
		xPos = x;
	} else {
		xPos = Math.random();
		if (Math.random() < params.forceRightProb.value) {
			xPos = 0.5 * (yPos + xPos);
		}
	}

	walkers.push({
		color : "rgba(0, 0, 255, 0.5)",
		radius : params.walkerRadius.value,
		pos : {
			x : xPos,
			y : yPos
		},
		vel : {
			x : 0,
			y : (yPos == 0 ? 1 : -1) * params.walkerSpeed.value
		}
	});
}

function togglePause() {
	isRunning = !isRunning;
	$("#pause-go-button").html(isRunning ? "Pause" : "Go");
}

function reset() {
	totalNumWalkers = 0;
	totalRatioRightWalkers = 0;
	itNum = 0;
	walkers = [];
}

function wtf() {
	$("#wtf").css("visibility", "visible");
}

function closeWtf() {
	$("#wtf").css("visibility", "hidden");
}

function setValue(event) {
	for (var key in params) {
		if (params[key].input == event.target.id) {
			params[key].value = event.target.value / params[key].factor;
			break;
		}
	}
}
