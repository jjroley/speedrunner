
/**
 * Camera class
 * 
 * Handles smoothly following an entity and applying a world translate
 */
const Camera = (function() {
	function Camera() {
			this.viewport = {
					x: 0,
					y: 0,
					w: width,
					h: height
			}
	}
	Camera.prototype.follow = function(entity) {
			const centerX = entity.x + entity.w / 2 - this.viewport.w / 2
			const centerY = entity.y + entity.h / 2 - this.viewport.h / 2
			this.viewport.x = lerp(this.viewport.x, centerX, 0.1)
			this.viewport.y = lerp(this.viewport.y, centerY, 0.1)
	}
	Camera.prototype.center = function(entity) {
			this.viewport.x = entity.x + entity.w / 2 - this.viewport.w / 2
			this.viewport.y = entity.y + entity.h / 2 - this.viewport.h / 2
	}
	Camera.prototype.applyToWorld = function() {
			translate(-this.viewport.x, -this.viewport.y)
	}
	
	return Camera
})();
