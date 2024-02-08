/**
 * Entity class
 * 
 * Base class for a single physics-bound entity.
 */

class Entity {
	constructor(x, y, w, h) {
		this.x = x || 0
		this.y = y || 0
		this.w = w || BLOCK_SIZE
		this.h = h || BLOCK_SIZE

		this.xVel = 0.2
		this.yVel = 0
		this.prevXVel = this.xVel
		this.prevYVel = this.yVel

		this.prevX = this.x
		this.prevY = this.y

		this.collisions = {}

		this.groundObject = null
		this.friction = 1
	}

	beforeCollision() {
		this.yVel += GRAVITY

		// unset collisions
		this.collisions.top = false
		this.collisions.right = false
		this.collisions.left = false
		this.collisions.bottom = false
		this.groundObject = null

		this.prevXVel = this.xVel
		this.prevYVel = this.yVel
		this.prevX = this.x
		this.prevY = this.y
		this.x += this.xVel
		this.y += this.yVel
	}

	update() {
		// if on moving object, apply frictional force
		if (this.groundObject) {
			if (this.groundObject.xVel !== undefined) {
				this.xVel += (this.groundObject.xVel - this.xVel) * this.groundObject.friction
			}
		}
	}

	resolveComplexCollision(obj) {
		const vertices = obj.vertices

		const vec = getCollisionResolutionVector(this, vertices)

		if (vec) {
			this.xVel += vec.x
			this.yVel += vec.y
		}
	}

	resolveYCollision(obj) {
		this.yVel = 0
		this.collisions.top = this.prevYVel < 0
		this.collisions.bottom = this.prevYVel >= 0
		this.y = this.prevYVel >= 0 ? obj.y - this.h : obj.y + obj.h

		if (this.prevYVel >= 0) {
			this.groundObject = obj
		}
	}

	resolveXCollision(obj) {
		this.xVel = 0
		this.collisions.right = this.prevXVel > 0
		this.collisions.left = this.prevXVel < 0
		if (this.prevXVel !== 0) {
			this.x = this.prevXVel > 0 ? obj.x - this.w : obj.x + obj.w
		}
	}

	resolveCollisions(collidingObjects) {
		// sort collisions by overlap area this is a hacky(ish)
		// way to make collision resolutions are less wacky
		collidingObjects.sort(sortByOverlapArea(this))

		for (let i = 0; i < collidingObjects.length; i++) {
			const obj = collidingObjects[i];

			// cases where we're touching the object but have already applied collision
			if (this.x + this.w <= obj.x) {
				this.collisions.right = true
				continue;
			}
			if (this.x >= obj.x + obj.w) {
				this.collisions.left = true
				continue;
			}
			if (this.y + this.h <= obj.y) {
				this.collisions.bottom = true
				this.groundObject = obj
				continue;
			}
			if (this.y >= obj.y + obj.h) {
				this.collisions.top = true
				continue;
			}

			// apply collisions
			if (obj.vertices) {
				this.resolveComplexCollision(obj)
			} else if (this.prevX + this.w <= obj.x || this.prevX >= obj.x + obj.w) {
				this.resolveXCollision(obj)
			} else if (this.prevY + this.h <= obj.y || this.prevY >= obj.y + obj.h) {
				this.resolveYCollision(obj)
			}
		}
	}
}

