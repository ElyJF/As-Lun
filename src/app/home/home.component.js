import { Frame, Sprite, Rectangle, Tabs, MotionController, Boundary, ProportionDamp } from 'zimjs';

Js

// here is how we can bring in assets to the canvas - pass these into the Frame()
const assets = ["field.jpg", "butterfly.png"];
const path = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2104200/";

// create a new Frame which makes our stage and pass in the assets
const frame = new Frame("fit", 1024, 768, darker, dark, assets, path);
frame.on("ready", ()=>{ // ES6 Arrow Function - similar to function(){}
    zog("ready from ZIM Frame"); // logs in console (F12 - choose console)

    // often need below - so consider it part of the template
    let stage = frame.stage;
    let stageW = frame.width;
    let stageH = frame.height;

    // REFERENCES for ZIM at http://zimjs.com
    // see http://zimjs.com/learn.html for video and code tutorials
    // see http://zimjs.com/docs.html for documentation
    // see https://www.youtube.com/watch?v=pUjHFptXspM for INTRO to ZIM
    // see https://www.youtube.com/watch?v=v7OT0YrDWiY for INTRO to CODE

    // CODE HERE
		// the field is a bit bigger than the canvas (and made for 1024x768 not 800x600)
		// so we can pan the field as the butterfly moves from one side to the other
		// to start, we scale the field to the stage height (width is null) and center it on the stage
		const field = frame.asset("field.jpg").scaleTo(stage, null, 100).center();

		// BUTTERFLY
		// we make a Sprite of the butterfly
		const butterfly = new Sprite({
			image:frame.asset("butterfly.png"),
			cols:10, rows:4,
			// this spritesheet has transitional animations
			// and different directional loops due to the lighting
			// so frames 0-9 are the loop facing left, etc.
			animations:{left:[0,9], leftright:[30,39], rightleft:[20,29], right:[10,19]}
		})
			.centerReg()
			// make the butterfly go up and down
			.animate({props:{regY:20}, time:1000, loop:true, rewind:true});

		// RUNNING THE SPRITE
		// normally we just run a sprite like so:
		// butterfly.run(500, "left");
		// but we want to run the transition animation if we change directions
		// and we want to wait until the current loop is at its end before we run the transition
		// so this makes it a little tricky ;-)
		// the technique is to use the loopCall to check to see if we want to change
		// newDir is being set in the setDirection function called by the controller "change" event
		// when we call swapDirection it runs the sprite which automatically stops the last running of the sprite
		// Note that we are running an animation series - so two animation objects
		// the second of which loops forever (or until run is called again and stops it)
		// we carefully called the animation series so that the lastDir+newDir will match the desired animation
		// We then make sure that we kickstart the swapDir by calling it

		let lastDir = "left";
		let newDir = "right";
		swapDir();
		function swapDir() {
			butterfly.run({label:[
				{time:400, label:lastDir+newDir},
				{time:500, label:newDir, loop:true, loopCall:function() {
					if (newDir != lastDir) swapDir();
				}}
			]});
			lastDir = newDir;
		}

		function setDirection(e) {
			if (e.dir == "right") newDir = "right";
			if (e.dir == "left") newDir = "left";
		};


		// CONTROLLERS
		// most of the time we will have a single controller
		// this example shows the types of controllers so we will store them in an array
		// and create them in a loop as we loop through the types of controllers
		let controllers = []; // stores the MotionController objects
		const controllerTypes = ["mousedown", "mousemove", "keydown", "gamebutton", "gamestick", "swipe"]
		let activeController; // store the active MotionController

		loop(controllerTypes, function(type, i) {
			// this is what a single controller would look like
			// just put the type you want (see the array above) as the type property value
			// target, type, speed, axis, boundary, map, diagonal, damp, flip, rotate, constant, firstPerson, turnSpeed, 
			// moveThreshold, stickThreshold, container, localBounds, mouseMoveOutside, mousedownIncludes, minPercentSpeed, maxPercentSpeed
			let controller = new MotionController({
				target:butterfly,
				type:type,
				speed:2,
				boundary:new Boundary(butterfly.width/2, butterfly.height/2, stageW-butterfly.width, stageH-butterfly.height),
				mousedownIncludes:field // to press on field if mousedown type
			});
			// set the mousemove controller to the activeController
			// and disable the rest (do not run multiple controllers at the same time)
			if (i==1) {
				activeController = controller;
			} else {
				controller.enabled = false;
			}
			// the setDirection will change the animation loop of the sprite
			controller.on("change", setDirection);
			controllers.push(controller);
		});

		// every once in a while, switch directions of the butterfly if we are not moving in the x
		// we do this by setting the newDir - and then the swapDir function will handle it
		function randomFly() {
			timeout(rand(1000, 8000), randomFly);
			if (!activeController.movingX) newDir = lastDir=="right"?"left":"right";
		}
		randomFly();


		// TABS
		// we set up tabs to switch between the MotionController objects
		// move the tabs down a little on the screen and put a black backing behind
		const topSpace = 20;
		const tabHeight = 40;
		const backing = new Rectangle(stageW, topSpace+tabHeight).addTo(stage);
		const tabs = new Tabs({
			width:stageW,
			height:tabHeight,
			tabs:controllerTypes,
			selectedBackgroundColor:brown,
			rollBackgroundColor:grey,
			backgroundColor:dark,
			selectedColor:dark,
			corner:25,
			inherit:{size:16} // pass along a size to Label
		}).pos(0, topSpace);
		tabs.selectedIndex = 1;

		// when we change we loop through and disable the controllers
		// we set the activeController to the tab's selectedIndex
		// we tell the new activeController to start at where ever the butterfly is
		// and we enable the activeController
		tabs.on("change", function(e) {
			loop(controllers, function(controller){controller.enabled = false;});
			activeController = controllers[tabs.selectedIndex];
			activeController.immediate(butterfly.x, butterfly.y);
			activeController.enabled = true;
		});


		// EXTRA
		// we make the butterfly smaller when it is higher up (farther away)
		// we also slow it down when it is smaller
		// and we shift the field as we move left and right
		// these all use ProportionDamp to map the values with damping for smoothness
		// we set up the objects and then use their convert() method in a Ticker function
		const proportionSize = new ProportionDamp({
			baseMin:0, baseMax:stageH,
			targetMin:.5, targetMax:1
		});
		proportionSize.immediate(butterfly.y);
		const proportionSpeed = new ProportionDamp({
			baseMin:0, baseMax:stageH,
			targetMin:2, targetMax:5
		});
		proportionSpeed.immediate(butterfly.y);
		const proportionField = new ProportionDamp({
			baseMin:0, baseMax:stageW,
			targetMin:0, targetMax:-(field.width-stageW)
		});
		proportionField.immediate(butterfly.x);

		Ticker.add(()=>{
			butterfly.sca(proportionSize.convert(butterfly.y));
			activeController.speed = proportionSpeed.convert(butterfly.y);
			field.x = proportionField.convert(butterfly.x);
		});
		

    stage.update(); // this is needed to show any changes
  
    // DOCS FOR ITEMS USED
		// https://zimjs.com/docs.html?item=Frame
		// https://zimjs.com/docs.html?item=Sprite
		// https://zimjs.com/docs.html?item=Rectangle
		// https://zimjs.com/docs.html?item=Tabs
		// https://zimjs.com/docs.html?item=animate
		// https://zimjs.com/docs.html?item=loop
		// https://zimjs.com/docs.html?item=pos
		// https://zimjs.com/docs.html?item=sca
		// https://zimjs.com/docs.html?item=scaleTo
		// https://zimjs.com/docs.html?item=addTo
		// https://zimjs.com/docs.html?item=centerReg
		// https://zimjs.com/docs.html?item=center
		// https://zimjs.com/docs.html?item=MotionController
		// https://zimjs.com/docs.html?item=loop
		// https://zimjs.com/docs.html?item=timeout
		// https://zimjs.com/docs.html?item=Boundary
		// https://zimjs.com/docs.html?item=ProportionDamp
		// https://zimjs.com/docs.html?item=zog
		// https://zimjs.com/docs.html?item=Ticker

    // FOOTER
    // call remote script to make ZIM Foundation for Creative Coding icon
    createIcon(frame, 780, 600); 

}); // end of ready