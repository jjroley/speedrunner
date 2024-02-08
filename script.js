/**
 * New Program
 * 
 * @author bravo bravo 2024
 */


// constants
const GRAVITY = 0.25;
const BLOCK_SIZE = 30;
const MAX_VIEW = BLOCK_SIZE * 20;

const view = {
	cursorX: 0,
	cursorY: 0,
	scale: 1,
	aspect: 16 / 9
}

/**
 * Game class
 * 
 * Brings everything together, let the magic begin.
 */
const Game = (function () {
	function Game() {
		this.scene = new SceneHandler('menu', this)
		this.level = new LevelManager()
	}
	return Game
})();

let game, keys;

function setup() {
	createCanvas(window.innerWidth, window.innerHeight)
	angleMode(DEGREES)

	handleResize()

	game = new Game() // we got a game, folks
	keys = new KeyManager()

	/**
	 * Register scenes
	 */
	game.scene.add('menu', function () {
		background(0, 255, 0);
	})

	game.scene.add('play', function (state, setState) {
		const player = state.player

		background(17, 86, 120);

		this.level.update()
		this.level.camera.follow(player)
		this.level.display()

	}).on('load', function (state, setState) {
		this.level.start(0)
		const player = this.level.entities.find(function (entity) {
			return entity instanceof Player
		})
		setState({
			player: player
		})
		this.level.camera.center(player)
	})


	/**
	 * Register tile types
	 */
	game.level.registerTile("#", function (w, h) {
		noStroke()
		fill(50);
		rect(0, 0, w, h);
		fill(100);
		rect(w / 8, h / 8, w * 0.75, h * 0.75);
		fill(50)
		ellipse(w * 0.25, h * 0.25, w / 10, h / 10)
		ellipse(w * 0.75, h * 0.25, w / 10, h / 10)
		ellipse(w * 0.75, h * 0.75, w / 10, h / 10)
		ellipse(w * 0.25, h * 0.75, w / 10, h / 10)
		return get(0, 0, w, h);
	})

	const spike = (x, y, w, h, angle) => {
		push()
		translate(x + w / 2, y + h / 2)
		rotate(angle)
		translate(-w / 2, -h / 2)
		noStroke()
		fill(130)
		triangle(w / 2, 0, w, h, w / 2, h)
		fill(180)
		triangle(w / 2, 0, w / 2, h, 0, h)
		fill(50)
		triangle(w / 2, 2, w - 2, h, 2, h)
		fill(100)
		triangle(w / 2, h * 0.65, w * 0.64, h, w * 0.36, h)
		fill(130)
		triangle(w / 2, h * 0.65, w / 2, h, w * 0.36, h)
		fill(35)
		rect(0, h * 0.95, w, h * 0.05)
		const d = w / 10
		for (let i = 0; i < w; i += d) {
			triangle(i, h, i + d / 2, h * 0.9, i + d, h)
		}
		pop()
	}

	const slope = (x, y, w, h) => {
		noStroke()
		fill(50);
		triangle(0, 0, w, h, 0, h)
		fill(100);
		triangle(w / 8, h * 3 / 8, w * 5 / 8, h * 7 / 8, w / 8, h * 7 / 8);
		fill(50)
		ellipse(w * 0.25, h * 0.75, w / 10, h / 10)
	}

	game.level.registerTile('^', function (w, h) {
		spike(0, 0, w, h, 0)
		return get(0, 0, w, h)
	}, function (x, y, w, h) {
		return [
			[x + w / 2, y],
			[x + w, y + h],
			[x, y + h]
		]
	})

	game.level.registerTile('>', function (w, h) {
		spike(0, 0, w, h, 90)
		return get(0, 0, w, h)
	}, function (x, y, w, h) {
		return [
			[x, y],
			[x + w, y + h / 2],
			[x, y + h]
		]
	})

	game.level.registerTile('<', function (w, h) {
		push()
		scale(1, -1)
		translate(0, -h)
		spike(0, 0, w, h, -90)
		pop()
		return get(0, 0, w, h)
	}, function (x, y, w, h) {
		return [
			[x + w, y],
			[x + w, y + h],
			[x, y + h / 2]
		]
	})

	game.level.registerTile('v', function (w, h) {
		spike(0, 0, w, h, 180)
		return get(0, 0, w, h)
	}, function (x, y, w, h) {
		return [
			[x, y],
			[x + w, y],
			[x + w / 2, y + h]
		]
	})

	game.level.registerEntity("@", function (x, y, w, h) {
		return new Player(x + 2, y + 2, w - 4, h - 4)
	})

	game.level.registerTile('R', function (w, h) {
		slope(0, 0, w, h)
		return get(0, 0, w, h)
	})

	game.level.registerTile('L', function (w, h) {
		push()
		translate(w, 0)
		scale(-1, 1)
		slope(0, 0, w, h)
		pop()
		return get(0, 0, w, h)
	})

	game.level.registerTile('l', function (w, h) {
		push()
		translate(w, h)
		scale(-1, -1)
		slope(0, 0, w, h)
		pop()
		return get(0, 0, w, h)
	})

	game.level.registerTile('r', function (w, h) {
		push()
		translate(0, h)
		scale(1, -1)
		slope(0, 0, w, h)
		pop()
		return get(0, 0, w, h)
	})

	/**
	 * Register key code/command mapping
	 */
	keys.register('jump', 'Jump', 87)
	keys.register('right', 'Move right', 68)
	keys.register('left', 'Move left', 65)
	keys.register('sprint', 'Sprint', 16)
	keys.register('ground_pound', 'Ground pound', 83)

	/**
	 * Create levels
	 */
	game.level.add(
		{
			title: "First level"
		},
		[
			"##############",
			"#r           #",
			"#@      L#> <#",
			"#####R  ##> <#",
			'##########> <#',
			"#     l##v   #",
			"#      ##    #",
			"###    ##    #",
			"####         #",
			"#####   ^    #",
			"##### # #    #",
			"##### # #    #",
			"####         #",
			"##        ####",
			"###   ########",
			"##############"
		]
	)

	game.scene.change('play')

	game.level.camera.viewport.w = width / view.scale
	game.level.camera.viewport.h = height / view.scale
}

// PJS functions
function draw() {
	background(0)
	push()
	scale(view.scale)
	try {
		game.scene.update()
	} catch (e) {
		console.log(e)
	}
	fill(255);
	pop()

	keys.update()
}

function keyPressed() {
	keys.keyPressed(keyCode)
}
function keyReleased() {
	keys.keyReleased(keyCode)
}

function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight)

	handleResize()

	game.level.camera.viewport.w = width / view.scale
	game.level.camera.viewport.h = height / view.scale
}
