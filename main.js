/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),
    connect = require("connect"),
    express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    socket = require("socket.io").listen(server),
    MemoryStore = require("connect/lib/middleware/session/memory"),
    sessionStore,
    readline = require("readline");
    fs = require("fs");


/**************************************************
** GAME VARIABLES
**************************************************/
var players,                                // Array of connected players
    balls,                                  // ...and thrown balls
    Player = require("./Player").Player,    // Player class
    Ball = require("./Ball").Ball,          // Ball class
    clients,                                // List of socket.io client objects
    inputs,                                 // A list of queued client inputs
    highscores,                             // List of top ten players
    reservedNames,                          // List of reserved player names
    running;                                // Whether game is running or paused

// Globals
var WIDTH = 800,                            // Game area width
    HEIGHT = 600,                           // Game area height
    RING_RADIUS = 225,
    RING_RADIUS_SQUARED = RING_RADIUS * RING_RADIUS,
    COLLISION_MASK_WIDTH = 30,              // Width of a player's collision detection area / 2
    COOKIE_SECRET = "diawdoice14r1",        // Secret used to sign session cookies
    MAX_PLAYERS = 30;                       // Maximum amount of simultaneous clients

/**************************************************
** SERVER INITIALISATION
**************************************************/
server.listen(8000);

// AARRRGHGH miksei mikään toimi???!?!?!?
// Functions for loading/storing sessions
/*MemoryStore.prototype.getSessions = function() {
    var sessions = this.sessions;
    // MemoryStore stores object values as JSON strings
    for (var session in sessions) {
        sessions[session] = JSON.parse(sessions[session]);
    }
    return sessions;
};

MemoryStore.prototype.setSessions = function(sessions) {
    for (var session in sessions) {
        sessions[session] = JSON.stringify(sessions[session]);
    }
    this.sessions = sessions;
};

sessionStore = new MemoryStore();
*/
app.use(express.static(__dirname + "/public/static"));
/*
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    key: "sid",
    secret: COOKIE_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 1 },  // 1 day
    store: sessionStore
}));
*/
// Game page
app.get("/", function(req, res){
    res.sendfile(__dirname + "/public/index.html");
});

// Highscores page
app.get("/highscores", function(req, res) {
    var row, highscoresStr = "";
    for (var i = 0; i < highscores.length; i++) {
        row = "#" + (i+1) + " " + highscores[i].name + ": " + highscores[i].points;
        highscoresStr += row + "<br>";
    }
    if (highscoresStr) {
        res.send(highscoresStr);
    } else {
        res.send("Ei pelattuja pelejä.");
    }
});

app.get("/help", function(req, res) {
    res.send("Polttopallon ohjeet:<br>WASD tai nuolinäppäimillä liikkuu.<br>Hiiren vasemmalla heittää pallon.<br>Pallo heitetään nopeammin mitä kauemmin hiirtä pidetään pohjassa.");
});

app.get("/resetscore", function(req, res) {
    util.log(JSON.stringify(highscores));
    highscores.length = 0;
    res.send("Done.");
    util.log(JSON.stringify(highscores));
});

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
    // Create empty arrays to store players, balls and client inputs
    players = [], balls = [], inputs = [], clients = {};

    // Read highscores from file
    highscores = JSON.parse(fs.readFileSync("highscores.json", "utf8") || "[]");

    // Configure Socket.IO
    socket.configure(function() {
        // Only use WebSockets
        socket.set("transports", ["websocket"]);

        // Restrict log output
        socket.set("log level", 2);

        // Authorize connection, check for existing session
        socket.set("authorization", function (handshake, callback) {
            // Deny connection if server is full
            if (players.length > MAX_PLAYERS - 1) {
                return callback(null, false);
            }
/*
            // Parse cookies
            var cookies = {};
            decodeURIComponent(handshake.headers.cookie).split(";").forEach(function(cookie) {
                var parts = cookie.split("=");
                cookies[parts[0]] = parts[1];
            });

            // Make session id available to the client object
            var sid = connect.utils.parseSignedCookie(cookies.sid, COOKIE_SECRET);
            sessionStore.get(sid, function(error, session) {
                // Handshake data can be accessed inside onSocketConnection
                handshake.sid  = sid;
                handshake.name = session.name;
                handshake.points = session.points;
            });*/

            return callback(null, true);
        });
    });

    // Start listening for events
    setEventHandlers();

    // Read saved sessions from file
    /*var sessionsString = fs.readFileSync("sessions.json", "utf8");
    var sessions = sessionsString ? JSON.parse(sessionsString) : {};
    sessionStore.setSessions(sessions);
    */
    // Create a list of reserved player names
    util.log("Reserved player names:");
    reservedNames = [];
    /*
    var value, i = 1;
    for (var hs in highscores) {
        if ("name" in hs) {
            reservedNames.push(value.name);
            util.log(i++ + ": " + value.name);
        }
    }*/
    for (var i = highscores.length - 1; i >= 0; i--) {
        var value = highscores[i];
        if ("name" in value) {
            reservedNames.push(value.name);
            util.log(i + ": " + value.name);
        }
    };
    /*
    // Make Windows listen to CTRL + C
    if (process.platform === "win32") {
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on("SIGINT", function() {
            process.emit("SIGINT");
        });
    }
    util.log("Sammuta komennolla CTRL-C");

    // Start listening for server shutdown
    process.on("SIGINT", function () {
        util.log("Writing sessions...");
        var sessions = sessionStore.getSessions();
        fs.writeFileSync("sessions.json", JSON.stringify(sessions));
        util.log("Shutting down...");
        process.exit();
    });
    */
    // Start main game loop
    running = true;
    update();
}


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
    socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);

    // Only allow one player / IP
    var ip = client.handshake.address.address;
    for (var i = 0; i < players.length; i++) {
        if (players[i].client.handshake.address.address == ip) {
            util.log("Same IP error");
            client.disconnect();
            return;
        }
    }

    // Save client
    clients[client.id] = client;

    // Listen for client disconnected
    client.on("disconnect", onClientDisconnect);

    // Listen for new player message
    client.on("new player", onNewPlayer);

    // Listen for new ball message
    client.on("new ball", onNewBall);

    // Listen for move player message
    // client.on("move player", onMovePlayer2);
    client.on("move player", function(data) {
        inputs.push({f: onMovePlayer2, client: client, data: data});
    });

    // Listen for chat messages
    client.on("msg", onMessage);

    // Listen for ping requests
    client.on("ping", onPing);

    /*
    // Parse cookies
    var cookies = {};
    decodeURIComponent(client.handshake.headers.cookie).split(";").forEach(function(cookie) {
        var parts = cookie.split("=");
        cookies[parts[0]] = parts[1];
    });

    // Make session id available to the client object
    var name, points;
    var sid = connect.utils.parseSignedCookie(cookies.sid, COOKIE_SECRET);
    client.sid = sid;
    */
    /*sessionStore.get(sid, function(error, session) {
        if (error) {
            util.log("sessionStore.get error");
            return;
        }
        name = session.name;
        points = session.points;
        util.log("sid:" + sid + " vastaavasti sessionStoresta löytyi " + name + " ja pts: " + points);
        for (var i = players.length - 1; i >= 0; i--) {
            util.log(players[i].getName() + ": " + players[i].getPoints());
        };
        if (name) {
            client.emit("welcome back", {name: name, points: points});
        } else {
            client.emit("ask name");
        }
    });*/

    // If new player, ask for a player name
    // TODO fiksumpi toteutus; onNewPlayer-funktioita ei voida kutsua tässä suoraan,
    // koska sitten sen funktion sisällä this-parametri osoittaa minne sattuu.
    /*
    var sessions = sessionStore.getSessions(),
        session = sessions[sid],
        name = session.name,
        points = session.points;
    util.log("sid:" + sid + " vastaavasti sessionStoresta löytyi " + name + " ja pts: " + points);
    if (name) {
        client.emit("welcome back", {name: name, points: points});
    } else {
        client.emit("ask name");
    }*/
    client.emit("ask name");
}

// Socket client has disconnected
function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    var removePlayer = playerById(this.id);

    // Player not found
    if (!removePlayer) {
        util.log("Player not found: "+this.id);
        return;
    }
    /*
    // Save session data
    var sid = this.sid,
        name = removePlayer.getName(),
        points = removePlayer.getPoints();
    util.log("sid=" + sid + " Saving session data: name=" + name + " points=" +
                points);
    sessionStore.get(sid, function(error, session) {
        session.name = name;
        session.points = points;
        util.log("Saving: " + JSON.stringify(session));
        sessionStore.set(sid, session, function() {
        });
    });
    */
    // Broadcast removed player to connected socket clients
    this.broadcast.emit("remove player", {id: this.id, name: removePlayer.getName()});

    // Remove all disconnecting player's balls
    for (var i = 0; i < balls.length; i++) {
        if (balls[i].playerId === removePlayer.id) {
            balls.splice(i--, 1);
        }
    }

    // Remove player from players array
    players.splice(players.indexOf(removePlayer), 1);

    // Remove client from clients array
    delete clients[this.id];

    // Check if new round needs to be started
    if (players.length > 0) {
        checkGameOver(null);
    }
}

// New player has joined
function onNewPlayer(data) {
    // Determine elimination
    var elim = true; // New players are eliminated by default
    if (players.length === 0) {
        // The first player is not eliminated
        elim = false;
    }

    // Calculate random start position
    var startpos = elim ? randomEliminatorPosition() : randomPlayerPosition();

    /*
    // Restore session data
    var name = data.name,
        points = data.points || 0;
    //if (this.handshake.name) {
    //    util.log("Restoring session data: name=" + name + " points=" + points);
    //} else {
    //    util.log("Session data not found: name=" + name);
    //}
    */
    /*
    if (data.new) {
        util.log("Session data not found: name=" + name);
    } else if (!data.new) {
        util.log("Restoring session data: name="+name+" points="+points);
    }
    */
    // Escape and check player name restrictions
    var name = escape(data.name);
    if (name.length > 16) {
        name = name.substring(0, 15);
    }
    if (name.length < 3) {
        name = name + "-player";
    }
    if (name.toLowerCase() == "palvelin") {
        name = "player";
    }
    
    /*
    // Check for existing players with the same name
    var num = 1;
    while (true) {
        if (name in reservedNames) {
            name += num++;
        } else {
            reservedNames.push(name);
            break;
        }
    }
    */
    /*var points = 0;
    for (var i = highscores.length - 1; i >= 0; i--) {
        if (highscores[i].name == name) {
            points = highscores[i].points;
            util.log("Restoring points: name=" + name + " points=" + points);
            break;
        }
    };*/
    points = 0;
    // Create a new player
    var newPlayer = new Player(startpos.x, startpos.y, 0, name, elim, points);
    newPlayer.id = this.id;

    // Send player info back to the connected player
    this.emit("update", {local: true, x: newPlayer.getX(), y: newPlayer.getY(),
        eliminated: newPlayer.isEliminated(), id: newPlayer.id,
        name: newPlayer.getName(), points: newPlayer.getPoints()});

    // Broadcast new player to connected socket clients
    this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(),
        y: newPlayer.getY(), name: newPlayer.getName(), angle: newPlayer.getAngle(),
        eliminated: newPlayer.isEliminated(), points: newPlayer.getPoints()});


    // Send existing players to the new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(),
            y: existingPlayer.getY(), name: existingPlayer.getName(), angle: existingPlayer.getAngle(),
            eliminated: existingPlayer.isEliminated(), points: existingPlayer.getPoints()});
    }

    // Link client object with player object
    newPlayer.client = this;

    // Add new player to the players array
    players.push(newPlayer);
}

// A new ball has been thrown
function onNewBall(data) {
    // Return if throwing player is inside the ring or game is paused
    if (!playerById(this.id).isEliminated() || !running) {
        return;
    }

    var newBall = new Ball(data.x, data.y, data.angle, data.speed, this.id);

	// Broadcast new ball to all connected socket clients
	socket.sockets.emit("new ball", {x: data.x, y: data.y,
		angle: data.angle, speed: data.speed});

    // Add new ball to the balls array
    balls.push(newBall);
}

// Player has moved - make changes in server game state, don't broadcast yet
function onMovePlayer2(client, data) {
    // Find player in array
    var movePlayer = playerById(client.id);

    // Player not found
    if (!movePlayer) {
        util.log("Player not found: "+client.id);
        return;
    }

    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);

    // Restrict player movement
    restrictPlayerMovement(movePlayer);

    // Update player angle
    movePlayer.setAngle(data.angle);
}

// Client sent a ping request
function onPing() {
    this.emit("ping");
}

// Client sent a chat message
function onMessage(data) {
    player = playerById(this.id);
    if (player.checkSpamTimer()) {
        player.resetSpamTimer();
        msg = data.msg.trim().substr(0, 100);
        util.log("Viesti vastaanotettu: " + data.msg);
        this.broadcast.emit("msg", data);
    }
}

/**************************************************
** MAIN GAME LOOP
**************************************************/
var delta, deltaDate = new Date();
function update() {
    // Calculate delta time
    var now = new Date();
    delta = ((now - deltaDate) / 1000) * 60;
    delta = Math.round(delta * 1000) / 1000;
    deltaDate = now;

    // Process inputs waiting in the input queue
    for (var i = 0; i < inputs.length; i++) {
        var func = inputs[i].f;
        func(inputs[i].client, inputs[i].data);
    }
    inputs = inputs.splice(i);

    // Broadcast player movements to clients
    var player, client;
    for (i = 0; i < players.length; i++) {
        player = players[i];
        client = clients[player.id];
        client.broadcast.emit("update", {id: player.id, x: player.getX(),
            y: player.getY(), angle: player.getAngle()});
    }

    // Update the positions of thrown balls
    for (i = 0; i < balls.length; i++) {
        if (!balls[i].update(delta)) {
            // Ball out of screen, remove from list
            balls.splice(i--, 1);
            util.log("Pallo pois ruudusta");
        }
    }

    // Check for collisions
    var ball, ballhit=false, latestEliminatedPlayer;
    for (var k = 0; k < balls.length; k++) {
        ball = balls[k];
        for (var j = 0; j < players.length; j++) {
            player = players[j];
            // Can't get eliminated if you're an eliminator, or by your own ball
            if (player.isEliminated() || player.id == ball.playerId) {
                continue;
            }
            // Hit! - notify players and remove ball
            if (collides(ball.getX(), ball.getY(), player.getX(), player.getY())) {
                balls.splice(k--, 1);

                // Update eliminated and eliminating players' points
                var eliminator = playerById(ball.playerId);
                //updatePoints(player, eliminator);

                //util.log("Eliminator points: " + eliminator.getPoints());
                //util.log("Eliminated points: " + player.getPoints());


                // Notify players
                socket.sockets.emit("hit", {eliminatorId: eliminator.id,
                                            eliminatedId: player.id,
                                            eliminatorPoints: eliminator.getPoints(),
                                            eliminatedPoints: player.getPoints()});

                // The colliding player is eliminated
                eliminatePlayer(player);
                latestEliminatedPlayer = player;
                ballhit = true;
                break;
            }
        }
    }

    if (ballhit) {
        checkGameOver(latestEliminatedPlayer);
    }

    if (running) {
        setTimeout(update, 1000 / 60);
    }
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/

// Update players' points
function updatePoints(eliminated, eliminator) {
    // TODO oikeat pisteet
    util.log( JSON.stringify({id: eliminated.id, id2: eliminator.id}) );
    //eliminated.setPoints(eliminated.getPoints() + 1);

    util.log("Pisteen saanut pelaaja on " + eliminator.getName());
    eliminator.setPoints(eliminator.getPoints() + 1);

    var player;
    for (var i = 0; i < players.length; i++) {
        player = players[i];
        util.log(JSON.stringify({name: player.getName(),
                            points: player.getPoints()}));
    }
}

// Check game over - eliminatedPlayer equals the latest player to be eliminated
function checkGameOver(eliminatedPlayer) {
    // Game can't be over if game is paused...
    if (!running) {
        return;
    }
    // ... or if not all players are eliminated
    for (var i = 0; i < players.length; i++) {
        if (!players[i].isEliminated()) {
            return;
        }
    }

    // Round over - write highscores, pause game update loop, notify clients
    util.log("Round finished");
    writeHighscores(eliminatedPlayer);
    running = false;

    var winnerName = eliminatedPlayer ? eliminatedPlayer.getName() : null;
    socket.sockets.emit("game over", {winner: winnerName});
    setTimeout(function() {
        startNewGame(eliminatedPlayer);
    }, 4000);
}

// Start a new round
function startNewGame(lastSurvivor) {
    var eliminatorId;
    // If no players, return
    if (players.length === 0) {
        return;
    // If there's only 1 player, there won't be any eliminators
    } else if (players.length === 1) {
        eliminatorId = null;
    // Else the eliminator will be the last survivor of last round
    } else {
        eliminatorId = lastSurvivor ? lastSurvivor.id : players[0].id;
    }
    util.log("Starting a new round...");

    // Send new game event to everyone
    socket.sockets.emit("newgame");

    var player, startpos, client;
    for (i = 0; i < players.length; i++) {
        // Reset current player
        player = players[i];
        player.setEliminated(player.id === eliminatorId);
        startpos = player.isEliminated() ? randomEliminatorPosition() : randomPlayerPosition();
        player.setX(startpos.x);
        player.setY(startpos.y);
        client = clients[player.id];
        client.emit("update", {local: true,
                              x: player.getX(),
                              y: player.getY(),
                              eliminated: player.isEliminated()});

        // Send info to other players
        client.broadcast.emit("update", {id: player.id,
                                        x: player.getX(),
                                        y: player.getY(),
                                        eliminated: player.isEliminated()});
    }

    // Restart game update loop
    running = true;
    update();
}

// Eliminates player
function eliminatePlayer(eliminatedPlayer) {
    var newpos = randomEliminatorPosition();
    eliminatedPlayer.setEliminated(true);
    eliminatedPlayer.setX(newpos.x);
    eliminatedPlayer.setY(newpos.y);

    // Notify the eliminated player
    var client = clients[eliminatedPlayer.id];
    client.emit("update", {local: true,
                          x: eliminatedPlayer.getX(),
                          y: eliminatedPlayer.getY(),
                          eliminated: true});

    // Notify other players
    client.broadcast.emit("update", {id: eliminatedPlayer.id,
                                    x: eliminatedPlayer.getX(),
                                    y: eliminatedPlayer.getY(),
                                    eliminated: true});
}

// Generate random point inside the circle
function randomPlayerPosition() {
    var minX = WIDTH / 2 - 100,
        minY = HEIGHT / 2 - 100;
    return {x: minX + parseInt(Math.random() * 200, 10),
            y: minY + parseInt(Math.random() * 200, 10)};
}

// Generate random point outside the circle
function randomEliminatorPosition() {
    return {x: [100, WIDTH-100][Math.floor(Math.random() * 2)],
            y: parseInt(Math.random() * HEIGHT, 10)};
}

// Find player by ID
function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    }

    return false;
}

// Returns true if two given coordinates collide
function collides(x0, y0, x1, y1) {
    if (x0 <= x1 + COLLISION_MASK_WIDTH &&
        x0 >= x1 - COLLISION_MASK_WIDTH &&
        y0 <= y1 + COLLISION_MASK_WIDTH &&
        y0 >= y1 - COLLISION_MASK_WIDTH) {
        return true;
    }
    return false;
}

// Write highscores to local .json file
function writeHighscores(winner) {
    if (!winner) {
        return;
    }
    var hs, addNew=true;
    for (var i = 0; i < highscores.length; i++) {
        hs = highscores[i];
        if (winner.getName() == hs.name) {
            hs.points++;
            util.log("Kasvatettiin pelaajan " + winner.getName() + " pisteet " + hs.points);
            addNew = false;
            break;
        } 
    };
    if (addNew) {
        util.log("Lisättiin uusi highscore: " + winner.getName());
        highscores.push({name: winner.getName(), points: 1});
    }
    /*
    var player, addNew = true;
    for (var i = 0; i < players.length; i++) {
        if (!players[i]) {
            continue;
        }
        player = players[i];

        // Check if player already in highscores
        for (var j = 0; j < highscores.length; j++) {
            if (player.getName() == highscores[j].name) {
                highscores[j].points += player.getPoints();
                addNew = false;
                break;
            }
        }
        // If not, add player to highscores
        if (addNew) {
            highscores.push({name: player.getName(),
                            points: player.getPoints()});
        }
    }
    */
    highscores.sort(function(a,b) { return b.points - a.points; });
    highscores = highscores.splice(0, 100);

    fs.writeFile("highscores.json", JSON.stringify(highscores), function(err) {
        if(err) {
            util.log("Highscores writing error: " + err);
        } else {
            util.log("Writing highscores...");
        }
    });
}

// Player can't leave/enter the circle
function restrictPlayerMovement(player) {
    var relativeX = player.getX() - WIDTH/2;
    var relativeY = player.getY() - HEIGHT/2;
    var over_border = player.isEliminated() ?
                      Math.pow(relativeX, 2) + Math.pow(relativeY, 2) < RING_RADIUS_SQUARED
                    : Math.pow(relativeX, 2) + Math.pow(relativeY, 2) > RING_RADIUS_SQUARED;

    if (over_border) {
        var vectorLength = Math.sqrt(Math.pow(relativeX, 2) + Math.pow(relativeY, 2));
        relativeX = (relativeX / vectorLength) * RING_RADIUS;
        relativeY = (relativeY / vectorLength) * RING_RADIUS;
        player.setX(WIDTH/2 + relativeX);
        player.setY(HEIGHT/2 + relativeY);
    }

    // Prevent player from moving over the level border
    if (player.getX() < 0) player.setX(0);
    if (player.getY() < 0) player.setY(0);
    if (player.getX() > WIDTH) player.setX(WIDTH);
    if (player.getY() > HEIGHT) player.setY(HEIGHT);
}

/**************************************************
** RUN THE GAME
**************************************************/
init();