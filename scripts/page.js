/* ------------------------ GLOBAL HELPER VARAIBLES ------------------------ */
// Difficulty Helpers
let astProjectileSpeed = 0.5;            // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
const AST_OBJECT_REFRESH_RATE = 15;
const maxPersonPosX = 1218;
const maxPersonPosY = 658;
const PERSON_SPEED = 5;                // #pixels each time player moves by
const portalOccurrence = 15000;        // portal spawns every 15 seconds
const portalGone = 5000;               // portal disappears in 5 seconds
const shieldOccurrence = 10000;        // shield spawns every 10 seconds
const shieldGone = 5000;               // shield disappears in 5 seconds

// Movement Helpers
let LEFT = false;
let RIGHT = false;
let UP = false;
let DOWN = false;

// Global Helpers
var shielded = false;
var SkipHTP = false;
var touched = 0;
var vol = 50;
var score_num = 0;
var level_num = 1;
var danger_num = 20;
let astSpawnRate = 800;

/* --------------------------------- MAIN ---------------------------------- */
$(document).ready(function () {
    // jQuery selectors
    game_window = $('.game-window');
    game_screen = $("#actual-game");
    asteroid_section = $('.asteroidSection');
    // hide all other pages initially except landing page
    game_screen.hide();

    landingPage = $("#landing-page");
    settingsPage = $("#settings-page");
    tutorialPage = $("#tutorial-page");
    actualPage = $("#actual-page");
    getReadyPage = $("#get-ready");
    gameOverPage = $("game-over-panel");
});

/* ---------------------------- EVENT HANDLERS ----------------------------- */
// Keydown event handler
document.onkeydown = function (e) {
    if (e.key == 'ArrowLeft') LEFT = true;
    if (e.key == 'ArrowRight') RIGHT = true;
    if (e.key == 'ArrowUp') UP = true;
    if (e.key == 'ArrowDown') DOWN = true;
}

// Keyup event handler
document.onkeyup = function (e) {
    if (e.key == 'ArrowLeft') LEFT = false;
    if (e.key == 'ArrowRight') RIGHT = false;
    if (e.key == 'ArrowUp') UP = false;
    if (e.key == 'ArrowDown') DOWN = false;
}

$("#playGameButton").click(showTutorial);
function showTutorial() {
    updateSettings();
    gameSetting();
    if (!SkipHTP) {
        tutorialPage.show();
    }
    else {
        tutorialPage.hide();
        startGame();
    }
}

$("#settingsButton").click(showSettings);
function showSettings() {
    updateSettings();
    settingsPage.show();
}
 
$("#closeButton").click(showMainMenu);
function showMainMenu() {
    updateSettings();
    $(".page").hide();
    landingPage.show();
}

function updateSettings() {
    currentSettings.volume = $('#myRange').val();
    currentSettings.difficulty = $(".difficulty-button.selected").text();
}
 
function selectDifficulty(button) {
    $(".difficulty-button").removeClass("selected");
    $(button).addClass("selected");
}
 
let currentSettings = {
    volume: 50,
    difficulty: "Normal",
}

$("#volumeSlider").on("input", function () {
    $("#volumeValue").text($(this).val());
});
  
$("#difficulty-container .difficulty-button").click(function () {
    selectDifficulty(this);
});

function startGame() {
    document.getElementById('get-ready').style.zIndex = 12;
    document.getElementById('score-panel').style.zIndex = 12;
    $("#tutorial-page").hide();
    $("#landing-page").hide();
    $("#actual-game").show();
    gameSetting();
    setTimeout(function () {
        gameInProgress();
    }, 3000);
}

function playPickUpSound() {
    document.getElementById('pickup').volume = currentSettings.volume / 100;
    console.log(document.getElementById('pickup').volume);
    document.getElementById('pickup').play();
}

function playGameOverSound() {
    document.getElementById('gameover').volume = currentSettings.volume / 100;
    console.log(vol);
    console.log(document.getElementById('gameover').volume);
    document.getElementById('gameover').play();
}

function spawnShields() {
    var shieldX = Math.floor(getRandomNumber(0, maxPersonPosX)) + 'px';
    var shieldY = Math.floor(getRandomNumber(0, maxPersonPosY)) + 'px';
    var shield = document.createElement('img');
    shield.id = "shieldimg";
    shield.src = "source/shield.gif";
    shield.style.height = "60px";
    shield.style.width = "60px";
    shield.style.position = "absolute";
    shield.style.left = shieldX;
    shield.style.top = shieldY;
    document.getElementById('actual-game').appendChild(shield);
    setTimeout('removeElement(document.getElementById("shieldimg"))', 5000);
}

function spawnPortals() {
    var portX = Math.floor(getRandomNumber(0, maxPersonPosX)) + 'px';
    var portY = Math.floor(getRandomNumber(0, maxPersonPosY)) + 'px';
    var portal = document.createElement('img');
    portal.id = "portalimg";
    portal.src = "source/portal.gif";
    portal.style.height = "60px";
    portal.style.width = "60px";
    portal.style.position = "absolute";
    portal.style.left = portX;
    portal.style.top = portY;
    document.getElementById('actual-game').appendChild(portal);
    setTimeout('removeElement(document.getElementById("portalimg"))', 5000);
}

function removeElement(x) {
    x.parentNode.removeChild(x);
}

function updateScore() {
    score_num += 20;
    document.getElementById('score-num').innerHTML = score_num;
}

function gameSetting() {
    if (currentSettings.difficulty == "Easy") {
        astProjectileSpeed *= 1;
        astSpawnRate = 1000;
        danger_num = 10;
    }
    if (currentSettings.difficulty == "Normal") {
        astProjectileSpeed *= 3;
        astSpawnRate = 800;
        danger_num = 20;
    }
    if (currentSettings.difficulty == "Hard") {
        astProjectileSpeed *= 5;
        astSpawnRate = 600;
        danger_num = 30;
    }
    document.getElementById('danger-num').innerHTML = danger_num;
    document.getElementById('level-num').innerHTML = level_num;
}

function pressArrowKey(event) {
    switch (event.which) {
        case 37:
            LEFT = true;
            movePlayer(event.which);
            console.log("Left");
            break;
        case 38:
            UP = true;
            movePlayer(event.which);
            console.log("Up");
            break;
        case 39:
            RIGHT = true;
            movePlayer(event.which);
            console.log("Right");
            break;
        case 40:
            DOWN = true;
            movePlayer(event.which);
            console.log("Down");
            break;
    }
}

function movePlayer() {
    if (LEFT) {
        var newPosition = parseInt($('#player').css('left')) - PERSON_SPEED;
        if (newPosition < 0) {
            newPosition = 0;
        }
        $('#player').css('left', newPosition);
        if (shielded) {
            $('#player').attr("src", "source/rocket/rocket-left-shield.gif");
        }
        else {
            $('#player').attr("src", "source/rocket/rocket-left.gif");
        }
    }
    if (UP) {
        var newPosition = parseInt($('#player').css('top')) - PERSON_SPEED;
        if (newPosition < 0) {
            newPosition = 0;
        }
        $('#player').css('top', newPosition);
        if (shielded) {
            $('#player').attr("src", "source/rocket/rocket-up-shield.gif");
        }
        else {
            $('#player').attr("src", "source/rocket/rocket-up.gif");
        }
    }
    if (RIGHT) {
        var newPosition = parseInt($('#player').css('left')) + PERSON_SPEED;
        if (newPosition > maxPersonPosX) {
            newPosition = maxPersonPosX;
        }
        $('#player').css('left', newPosition);
        if (shielded) {
            $('#player').attr("src", "source/rocket/rocket-right-shield.gif");
        }
        else {
            $('#player').attr("src", "source/rocket/rocket-right.gif");
        }
    }
    if (DOWN) {
        var newPosition = parseInt($('#player').css('top')) + PERSON_SPEED;
        if (newPosition > maxPersonPosY) {
            newPosition = maxPersonPosY;
        }
        $('#player').css('top', newPosition);
        if (shielded) {
            $('#player').attr("src", "source/rocket/rocket-down-shield.gif");
        }
        else {
            $('#player').attr("src", "source/rocket/rocket-down.gif");
        }
    }
    var shieldExists = document.getElementById("shieldimg");
    var portalExists = document.getElementById("portalimg");
    if (shieldExists != null) {
        if (isColliding($('#player'), $('#shieldimg'))) {
            console.log('Shield');
            removeElement(document.getElementById("shieldimg"))
            shielded = true;
            playPickUpSound();
        }
    }
    if (portalExists != null) {
        if (isColliding($('#player'), $('#portalimg'))) {
            console.log('Portal');
            removeElement(document.getElementById("portalimg"))
            level_num++;
            danger_num += 2;
            astProjectileSpeed *= 1.5;
            document.getElementById('danger-num').innerHTML = danger_num;
            document.getElementById('level-num').innerHTML = level_num;
            playPickUpSound();
        }
    }
}

function gameInProgress() {
    $(window).keydown(pressArrowKey);
    document.getElementById('actual-game').style.zIndex = 5;
    document.getElementById('get-ready').style.zIndex = -1;
    var t = setInterval(spawn, astSpawnRate);
    var s = setInterval(spawnShields, 15000);
    var p = setInterval(spawnPortals, 10000);
    var score = setInterval(updateScore, 500);
    
    function collide_check() {
        const actasteroids = document.querySelectorAll("div[id^='a-']");
        if (!shielded) {
            for (i = 0; i < actasteroids.length; ++i) {
                if (isColliding($('#player'), $(actasteroids[i]))) {
                    touched = 1;
                    if (touched == 1) {
                        astProjectileSpeed = 0o0;
                        $('#player').attr('src', 'source/rocket/rocket-game-over.gif');
                        playGameOverSound();
                        $(window).off();
                        clearInterval(t);
                        clearInterval(s);
                        clearInterval(p);
                        clearInterval(score);
                        touched++;
                        setTimeout(function () {
                            gameOver();
                        }, 2000);
                    }
                    if (touched == 2) {
                        clearInterval(a);
                    }
                }
            }
        }
        else {
            for (i = 0; i < actasteroids.length; ++i) {
                if (isColliding($('#player'), $(actasteroids[i]))) {
                    shielded = false;
                    var temp = actasteroids[i].id;
                    removeElement(document.getElementById(temp))
                }
            }
        }
    }
    var a = setInterval(collide_check, 10)
}

function gameOver() {
    $("#actual-game").hide();
    $("#landing-page").show();
    $("#game-over-panel").show();
    document.getElementById('finalScore').innerHTML = score_num;
    document.getElementById('player').style.left = '600px';
    document.getElementById('player').style.top = '300px';
    document.getElementById('score-num').innerHTML = 0;
    document.getElementById('level-num').innerHTML = 1;
    const actasteroids2 = document.querySelectorAll("div[id^='a-']");
    for (i = 0; i < actasteroids2.length; ++i) {
        var temp = actasteroids2[i].id;
        removeElement(document.getElementById(temp));
    }
}

$("#startOver").click(gameRestart);
function gameRestart() {
    $("#game-over-panel").hide();
    astProjectileSpeed = 0.5;
    score_num = 0;
    level_num = 0;
    $('#player').attr('src', 'source/rocket/rocket.gif');
    SkipHTP = true;
}

/* ---------------------------- GAME FUNCTIONS ----------------------------- */
// Starter Code for randomly generating and moving an asteroid on screen
class Asteroid {
    // constructs an Asteroid object
    constructor() {
        /*------------------------Public Member Variables------------------------*/
        // create a new Asteroid div and append it to DOM so it can be modified later
        let objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAsteroid' > <img src = 'source/stone.png'/></div>";
        asteroid_section.append(objectString);
        // select id of this Asteroid
        this.id = $('#a-' + currentAsteroid);
        currentAsteroid++; // ensure each Asteroid has its own id
        // current x, y position of this Asteroid
        this.cur_x = 0; // number of pixels from right
        this.cur_y = 0; // number of pixels from top
        
        /*------------------------Private Member Variables------------------------*/
        // member variables for how to move the Asteroid
        this.x_dest = 0;
        this.y_dest = 0;
        // member variables indicating when the Asteroid has reached the boarder
        this.hide_axis = 'x';
        this.hide_after = 0;
        this.sign_of_switch = 'neg';
        // spawn an Asteroid at a random location on a random side of the board
        this.#spawnAsteroid();
    }

    // Requires: called by the user
    // Modifies:
    // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
    //          return false otherwise
    hasReachedEnd() {
        if (this.hide_axis == 'x') {
            if (this.sign_of_switch == 'pos') {
                if (this.cur_x > this.hide_after) {
                    return true;
                }
            }
            else {
                if (this.cur_x < this.hide_after) {
                    return true;
                }
            }
        }
        else {
            if (this.sign_of_switch == 'pos') {
                if (this.cur_y > this.hide_after) {
                    return true;
                }
            }
            else {
                if (this.cur_y < this.hide_after) {
                    return true;
                }
            }
        }
        return false;
    }

    // Requires: called by the user
    // Modifies: cur_y, cur_x
    // Effects: move this Asteroid 1 unit in its designated direction
    updatePosition() {
        // ensures all asteroids travel at current level's speed
        this.cur_y += this.y_dest * astProjectileSpeed;
        this.cur_x += this.x_dest * astProjectileSpeed;
        // update asteroid's css position
        this.id.css('top', this.cur_y);
        this.id.css('right', this.cur_x);
    }
    
    // Requires: this method should ONLY be called by the constructor
    // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
    // Effects: randomly determines an appropriate starting/ending location for this Asteroid
    //          all asteroids travel at the same speed
    #spawnAsteroid() {
        // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
        let x = getRandomNumber(0, 1280);
        let y = getRandomNumber(0, 720);
        let floor = 784;
        let ceiling = -64;
        let left = 1344;
        let right = -64;
        let major_axis = Math.floor(getRandomNumber(0, 2));
        let minor_aix = Math.floor(getRandomNumber(0, 2));
        let num_ticks;
        
        if (major_axis == 0 && minor_aix == 0) {
            this.cur_y = floor;
            this.cur_x = x;
            let bottomOfScreen = game_screen.height();
            num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;
            
            this.x_dest = (game_screen.width() - x);
            this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
            this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
            this.hide_axis = 'y';
            this.hide_after = -64;
            this.sign_of_switch = 'neg';
        }
        if (major_axis == 0 && minor_aix == 1) {
            this.cur_y = ceiling;
            this.cur_x = x;
            let bottomOfScreen = game_screen.height();
            num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;
            this.x_dest = (game_screen.width() - x);
            this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
            this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
            this.hide_axis = 'y';
            this.hide_after = 784;
            this.sign_of_switch = 'pos';
        }
        if (major_axis == 1 && minor_aix == 0) {
            this.cur_y = y;
            this.cur_x = left;
            let bottomOfScreen = game_screen.width();
            num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;
            this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
            this.y_dest = (game_screen.height() - y);
            this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
            this.hide_axis = 'x';
            this.hide_after = -64;
            this.sign_of_switch = 'neg';
        }
        if (major_axis == 1 && minor_aix == 1) {
            this.cur_y = y;
            this.cur_x = right;
            let bottomOfScreen = game_screen.width();
            num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;
            this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
            this.y_dest = (game_screen.height() - y);
            this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
            this.hide_axis = 'x';
            this.hide_after = 1344;
            this.sign_of_switch = 'pos';
        }
        // show this Asteroid's initial position on screen
        this.id.css("top", this.cur_y);
        this.id.css("right", this.cur_x);
        // normalize the speed s.t. all Asteroids travel at the same speed
        let speed = Math.sqrt((this.x_dest) * (this.x_dest) + (this.y_dest) * (this.y_dest));
        this.x_dest = this.x_dest / speed;
        this.y_dest = this.y_dest / speed;
    }
}

// Spawns an asteroid travelling from one border to another
function spawn() {
    let asteroid = new Asteroid();
    setTimeout(spawn_helper(asteroid), 0);
}

function spawn_helper(asteroid) {
    let astermovement = setInterval(function () {
        // update Asteroid position on screen
        asteroid.updatePosition();
        // determine whether Asteroid has reached its end position
        if (asteroid.hasReachedEnd()) { // i.e. outside the game boarder
            asteroid.id.remove();
            clearInterval(astermovement);
        }
    }, AST_OBJECT_REFRESH_RATE);
}

/* --------------------- Additional Utility Functions  --------------------- */
// Are two elements currently colliding?
function isColliding(o1, o2) {
    return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
    return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
    const o1D = {
        'left': o1.offset().left + o1_xChange,
        'right': o1.offset().left + o1.width() + o1_xChange,
        'top': o1.offset().top + o1_yChange,
        'bottom': o1.offset().top + o1.height() + o1_yChange
    };
    const o2D = {
        'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
    };
    // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    if (o1D.left < o2D.right && o1D.right > o2D.left &&
        o1D.top < o2D.bottom && o1D.bottom > o2D.top) {
        // collision detected!
        return true;
    }
    return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
    return (Math.random() * (max - min)) + min;
}
