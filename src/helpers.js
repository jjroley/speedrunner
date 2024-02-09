/**
 * Helper functions
 */

function overlap(a, b) {
	return (
			a.x + a.w > b.x &&
			a.x < b.x + b.w &&
			a.y + a.h > b.y &&
			a.y < b.y + b.h
	)
}

function pointInRect(x, y, rect) {
	return (
			x > rect.x &&
			x < rect.x + rect.w &&
			y > rect.y &&
			y < rect.y + rect.h
	)
}

function getOverlapArea(a, b) {
	return (
			Math.min(a.x + a.w, b.x + b.w) -
			Math.max(a.x, b.x)
	) * (
			Math.min(a.y + a.h, b.y + b.h) -
			Math.max(a.y, b.y)
	)
}

function sortByOverlapArea(obj) {
	return function(a, b) {
			return (
					getOverlapArea(obj, b) -
					getOverlapArea(obj, a)
			)
	}
}

function handleResize() {
	const scaleX = width / MAX_VIEW
	const scaleY = height / (MAX_VIEW / view.aspect)

	view.scale = max(scaleX, scaleY)
}

function closestPointOnLine(px, py, x1, y1, x2, y2) {
	const len = dist(x1, y1, x2, y2)
	const dot = ( (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1) ) / len ** 2

	return {
			x: x1 + dot * (x2 - x1),
			y: y1 + dot * (y2 - y1)
	}
}

function isPointLeftOfLine(px, py, x1, y1, x2, y2) {
	return ((x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)) < 0
}

function getCollisionResolutionVectorForLine(px, py, x1, y1, x2, y2) {
	const closest = closestPointOnLine(px, py, x1, y1, x2, y2)
	const angle   = atan2(closest.y - py, closest.x - px)
	const d       = dist(px, py, closest.x, closest.y)

	if(isPointLeftOfLine(px, py, x1, y1, x2, y2)) {
			return false
	}

	return {
			x: cos(angle) * d,
			y: sin(angle) * d,
			angle: angle,
			dist: d,
	}
}

function getCollisionResolutionVector(rect, vertices) {
	const intersectingLines = []

	const points = [
			[rect.x, rect.y],
			[rect.x + rect.w, rect.y],
			[rect.x + rect.w, rect.y + rect.h],
			[rect.x, rect.y + rect.h]
	]

	for(let i = 0; i < vertices.length; i++) {
			const cv = vertices[i]
			const nv = vertices[(i + 1) % vertices.length]

			let largestPDist = 0;
			let largestVec = false
			let isIntersecting = false
			for(const point of points) {
					const vec = getCollisionResolutionVectorForLine(point[0], point[1], cv[0], cv[1], nv[0], nv[1])
					if(vec && vec.dist > largestPDist) {
							largestPDist = vec.dist
							largestVec = [cv[0], cv[1], nv[0], nv[1], vec]
					}
			}
			if(largestVec) {
					intersectingLines.push(largestVec)
			} else {
					return false
			}
	}

	if(intersectingLines.length === 0) {
			return false
	}

	let targetPoint = false
	
	for(let i = 0; i < intersectingLines.length; i++) {
			const line = intersectingLines[i]

			const vec = line[4]
			if(!targetPoint || vec.dist < targetPoint.dist) {
					targetPoint = vec
			}
	}

	return targetPoint
}

function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
	const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
	const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

	return {
			x: x1 + (uA * (x2-x1)),
			y: y1 + (uA * (y2-y1)),
			intersecting: uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1
	}
}
