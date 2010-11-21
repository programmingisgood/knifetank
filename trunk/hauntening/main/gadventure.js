var IMG_PATH, IMG_EXTENSION;
IMG_PATH = "images/"
IMG_EXTENSION = ".png"

//==================================================
// scene object
//==================================================
function scene(name, text, exits, item) {
	var i;

  // name of this scene. used by exit objects to tell us where to go.
  // also used to construct the img src attribute, so get it right!
  this.name = name;
  
  // Text to display
  this.text = text;
 
  // Player exits for this scene.
  this.exits = exits;
   
  // Inventory items found in this room.
  // Automatically picked up upon entrance.
  this.item = item;
  
  // Create an image object for the slide
  if (document.images) {
    this.image = new Image();
  }

  // Flag to tell when load() has already been called
  this.loaded = false;

  //--------------------------------------------------
  this.load = function() {
    // This method loads the image for the scene

    if (!document.images) { return; }

    if (!this.loaded) {
      this.image.src = IMG_PATH + this.name + IMG_EXTENSION;
      this.loaded = true;
    }
  }
}

//==================================================
// world object
//==================================================
function world() {
  // IMAGE element on your HTML page.
  // For example, document.images.MYIMG
  this.image;

  // Current text string to display.
  this.text;
  
  // ID of a DIV element on your HTML page that will contain the text.
  // For example, "img2text"
  // Note: after you set this variable, you should call
  // the update() method to update the display.
  this.textid;
  

  // These are private variables
  this.scenes = new Array();
  this.current = 0;
  
  //--------------------------------------------------
  // Public methods
  //--------------------------------------------------
  this.add_scene = function(scene) {
    // Add a scene to the world.
    // For example:
    // SCENES1.add_scene(new scene("start", "s1.jpg", "T'was a dark and stormy night", exits))
  
    var i = this.scenes.length;
  
    // Prefetch the image if necessary
    if (this.prefetch == -1) {
      scene.load();
    }

    this.scenes[i] = scene;
  }
  
  this.sceneNameToIndex = function(name) {
  	var i;
  	for (i=0; i < this.scenes.length; ++i) {
  		if (this.scenes[i].name == name) {
  			return i;
  		}
  	}
  	return -1;
  }

  //--------------------------------------------------
  this.update = function() {
    // This method updates the current image on the page

    // Make sure the world has been initialized correctly
    if (! this.valid_image()) { return; }
  
    // Call the pre-update hook function if one was specified
    if (typeof this.pre_update_hook == 'function') {
      this.pre_update_hook();
    }

    // Convenience variable for the current slide
    var scene = this.scenes[ this.current ];

    // Determine if the browser supports filters
    var dofilter = false;
    if (this.image &&
        typeof this.image.filters != 'undefined' &&
        typeof this.image.filters[0] != 'undefined') {

      dofilter = true;

    }

    // Load the slide image if necessary
    scene.load();
  
    // Apply the filters for the image transition
    if (dofilter) {

      // If the user has specified a custom filter for this slide,
      // then set it now
      if (scene.filter &&
          this.image.style &&
          this.image.style.filter) {

        this.image.style.filter = scene.filter;

      }
      this.image.filters[0].Apply();
    }

    // Update the image, its map
    this.image.src = scene.image.src;
    this.image.useMap = '#' + scene.name;
    

    // Play the image transition filters
    if (dofilter) {
      this.image.filters[0].Play();
    }

    // Update the text
    this.display_text();

    // Call the post-update hook function if one was specified
    if (typeof this.post_update_hook == 'function') {
      this.post_update_hook();
    }

    // Do we need to pre-fetch images?
    if (this.prefetch > 0) {

      // Pre-fetch the next scene image(s)
      var i, next;
      for ( i=0; i < scene.exits.length; ++i) {
			next = this.sceneNameToIndex(scene.exits[i]);
			if (next != -1) {
				this.scenes[next].load();
			}
      }
    }
  }
  
  this.get_scene = function(name) {
  	return this.scenes[this.sceneNameToIndex(name)];	
  }

  
//--------------------------------------------------
  this.goto_scene = function(name) {
  	var i;
    // This method jumpts to the scene you specify.

	i = this.sceneNameToIndex(name);
    if (i == -1) {
      console.log("bad scene name");
    }
  
    if (i < this.scenes.length && i >= 0) {
      this.current = i;
      this.text = this.scenes[i].text;
    }  
    this.update();
  }
  

//--------------------------------------------------
  this.display_text = function() {
    // Display the text

    // If a text id has been specified,
    // then change the contents of the HTML element
    if (this.textid) {

      r = this.getElementById(this.textid);
      if (!r) { return false; }
      if (typeof r.innerHTML == 'undefined') { return false; }

      // Update the text
      r.innerHTML = this.text;
    }
  }
  
//--------------------------------------------------
  this.save_position = function(cookiename) {
    // Saves our position in a cookie, so when you return to this page,
    // the position won't be lost.
  
    if (!cookiename) {
      cookiename = this.name + '_gworld';
    }
  
    document.cookie = cookiename + '=' + this.current;
  }
  //--------------------------------------------------
  this.restore_position = function(cookiename) {
  // If you previously called save_position(),
  // returns the world to the previous state.
  
    //Get cookie code by Shelley Powers
  
    if (!cookiename) {
      cookiename = this.name + '_gworld';
    }
  
    var search = cookiename + "=";
  
    if (document.cookie.length > 0) {
      offset = document.cookie.indexOf(search);
      // if cookie exists
      if (offset != -1) { 
        offset += search.length;
        // set index of beginning of value
        end = document.cookie.indexOf(";", offset);
        // set index of end of cookie value
        if (end == -1) end = document.cookie.length;
        this.current = parseInt(unescape(document.cookie.substring(offset, end)));
        }
     }
  }

  //--------------------------------------------------
  this.valid_image = function() {
    // Returns 1 if a valid image has been set for the scene
  
    if (!this.image)
    {
      return false;
    }
    else {
      return true;
    }
  }

  //--------------------------------------------------
  this.getElementById = function(element_id) {
    // This method returns the element corresponding to the id

    if (document.getElementById) {
      return document.getElementById(element_id);
    }
    else if (document.all) {
      return document.all[element_id];
    }
    else if (document.layers) {
      return document.layers[element_id];
    } else {
      return undefined;
    }
  }

}
 
// HAAAAAAAAAAAAAAAAAAAAAAACK! 
function statehack() {
	
    this.inventoryid;
    // list of strings representing inventory.
    this.inventory = new Array();

	this.busClicks = 0;
	this.photoalbumClicks = 0;
	this.tvClicks = 0;
	this.ewClicks = 0;
	this.basementClicks = 0;
	this.sadCautionDoorClicks = 0;
	this.cabinetClicks = 0;
	this.sacrificeClicks = 0;
	this.stairClicks = 0;
	this.visitedHouse = 0;
	
	//--------------------------------------------------
  this.addto_inventory = function(item,displaytext) {
  	if (item == null || item == "") return;
  	
  	var i;
  	for (i = 0; i < this.inventory.length; ++i) {
  		if (this.inventory[i] == item) {
  			return;
  		}
  	}
  	this.inventory[i] = item;  	
  	
  	var inv, img;
  	if (this.inventoryid) {
	    inv = document.getElementById(this.inventoryid);
    	img = inv.getElementsByTagName("img");
    	img[i].src= IMG_PATH + item + IMG_EXTENSION;
	   	img[i].alt= displaytext;
    	img[i].title= displaytext;

  	}
  }

	this.has = function(thing) {
		var i;
		for (i=0; i < this.inventory.length; ++i) {
			if (this.inventory[i] == thing) {
				return true;
			}
		}
		return false;
	}
	
	this.updateBus = function() {
		var bus = gworld.get_scene("bus");
		if (this.busClicks == 0) {
			bus.text="\"Wait here kids, I'm off to get some help.\"";
		}
		if (this.busClicks == 1) {
			bus.text="\"I'm going to leave you teenagers here for a few hours without any supervision.\"";
		}
		if (this.busClicks == 2) {
			bus.text="\"Isn't it weird that we all forgot our cellphones today?\"";
		}
		this.busClicks =(this.busClicks+1)%3;
		gworld.goto_scene("bus");
	}
	
	this.checkStairDeath = function() {
		if(this.has("inv_tread")) {
			gworld.goto_scene("upstairs");
			return;
		}
		
		if (this.stairClicks == 0) {
			gworld.text = "Those stairs don't look very safe...";
		}
		else {
			gworld.goto_scene("stairdeath");
		}
	}
	
	this.updateDullKnife = function() {
		if (this.has("inv_knife_dull") || this.has("inv_knife_sharp")) {
			gworld.text ="You plop down in the dusty old chair again. What's this? You find another knife. Oh wait, it's just a toenail clipping.";
			return;
		}
		this.addto_inventory("inv_knife_dull", "A dull knife");
		gworld.text="You sit down in some stranger's chair because 'hey, why not?'.<br>Feeling mild discomfort in your rear, you try to get comfortable. You find a sad old knife wedged deep in a crack.<br><i>You equip DULL KNIFE.</i>";
	}
	
	this.updatePhotoAlbum = function() {
		if (this.has("inv_sad")) {
			gworld.text="There's too much pain in there.";
			return;
		}
		if (this.has("inv_happy")) {
			gworld.text="As you flip through this sad collection of family photos, you are filled with sadness.<br>Luckily you have a tiny bit of A HAPPY in your heart. Now you are just moderately sad.<br><i>You equip A SAD.</i>";
			state.addto_inventory("inv_sad","A sad");
		}
		else {
			if (this.photoalbumClicks == 0) {
			gworld.text = "On one hand you think 'Maybe I should open that book of family photos.'<br>On the other, you think 'Perhaps I should stop snooping around the houses of strangers.'";
			}
			else {
				gworld.goto_scene("photodeath");
			}
		}		
		
		this.photoalbumClicks++;
	}
	
	this.updateTV = function() {
		if (this.tvClicks == 0) {
			gworld.text = "Through the static you hear a reporter saying something about a 'mysterious disappearance.'";
		}
		else if (this.tvClicks == 1) {
			gworld.text = "Through the static you hear another reporter saying something about a 'horrible machine of death.'";

		}
		else if (this.tvClicks == 2) {
			gworld.text = "The reception sucks, but you make out something on the news about kittens.";
		}
		else if (this.tvClicks == 3) {
			gworld.text = "Haven't these people heard of Hulu?";
		}
		
		this.tvClicks = (this.tvClicks+1)%4;	
	}
	
	this.checkBasement = function() {
		if (this.has("inv_key_blue")){
			if (this.basementClicks == 0) {
				gworld.text = "The key fits, but the lock seems reluctant to give. Maybe you should try it again?";
				this.basementClicks++;
			}
			else {
				gworld.goto_scene("basement");
			}
		}
		else {
			gworld.text = "You try to pull the door open, but the lock won't budge.<br>Oh yeah, the lock is blue. That could be useful information.";
		}
	}
	
	this.updateShapener = function() {
		if (this.has("inv_knife_dull")) {
			gworld.text = "You grind the blade of the DULL KNIFE until it is sharp enough to cut through stuff.<br><i>You equip SHARP KNIFE.</i>";
			var i;
			for (i = 0; i < this.inventory.length; ++i) {
  				if (this.inventory[i] == "inv_knife_dull") {
  					this.inventory[i] = "inv_knife_sharp";
  					var inv, img;
				  	if (this.inventoryid) {
					    inv = document.getElementById(this.inventoryid);
				    	img = inv.getElementsByTagName("img");
				    	img[i].src= IMG_PATH + "inv_knife_sharp" + IMG_EXTENSION;
				  	}
				  	break;
  				}
			}
  		}
  		else if (this.has("inv_knife_sharp")){
  			gworld.text = "Your knife is already as sharp as my wit. Razor. Sharp.";
  		}
		else {
			gworld.text = "Plenty of knife sharpeners, but not a knife in sight.";
		}
	}
	
	this.updateCheese = function() {
		if (this.has("inv_knife_dull")) {
			gworld.text = "You fail to cut the cheese. Your DULL KNIFE is too dull.";
		}
		else if (this.has("inv_knife_sharp")){
			this.addto_inventory("inv_happy","A happy");
			gworld.text = "You cut a perfect slice of cheese with the greatest of ease, tossing your savory reward into your mouthhole. It tastes like a warm summer day.<br><i>You equip A HAPPY.</i>";
		}
		else {
			gworld.text = "The cheese looks delicious, but don't have anything to cut it.";
		}
	}
	
	this.mayo = function() {
		this.addto_inventory("inv_key_red","A red key");
		gworld.text = "You shovel several mouthfuls of mayonnaise down your throat, almost choking on a key that someone must have hidden in the jar.<br><i>You equip RED KEY.</i>"
	}
	this.ewgross = function() {
		
		if (this.ewClicks == 0) {
			gworld.text = "Ew, gross!";
		}
		else if (this.ewClicks == 1) {
			gworld.text = "Gag me with a spoon!";
		}
		else if (this.ewClicks == 2) {
			gworld.text = "Bleegh!";
		}
		else if (this.ewClicks == 3) {
			gworld.text = "Really? REALLY?";
		}		
		
		this.ewClicks = (this.ewClicks+1)%4;
		
	}

	this.updateBathtub = function(){
		if (this.has("inv_tread")){
			gworld.text = "Now is not the time for a shower.<br>Well...a quick shower couldn't hurt.<br>Wait, no! This is definitely not the time!";
			return;
		}
		this.addto_inventory("inv_tread","Tank treads");
		var hall = document.getElementById("hallway");
		var i;
		areas = hall.getElementsByTagName('area');
		for (i=0; i < areas.length; ++i) {
			if (areas[i].getAttribute("targetscene") == "bathroom"){
				areas[i].setAttribute("onClick","gworld.goto_scene(\'bathroom2\');gworld.update();");
			}
		}
		gworld.goto_scene("bathroom2");
		gworld.text = "It appears to be all-purpose tank treads. These could come in handy...<br><i>You equip TANK TREADS</i>."

	}
	
	this.updateKidBed = function() {
		if (this.has("inv_knife_small")) {
			gworld.text = "The bed is too small."
		}
		else {
			this.addto_inventory("inv_knife_small","A small knife");
			gworld.text ="You pick up the pillow and begin to fondle it, causing a tiny object to fall out.<br><i>You equip SMALL KNIFE.</i>";
		}
	}
	this.updateBed = function() {
		if (this.has("inv_knife_green")){
			gworld.text = "You can sleep when you're dead.";
		}
		else {
			this.addto_inventory("inv_knife_green","A green knife");
			gworld.text = "As you climb into the bedhole you feel something sharp poking you.<br>To your surprise, you find a green-ish knife under the sheets.<br><i>You equip GREEN-ISH KNIFE.</i>";
		}
	}
	this.updateLeftDrawer = function() {
		if (this.has("inv_knife_yellow")){
			gworld.text = "There's nothing of note in here.";
		}
		else {
			this.addto_inventory("inv_knife_yellow","A yellow knife");
			gworld.text =  "You find a knife hidden under a bible.<br><i>You equip YELLOW KNIFE.</i>";
		}
	}
	this.updateRightDrawer = function() {
		if (this.has("inv_knife_big")){
			gworld.text = "There's nothing of note in here.";
		}
		else {
			this.addto_inventory("inv_knife_big","A big knife");
			gworld.text =  "You find a bible. It was hidden under a very large knife.<br><i>You equip VERY LARGE KNIFE.</i>";
		}
	}
	this.updateClothing = function() {
		if (this.has("inv_key_red")){
			gworld.goto_scene("secretroom");
		}
		else{
			gworld.text = "The wall behind the clothes feels a little flimsy.";
		}
	}
	this.updateDolls = function() {	
		gworld.text = "That's one way to get ahead in life.";
	}

	this.updateRightDoll = function() {
		if (this.has("inv_knife_argyle")){
			gworld.text = "That's one way to get ahead in life.";
		}
		else {
			this.addto_inventory("inv_knife_argyle","An argyle knife");
			gworld.text = "You lift up one a headless doll, revealing an argyle knife.<br><i>You equip ARGYLE KNIFE.</i>"
		}
	}
	this.updateLeftDoll = function() {
		if (this.has("inv_key_blue")){
			gworld.text = "That's one way to get ahead in life.";
		}
		else {
			this.addto_inventory("inv_key_blue","A blue key");
			gworld.text = "You pick up the doll's head and notice its surprising weight.<br>Suddenly, a key falls out from underneath it.<br><i>You equip BLUE KEY.</i>";
		}
	}
	this.updateDoor = function() {
		gworld.text ="You lift up the map and slide your hand underneath.<br>You grab what feels like a door key...but it's just a centipede.";
	}
	this.updateBucket = function() {
		if (this.has("inv_knife_steak")) {
			gworld.text = "This hole is empty.";
		}
		else if (this.has("inv_steak")) {
			this.addto_inventory("inv_knife_steak","A steak knife");
			gworld.text = "You shove your hand back into the bucket and discover a steak knife.<br><i>You equip STEAK KNIFE.</i>" 

		}
		else {
			this.addto_inventory("inv_steak", "A steak");
			gworld.text = "You reach into the bucket and find a cold, wet, drippy piece of meat laying in it. Your mom will be so proud.<br><i>You equip DRIPPY STEAK.</i>"

		}
	}
	this.updateCautionDoor = function() {
		if (this.has("inv_sad") && this.has("inv_steak")){
			gworld.goto_scene("laboratory");
		}
		else if (!this.has("inv_sad") || !this.has("inv_steak")){
			if (this.sadCautionDoorClicks == 0){
				gworld.text = "There's a noise coming from behind the door. It sounds like.. clucking?";
				this.sadCautionDoorClicks++;
			}
			else {
				gworld.goto_scene("chickendeath");
			}
		}
	}
	this.updateBloodyDoor = function() {
		if (this.has("inv_rfid")){
			gworld.goto_scene("sacrifice");
		}
		else {
			gworld.text ="The door appears to be locked, but you don't see a keyhole.";
		}
	}
	this.updateCabinet = function() {
		if (this.has("inv_rfid")){
			if (this.cabinetClicks == 0){
				gworld.text="You see a medical file for patient 'Seymour Butts'.";
			}
			if (this.cabinetClicks == 1){
				gworld.text="You see a medical file for patient 'Oliver Klozoff'.";
			}
			if (this.cabinetClicks == 2) {
				gworld.text="You see a medical file for patient 'Amanda Huggenkiss'.";
			}
			this.cabinetClicks = (this.cabinetClicks+1)%3;
				
		}
		else{
			this.addto_inventory("inv_rfid","An RFID");
			gworld.text="As you search through rows of manilla folders, you discover a radio-controlled door opener.<br><i>You equip RFID CHIP.</i>";
		}
	}
	this.updateComputer = function() {
		gworld.text = "Weird. It looks like somebody had recently searched for 'knife + tank' on this computer.";
	}
	this.updateSheets = function() {
		gworld.text = "This seems like it would be a great place to hide.";
	}
	this.updateSacrifice = function() {
		gworld.text = "As you approach the door you hear someone coming right for you. Quick, hide!";
		this.sacrificeClicks = 1;
	}
	this.updateSheets = function() {
		if (this.sacrificeClicks > 0){
			gworld.goto_scene("sheets");
		}
		else {
			gworld.text = "This seems like it would be a great place to hide.";
		}
	}
	
}