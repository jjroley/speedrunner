/**
 * Particle class
 */
class Particle {
	constructor(x, y, s, color, r, xVel, yVel) {
		this.x = x
		this.y = y
		this.s = s
		this.color = color
		this.r = r
		this.xVel = xVel
		this.yVel = yVel
	}

	update() {
		this.x += this.xVel
		this.y += this.yVel
	}

	display(viewport) {
		this.aabb = {
			x: this.x - this.s,
			y: this.y - this.s,
			w: this.s * 2,
			h: this.s * 2
		}
		if(overlap(this.aabb, viewport)) {
			push()
			translate(this.x, this.y)
			rotate(this.r)
			fill(this.color)
			rect(-this.s / 2, -this.s / 2, this.s, this.s)
			pop()
		}
	}

	static createSystem({
		x,
		y,
		s,
		r,
		color
	}) {

	}
}
