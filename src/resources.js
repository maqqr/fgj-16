
const ASSET_PATH = "assets"
const TEXTURES = {
    player: "player.png",
    background: "saari.jpeg",
    logo: "logo.png",
    clockborder: "clockborder.png",
    clock: "clock.png",
    banana: "bananas.png",
    rock: "rock.png",
    wood: "wood.png"
}

export default (callback) => {
    var resources = {}
    var loadedResourceCount = 0

    // Count resources.
    var resourceCount = 0
    for (var key in TEXTURES)
        resourceCount++

    // Load all resources.
    for (var key in TEXTURES) {
        resources[key] = new Image();
        resources[key].onload = function () {
            console.log("Loaded " + key)
            if (++loadedResourceCount >= resourceCount) {
                callback(resources)
            }
        }
        resources[key].src = ASSET_PATH + "/" + TEXTURES[key];
    }
}
