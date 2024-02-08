/**
 * LevelManager class
 * 
 * Keeps track of everything level-based.
 */
const LevelManager = (function() {
	function LevelManager() {
			this.current     = null // the current level
			this.levels      = [] // stores registered levels
			this.registeredTiles = {} // stores registered tiles
			this.tileMap     = [] // stores the current tile map
			this.entityTypes = {} // stores entity types
			this.entities    = [] // stores all entities
			this.levelWidth  = 0
			this.levelHeight = 0
			this.camera = new Camera()
	}
	LevelManager.prototype.add = function(options, level) {
			this.levels.push({ options: options, level: level })
	}
	LevelManager.prototype.start = function(levelIndex) {
			if(!this.levels[levelIndex]) {
					throw {
							message: "Invalid level index: " + levelIndex
					}
			}
			this.current = this.levels[levelIndex]
			this.loadLevel()
	}
	LevelManager.prototype.getCollidingTiles = function(entity) {
			const minX = Math.max(Math.floor(entity.x / BLOCK_SIZE), 0)
			const maxX = Math.min(Math.floor((entity.x + entity.w) / BLOCK_SIZE), this.levelWidth - 1)
			const minY = Math.max(Math.floor(entity.y / BLOCK_SIZE), 0)
			const maxY = Math.min(Math.floor((entity.y + entity.h) / BLOCK_SIZE), this.levelHeight - 1)
			
			const tiles = []
			
			for(let x = minX; x <= maxX; x++) {
					for(let y = minY; y <= maxY; y++) {
							const tile = this.tileMap[y][x]
							if(tile === ' ') {
									continue;
							}

							const tileData = {
									x: x * BLOCK_SIZE,
									y: y * BLOCK_SIZE,
									w: BLOCK_SIZE,
									h: BLOCK_SIZE,
									tile: tile
							}

							if(this.registeredTiles[tile].vertices) {
									tileData.vertices = this.registeredTiles[tile].vertices(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
							}
							
							tiles.push(tileData)
					}    
			}
			
			return tiles
	}
	LevelManager.prototype.getCollidingEntities = function(entity, entities) {
			return entities.filter(function(e) {
					return e !== entity && overlap(e, entity)
			})
	}
	LevelManager.prototype.registerTile = function(id, img, vertices) {
			const tile = {}
			if(typeof img === 'function') {
					clear()
					tile.img = img(BLOCK_SIZE, BLOCK_SIZE)
			} else {
					tile.img = img
			}
			if(vertices) {
					tile.vertices = vertices
			}
			this.registeredTiles[id] = tile
	}
	LevelManager.prototype.registerEntity = function(id, spawnCallback) {
			this.entityTypes[id] = spawnCallback
	}
	LevelManager.prototype.loadLevel = function() {
			const level = this.current.level

			this.entities = [] // clear any entities
			this.tileMap  = [] // clear tile map
					
			this.levelWidth  = level[0].length
			this.levelHeight = level.length
			
			for(let i = 0; i < this.levelHeight; i++) {
					this.tileMap[i] = []
					for(let j = 0; j < this.levelWidth; j++) {
							const item = level[i][j]
							this.tileMap[i][j] = ' '
							if(item === ' ') {
									continue;
							}
							const x = j * BLOCK_SIZE
							const y = i * BLOCK_SIZE
							
							// checks for an existing entity type
							if(this.entityTypes[item]) {
									// calls the registered spawn callback
									this.entities.push(this.entityTypes[item](x, y, BLOCK_SIZE, BLOCK_SIZE))
							} else if ( this.registeredTiles[item] ) {
									this.tileMap[i][j] = item // add tile to tilemap
							}
					}
			}
	}
	LevelManager.prototype.displayTileMap = function(viewport) {
			const minX = max(0, Math.floor(viewport.x / BLOCK_SIZE))
			const maxX = min(this.levelWidth - 1, Math.ceil((viewport.x + viewport.w) / BLOCK_SIZE))
			const minY = max(0, Math.floor(viewport.y / BLOCK_SIZE))
			const maxY = min(this.levelHeight - 1, Math.ceil((viewport.y + viewport.h) / BLOCK_SIZE))
			
			for(let i = minX; i <= maxX; i++) {
					for(let j = minY; j <= maxY; j++) {
							const tile = this.tileMap[j][i]
							if(tile === ' ' || ! tile) {
									continue;
							}
							if(this.registeredTiles[tile]) {
									image(this.registeredTiles[tile].img, i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
							}
					}
			}
	}
	LevelManager.prototype.displayEntities = function(viewport) {
			for(let i = 0; i < this.entities.length; i++) {
					const entity = this.entities[i]
					if(overlap(entity, viewport)) {
							entity.display()
					}
			}
	}
	LevelManager.prototype.display = function() {
			push();
			this.camera.applyToWorld()
			this.displayTileMap(this.camera.viewport);
			this.displayEntities(this.camera.viewport);
			pop();
	}
	LevelManager.prototype.update = function() {
			const viewport = this.camera.viewport
			
			// only update entities in update window
			const entitiesToProcess = this.entities.filter(function(e) {
					return overlap(e, viewport)
			})
			
			for(let i = 0; i < entitiesToProcess.length; i++) {
					const entity = entitiesToProcess[i]
					entity.beforeCollision()
					
					// gets all collisions, both tile based and other-entity based
					let collisions = this
							.getCollidingEntities(entity, entitiesToProcess)
							.concat(this.getCollidingTiles(entity))
	
					entity.resolveCollisions(collisions)
					entity.update()
			}
	}
	
	return LevelManager
})();