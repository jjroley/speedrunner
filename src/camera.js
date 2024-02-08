
/**
 * Camera class
 * 
 * Handles smoothly following an entity and applying a world translate
 */

class Camera {
	constructor() {
		this.viewport = {
			x: 0,
			y: 0,
			w: width,
			h: height
		}
	}

	follow(entity) {
		const centerX = entity.x + entity.w / 2 - this.viewport.w / 2
		const centerY = entity.y + entity.h / 2 - this.viewport.h / 2
		this.viewport.x = lerp(this.viewport.x, centerX, 0.1)
		this.viewport.y = lerp(this.viewport.y, centerY, 0.1)
	}
	center(entity) {
		this.viewport.x = entity.x + entity.w / 2 - this.viewport.w / 2
		this.viewport.y = entity.y + entity.h / 2 - this.viewport.h / 2
	}
	applyToWorld() {
		translate(-this.viewport.x, -this.viewport.y)
	}
}
