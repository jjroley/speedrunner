/**
 * Player class
 *
 * Handles keyboard control of the player and special abilities
 * not found in normal entities
 */

class Player extends Entity {
	constructor(x, y, w, h) {
		super(x, y, w, h)

		this.canJump = false
		this.direction = 1 // last moved direction
		this.r = 0

		this.defaultSpeed = 2.5
		this.speed = this.defaultSpeed

		this.jumpTimer = 0
		this.jumpLevel = 0
		this.jumpLevelTimer = 0
		this.highJumpTimer = 0
		this.highJumpDuration = 25
		this.wasOnGround = false

		this.sprintTimer = 0
		this.sprintDuration = 20
		this.sprintCooldown = 300
		this.sprintSpeed = 7
		this.trail = []

		this.groundPound = false

		this.dead = false
		this.respawnTimer = 0
		this.respawnDuration = 100
		this.respawnPoint = { x, y }
	}

	beforeCollision() {
		if (!this.dead) {
			super.beforeCollision()
		}
	}

	update() {
		if (this.dead) {
			this.respawnTimer--;
			if (this.respawnTimer <= 0) {
				this.respawn()
			}
			return;
		}

		// call Entity initial update
		super.update()

		// key controlled movement
		if (keys.pressed('left')) {
			this.xVel = -this.speed
			this.direction = -1
		}
		else if (keys.pressed('right')) {
			this.xVel = this.speed
			this.direction = 1
		} else {
			this.xVel = 0
		}

		// jumping
		if (!this.wasOnGround && !keys.pressed('jump') && this.collisions.bottom) {
			this.jumpLevelTimer = 15
		}

		// countdown various jump timers ;)
		this.jumpTimer = Math.max(0, this.jumpTimer - 1)
		this.jumpLevelTimer = Math.max(0, this.jumpLevelTimer - 1)
		this.highJumpTimer = Math.max(0, this.highJumpTimer - 1)

		// saves state of bottom collision
		this.wasOnGround = this.collisions.bottom

		if (this.collisions.bottom && keys.pressed('jump')) {
			if (this.jumpLevelTimer > 0) {
				this.jumpLevel++
			} else {
				this.jumpLevel = 0
			}

			this.jumpTimer = 15
			this.yVel = -(4 + this.jumpLevel * 0.6)

			if (this.jumpLevel >= 3) {
				this.highJumpTimer = this.highJumpDuration
				this.jumpLevel = 0
			}
		}

		// extra height if key is held down
		if (keys.pressed('jump') && this.jumpTimer > 0) {
			this.yVel -= 0.2
		}

		// high jump
		if (this.highJumpTimer > 0) {
			this.yVel -= 0.03
		}

		// ground pounding
		if (this.collisions.bottom) {
			if (this.groundPound) {

			}
			this.groundPound = false
		} else {
			if (keys.pressStart('ground_pound') && !this.groundPound) {
				this.groundPound = true
			}
		}

		// ground pound has constant y velocity
		if (this.groundPound) {
			this.yVel = 13
		}

		// sprinting
		let sprinting = false;

		this.sprintTimer = Math.max(0, this.sprintTimer - 1)

		if (this.sprintTimer === 0 && keys.pressed('sprint')) {
			this.sprintTimer = this.sprintCooldown
			if (!this.collisions.bottom) {
				this.yVel *= (1 + Math.sqrt(Math.abs(this.yVel)) / 8)
			}
		}

		if (this.sprintTimer > this.sprintCooldown - this.sprintDuration) {
			this.speed = this.sprintSpeed
			this.xVel = this.speed * this.direction
			sprinting = true

		} else {
			this.speed = this.defaultSpeed
		}

		// rotation
		if (this.sprintTimer > this.sprintCooldown - this.sprintDuration) {
			this.r = (this.sprintCooldown - this.sprintTimer) / this.sprintDuration * 360 * this.direction
		} else if (this.highJumpTimer > 0) {
			this.r = (this.highJumpDuration - this.highJumpTimer) / this.highJumpDuration * 360 * this.direction
		} else {
			this.r = 0
		}

		// trail
		if ((this.groundPound || sprinting || this.highJumpTimer > 0)) {
			this.trail.push([this.x, this.y, this.r])
			if (this.trail.length > 20) {
				this.trail.shift()
			}
		} else {
			this.trail.shift()
		}
	}

	display() {
		for (let i = 0; i < this.trail.length; i++) {
			const p = this.trail[i]
			push();
			translate(p[0] + this.w / 2, p[1] + this.h / 2);
			rotate(p[2]);
			fill(113, 237, 78, i * (255 / (this.trail.length * 2)));
			rect(-this.w / 2, -this.h / 2, this.w, this.h);
			pop();
		}

		push();
		translate(this.x + this.w / 2, this.y + this.h / 2);
		rotate(this.r);
		fill(113, 237, 78);
		rect(-this.w / 2, -this.h / 2, this.w, this.h);
		pop();
	}

	kill() {
		this.dead = true
		this.respawnTimer = this.respawnDuration
	}

	respawn() {
		this.x = this.prevX = this.respawnPoint.x
		this.y = this.prevY = this.respawnPoint.y
		this.dead = false
	}
}

