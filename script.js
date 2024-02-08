/**
 * New Program
 * 
 * @author bravo bravo 2024
 */


// constants
const GRAVITY    = 0.25;
const BLOCK_SIZE = 30;
const MAX_VIEW   = BLOCK_SIZE * 20;

const view = {
  cursorX: 0,
  cursorY: 0,
  scale: 1,
  aspect: 16 / 9
}


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
            // console.log(vec)
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
        // const current = intersectingLines[i]
        // const next = intersectingLines[(i + 1) % intersectingLines.length]
        // const intersectionPoint = getLineIntersection(
        //     current[0],
        //     current[1],
        //     current[2],
        //     current[3],
        //     next[0],
        //     next[1],
        //     next[2],
        //     next[3]
        // )

        // if(intersectionPoint.intersecting && pointInRect(intersectionPoint.x, intersectionPoint.y, rect)) {
        //     const offsetX = Math.abs(rect.x + rect.w / 2 - intersectionPoint.x)
        //     const offsetY = Math.abs(rect.y + rect.h / 2 - intersectionPoint.y)
        //     console.log(offsetX, offsetY)
        //     return {
        //         x: offsetX >= offsetY ? intersectionPoint.x - rect.x : 0,
        //         y: offsetY >= offsetX ? intersectionPoint.y - rect.y : 0
        //     }
        // }

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

function doLogs() {
    const tri = [
        [50, 100],
        [100, 150],
        [0, 150]
    ]

    const r = {
        x: 85,
        y: 116,
        w: 50,
        h: 50
    }

    background(255)
    noFill()
    stroke(0)
    rect(r.x, r.y, r.w, r.h)
    beginShape()
    for(const v of tri) {
        vertex(v[0], v[1])
    }
    endShape(CLOSE)

    const resolution = getCollisionResolutionVector(r, tri)

    console.log(resolution)
    
    if(resolution) {
        const r2 = {
            x: r.x + resolution.x,
            y: r.y + resolution.y,
            w: r.w,
            h: r.h
        }

        rect(r2.x, r2.y, r2.w, r2.h)
    }
    

    // console.log(isPointLeftOfLine(50, 250, 100, 100, 0, 100))

    // console.log(isPointLeftOfLine(0,-20, 0, 0, 20, 0))
    // console.log(closestPointOnLine(3, 8, 20, 0, 20, 20))
    // console.log(getLineIntersection(0, 0, 10, 0, 5, -5, 5, 5))
}


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

/**
 * KeyManager class
 *
 * handles everything relating to keys
 */
const KeyManager = (function() {
    function KeyManager() {
        this.keys = {} // stores keys
        this.keyCodeMap = {} // maps keycodes to key names
        this.current = {} // currently pressed keys
        this.prev = {} // previously pressed keys
        this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-_!@#$%^&*?"; // chars for speedrun code
        this.isRecording = false // whether or not we're recording a speedrun
        this.speedrunData = {} // stores speedrun codes
        this.speedruns = {} // stores speedruns
        this.speedrun = null // the current speedrun
        this.speedrunInProgress = false // whether or not we're playing a speedrun
        this.speedrunTimer = 0
        this.verboseSpeedrun = {}
    }
    KeyManager.prototype.register = function(key, name, keyCode) {
        this.keys[key] =  { keyCode: keyCode, name: name }
        this.keyCodeMap[keyCode] = key
    }
    KeyManager.prototype.isKeyPressed = function(selector, state) {
        if(typeof selector === 'string') {
            selector = (
                this.keys[selector] &&
                this.keys[selector].keyCode
            )
        }
        if(!selector) {
            return false
        }
        return state[selector]
    }
    KeyManager.prototype.pressed = function(selector) {
        return this.isKeyPressed(selector, this.current)
    }
    KeyManager.prototype.pressStart = function(selector) {
        return (
            this.isKeyPressed(selector, this.current) &&
            !this.isKeyPressed(selector, this.prev)
        )
    }
    KeyManager.prototype.pressEnd = function(selector) {
        return (
            !this.isKeyPressed(selector, this.current) &&
            this.isKeyPressed(selector, this.prev)
        )
    }
    KeyManager.prototype.keyPressed = function(keyCode) {
        this.current[keyCode] = true
    }
    KeyManager.prototype.keyReleased = function(keyCode) {
        delete this.current[keyCode]
    }
   
    KeyManager.prototype.update = function() {
        if (this.isRecording) {
            const allKeys  = Object.assign({}, this.current, this.prev)

            for(const keyCode in allKeys) {
                if(this.current[keyCode] !== this.prev[keyCode]) {
                    this.updateSpeedrun(keyCode)
                }
            }
            this.speedrunTimer++
        } else if(this.speedrunInProgress) {
            for(const keyCode in this.speedrun) {
                const key = this.speedrun[keyCode]
                if(key[0] === this.speedrunTimer) {
                    if(this.current[keyCode]) {
                        delete this.current[keyCode]
                    } else {
                        this.current[keyCode] = true
                    }
                    key.shift()
                }
            }
            this.speedrunTimer++
        }

        this.prev = Object.assign({}, this.current)
    }
    KeyManager.prototype.parseSpeedrun = function(speedrun) {
        const keys = speedrun.split(',');
        const output = {};
        for(let i = 0; i < keys.length; i++) {
            var data = keys[i];
            var keyCode = Number(data.slice(0, 2));
            output[keyCode] = this.parseKeyPresses(data.slice(2));
        }
        return output;
    }
    KeyManager.prototype.parseKeyPresses = function(data) {
        let currentBlock = 0

        const sections = data.match(/\d+|\D+/g);
        const togglePoints = [];
        for(let i = 0; i < sections.length; i++) {
            const section = sections[i];
            if(isNaN(section)) {
                for(let j = 0; j < section.length; j++) {
                    const char = section[j];
                    const charIndex = this.chars.indexOf(char);
                    const lastTogglePoint = togglePoints[togglePoints.length - 1];
                    if(lastTogglePoint && charIndex <= (lastTogglePoint % this.chars.length)) {
                        currentBlock++
                    }
                    togglePoints.push((currentBlock * this.chars.length) + charIndex);
                }
            } else {
                currentBlock += Math.max(parseInt(section, 10), 1);
            }
        }

        return togglePoints;
    }
    KeyManager.prototype.updateSpeedrun = function(keyCode) {
        this.verboseSpeedrun[keyCode] = this.verboseSpeedrun[keyCode] || []
        this.verboseSpeedrun[keyCode].push(this.speedrunTimer)
    }
    KeyManager.prototype.buildSpeedrunString = function(arr) {
        let str = ''
        
        let lastBlock = 0, lastChar = false
        for(const frame of arr) {
            const currentBlock = Math.floor(frame / this.chars.length)
            const currentChar  = frame % this.chars.length
        
            if(currentBlock > lastBlock) {
                if(currentBlock === lastBlock + 1) {
                    if(lastChar !== false && currentChar > lastChar) {
                        str += '0'
                    }
                    if(lastChar === false) {
                        str += '1'
                    }
                } else  {
                    let amount = currentChar > lastChar || lastChar === false ? 0 : 1
                    str += (currentBlock - lastBlock - amount).toString()
                }
            }
            
            str += this.chars[currentChar]
        
            lastBlock = currentBlock
            lastChar = currentChar
        }

        return str
    }
    KeyManager.prototype.startRecording = function() {
        this.isRecording = true;
        this.speedrunData = {};
        this.speedrunTimer = 0;
    }
    KeyManager.prototype.stopRecording = function() {
        this.isRecording = false;
        this.speedrunData = this.buildSpeedrunObject(this.verboseSpeedrun)
    }
    KeyManager.prototype.buildSpeedrunObject = function(verboseSpeedrun) {
        const data = {}
        for(const keyCode in verboseSpeedrun) {
            data[keyCode] = this.buildSpeedrunString(verboseSpeedrun[keyCode])
        }
        return data
    }
    KeyManager.prototype.printSpeedrun = function() {
        const output = Object.entries(this.speedrunData).map(([keyCode, data]) => {
            return keyCode + data;
        })
        
        console.log(output.join(','));
        // console.log(this.verboseSpeedrun)
        console.log(JSON.stringify(this.verboseSpeedrun))
        console.log(this.parseSpeedrun(output.join(',')))
    }
    KeyManager.prototype.loadSpeedrun = function(name, speedrun) {
        this.speedruns[name] = speedrun
    }
    KeyManager.prototype.playSpeedrun = function(name) {
        this.speedrunInProgress = true;
        this.speedrun = typeof this.speedruns[name] === 'string' ? this.parseSpeedrun(this.speedruns[name]) : this.speedruns[name];
        this.isRecording = false;
        this.speedrunTimer = 0;

        console.log(this.speedrun)
        console.log(this.parseSpeedrun(this.speedruns[name]))
    }

    return KeyManager;
})();

const keys = new KeyManager()

/**
 * Entity class
 * 
 * Base class for a single physics-bound entity.
 */
const Entity = (function() {
    function Entity(x, y, w, h) {
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
    Entity.prototype.beforeCollision = function() {
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
    Entity.prototype.update = function() {
        // if on moving object, apply frictional force
        if(this.groundObject) {
            if(this.groundObject.xVel !== undefined) {
                this.xVel += (this.groundObject.xVel - this.xVel) * this.groundObject.friction
            }
        }
    }
    Entity.prototype.resolveComplexCollision = function(obj) {
        const vertices = obj.vertices


        const vec = getCollisionResolutionVector(this, vertices)

        if(vec) {
            // this.x += vec.x
            // this.y += vec.y

            this.xVel += vec.x
            this.yVel += vec.y
        }



        // if(obj.tile === '^') {
        //     const offset = (this.x + this.w / 2) - (obj.x + obj.w / 2)
        //     const absoluteOffset = Math.abs(offset) - this.w / 2

        //     if(absoluteOffset <= 0 || this.prevY > obj.y + obj.h) {
        //         if(this.y + this.h * 0.5 < obj.y + obj.h * 0.5) {
        //             this.y = obj.y - this.h
        //             this.yVel = 0
        //             this.collisions.bottom = true
        //             this.groundObject = obj
        //         } else {
        //             this.y = obj.y + obj.h
        //             this.yVel = 0
        //             this.collisions.top = true
        //         }
        //     } else {
        //         const penetrationY = this.y + this.h - obj.y - absoluteOffset * 2
        //         const penetrationX = penetrationY / 2
        //         if(penetrationY > 0 && this.prevY + this.h <= obj.y + obj.h) {
        //             const newX = (this.x - this.prevX)

        //             this.yVel = 0
                    
        //             this.y -= penetrationY * 0.5
        //             if(this.x !== this.prevX) {
        //                 this.x -= (offset > 0 ? -penetrationX : penetrationX) * 0.5
        //             }

        //             this.collisions.bottom = true
        //             this.groundObject = obj
        //         }
        //     }
            
        //     if(this.prevY + this.h > obj.y + obj.h) {
        //         if(this.prevXVel) {
        //             // this.x = this.prevXVel > 0 ? obj.x - this.w : obj.x + obj.w
        //         }
        //     }
        // }

        // if(obj.tile === 'R') {

        // }
    }
    Entity.prototype.resolveYCollision = function(obj) {
        this.yVel = 0
        this.collisions.top = this.prevYVel < 0
        this.collisions.bottom = this.prevYVel >= 0
        this.y = this.prevYVel >= 0 ? obj.y - this.h : obj.y + obj.h
        
        if(this.prevYVel >= 0) {
            this.groundObject = obj
        }
    }
    Entity.prototype.resolveXCollision = function(obj) {
        this.xVel = 0
        this.collisions.right = this.prevXVel > 0
        this.collisions.left = this.prevXVel < 0
        if(this.prevXVel !== 0) {
            this.x = this.prevXVel > 0 ? obj.x - this.w : obj.x + obj.w
        }
    }
    Entity.prototype.resolveCollisions = function(collidingObjects) {
        // sort collisions by overlap area this is a hacky(ish)
        // way to make collision resolutions are less wacky
        collidingObjects.sort(sortByOverlapArea(this))
        
        for(var i = 0; i < collidingObjects.length; i++) {
            const obj = collidingObjects[i];
            
            // cases where we're touching the object but have already applied collision
            if(this.x + this.w <= obj.x) {
                this.collisions.right = true
                continue;
            }
            if(this.x >= obj.x + obj.w) {
                this.collisions.left = true
                continue;
            }
            if(this.y + this.h <= obj.y) {
                this.collisions.bottom = true
                this.groundObject = obj
                continue;
            }
            if(this.y >= obj.y + obj.h) {
                this.collisions.top = true
                continue;
            }
            
            // apply collisions
            if(obj.vertices) {
                this.resolveComplexCollision(obj)
            }else if(this.prevX + this.w <= obj.x || this.prevX >= obj.x + obj.w) {
                this.resolveXCollision(obj)
            } else if(this.prevY + this.h <= obj.y || this.prevY >= obj.y + obj.h) {
                this.resolveYCollision(obj)
            }
        }
    }
    
    return Entity
})()


/**
 * Player class
 *
 * Handles keyboard control of the player and special abilities
 * not found in normal entities
 * 
 * @extends Entity
 */
const Player = (function() {
    function Player(x, y, w, h) {
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
        
        Entity.call(this, x + 5, y + 5, w - 10, h - 10); // inherit from entity
    }
    Player.prototype = Object.create(Entity.prototype);
    Player.prototype.beforeCollision = function() {
        if(!this.dead) {
            Entity.prototype.beforeCollision.call(this)
        }
    }
    Player.prototype.update = function() {
        if(this.dead) {
            this.respawnTimer--;
            if(this.respawnTimer <= 0) {
                this.respawn()
            }
            return;
        }

        // call Entity initial update
        Entity.prototype.update.call(this)
        
        // key controlled movement
        if(keys.pressed('left')) {
            this.xVel = -this.speed
            this.direction = -1
        }
        else if(keys.pressed('right')) {
            this.xVel = this.speed
            this.direction = 1
        } else {
            this.xVel = 0
        }
        
        // jumping
        if(!this.wasOnGround && !keys.pressed('jump') && this.collisions.bottom) {
            this.jumpLevelTimer = 15
        }
        
        // countdown various jump timers ;)
        this.jumpTimer = Math.max(0, this.jumpTimer - 1)
        this.jumpLevelTimer = Math.max(0, this.jumpLevelTimer - 1)
        this.highJumpTimer = Math.max(0, this.highJumpTimer - 1)
        
        // saves state of bottom collision
        this.wasOnGround = this.collisions.bottom
        
        if(this.collisions.bottom && keys.pressed('jump')) {
            if(this.jumpLevelTimer > 0) {
                this.jumpLevel++
            } else {
                this.jumpLevel = 0
            }
            
            this.jumpTimer = 15
            this.yVel = -(4 + this.jumpLevel * 0.6)
            
            if(this.jumpLevel >= 3) {
                this.highJumpTimer = this.highJumpDuration
                this.jumpLevel = 0
            }
        }
        
        // extra height if key is held down
        if(keys.pressed('jump') && this.jumpTimer > 0) {
            this.yVel -= 0.2
        }
        
        // high jump
        if(this.highJumpTimer > 0) {
            this.yVel -= 0.03
        }
        
        // ground pounding
        if(this.collisions.bottom) {
            if(this.groundPound) {
                
            }
            this.groundPound = false
        } else {
            if(keys.pressStart('ground_pound') && !this.groundPound) {
                this.groundPound = true
            }
        }
        
        // ground pound has constant y velocity
        if(this.groundPound) {
            this.yVel = 13
        }
        
        // sprinting
        let sprinting = false;
        
        this.sprintTimer = Math.max(0, this.sprintTimer - 1)
        
        if(this.sprintTimer === 0 && keys.pressed('sprint')) {
            this.sprintTimer = this.sprintCooldown
            if(!this.collisions.bottom) {
                this.yVel *= (1 + Math.sqrt(Math.abs(this.yVel)) / 8)
            }
        }
        
        if(this.sprintTimer > this.sprintCooldown - this.sprintDuration) {
            this.speed = this.sprintSpeed
            this.xVel = this.speed * this.direction
            sprinting = true
    
        } else {
            this.speed = this.defaultSpeed
        }
        
        // rotation
        if(this.sprintTimer > this.sprintCooldown - this.sprintDuration) {
            this.r = (this.sprintCooldown - this.sprintTimer) / this.sprintDuration * 360 * this.direction
        } else if(this.highJumpTimer > 0) {
            this.r = (this.highJumpDuration - this.highJumpTimer) / this.highJumpDuration * 360 * this.direction
        } else {
            this.r = 0
        }
        
        // trail
        if((this.groundPound || sprinting || this.highJumpTimer > 0)) {
            this.trail.push([this.x, this.y, this.r])
            if(this.trail.length > 20) {
                this.trail.shift()
            }
        } else {
            this.trail.shift()
        }
    }
    Player.prototype.display = function() {
        for(let i = 0; i < this.trail.length; i++) {
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
    Player.prototype.kill = function() {
        this.dead = true
        this.respawnTimer = this.respawnDuration
    }
    Player.prototype.respawn = function() {
        this.x = this.prevX = this.respawnPoint.x
        this.y = this.prevY = this.respawnPoint.y
        this.dead = false
    }
    return Player 
})()

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

/**
 * Scene class
 * 
 * Used with the SceneHandler class, this mananges a individual scene
 */
const Scene = (function() {
    function Scene(callback, context) {
        this.sceneContext = context || this
        this.callback = callback.bind(this.sceneContext)
        this.actions = {
            load: []
        }
        this.loaded = false
        this.state = {}
        this.setState = this.setState.bind(this)
        return this
    }
    Scene.prototype.on = function(action, callback) {
        if(!this.actions[action]) {
            throw {
                message: "Invalid action: " + action
            }
        }
        this.actions[action].push(callback.bind(this.sceneContext))
        return this
    }
    Scene.prototype.doAction = function(action) {
        for(let i = 0; i < this.actions[action].length; i++) {
            this.actions[action][i](this.state, this.setState)
        }
    }
    Scene.prototype.setState = function(newState) {
        this.state = Object.assign(this.state, newState)
    }
    Scene.prototype.update = function() {
        if(!this.loaded) {
            this.doAction('load')
            this.loaded = true
        }
        this.callback(this.state, this.setState)
    }
    Scene.prototype.start = function() {
        this.loaded = false
        return this
    }
    
    return Scene
})();

/**
 * SceneHandler class
 * 
 * Tracks and manages all scenes.
 */
const SceneHandler = (function() {
    function SceneHandler(initialScene, sceneContext) {
        this.current = initialScene;
        this.sceneContext = sceneContext || false
        this.scenes  = {}; // keeps track of registered scenes
    }
    SceneHandler.prototype.add = function(name, cb) {
        this.scenes[name] = new Scene(cb, this.sceneContext)
        return this.scenes[name]
    }
    SceneHandler.prototype.change = function(newScene) {
        const scene = this.scenes[newScene]
        if(!scene) {
            throw {
                message: "Invalid scene name: " + newScene
            }
        }
        this.current = scene
        this.current.start()
    }
    SceneHandler.prototype.update = function() {
        this.current.update()
    }

    return SceneHandler;
})();

/**
 * Game class
 * 
 * Brings everything together, let the magic begin.
 */
const Game = (function() {
    function Game() {
        this.scene = new SceneHandler('menu', this)
        this.level = new LevelManager()
    }
    return Game
})();

let game;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight)
    angleMode(DEGREES)

    handleResize()

    game = new Game() // we got a game, folks

    /**
     * Register scenes
     */
    game.scene.add('menu', function() {
        background(0, 255, 0);
    })
    
    game.scene.add('play', function(state, setState) {
        const player = state.player
        
        background(17, 86, 120);
        
        this.level.update()
        this.level.camera.follow(player)
        this.level.display()
     
    }).on('load', function(state, setState) {
        this.level.start(0)
        const player = this.level.entities.find(function(entity) {
            return entity instanceof Player
        })
        setState({
            player: player
        })
        this.level.camera.center(player)
        // keys.playSpeedrun('test4')
    })
    
    
    /**
     * Register tile types
     */
    game.level.registerTile("#", function(w, h) {
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
        // triangle(w * 0.5, h * 0.4, w * 0.6, h * 0.5, w * 0.5, h * 0.6)
        // fill(63)
        // triangle(w * 0.5, h * 0.4, w * 0.4, h * 0.5, w * 0.5, h * 0.6)
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
        for(let i = 0; i < w; i += d) {
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

    game.level.registerTile('^', function(w, h) {
        spike(0, 0, w, h, 0)
        return get(0, 0, w, h)
    }, function(x, y, w, h) {
        return [
            [x + w / 2, y],
            [x + w, y + h],
            [x, y + h]
        ]
    })

    game.level.registerTile('>', function(w, h) {
        spike(0, 0, w, h, 90)
        return get(0, 0, w, h)
    }, function(x, y, w, h) {
        return [
            [x, y],
            [x + w, y + h / 2],
            [x, y + h]
        ]
    })

    game.level.registerTile('<', function(w, h) {
        push()
        scale(1, -1)
        translate(0, -h)
        spike(0, 0, w, h, -90)
        pop()
        return get(0, 0, w, h)
    }, function(x, y, w, h) {
        return [
            [x + w, y],
            [x + w, y + h],
            [x, y + h / 2]
        ]
    })

    game.level.registerTile('v', function(w, h) {
        spike(0, 0, w, h, 180)
        return get(0, 0, w, h)
    }, function(x, y, w, h) {
        return [
            [x, y],
            [x + w, y],
            [x + w / 2, y + h]
        ]
    })

    game.level.registerEntity("@", function(x, y, w, h) {
        return new Player(x + 2, y + 2, w - 4, h - 4)
    })

    game.level.registerTile('R', function(w, h) {
        slope(0, 0, w, h)
        return get(0, 0, w, h)
    })

    game.level.registerTile('L', function(w, h) {
        push()
        translate(w, 0)
        scale(-1, 1)
        slope(0, 0, w, h)
        pop()
        return get(0, 0, w, h)
    })

    game.level.registerTile('l', function(w, h) {
        push()
        translate(w, h)
        scale(-1, -1)
        slope(0, 0, w, h)
        pop()
        return get(0, 0, w, h)
    })

    game.level.registerTile('r', function(w, h) {
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
     * Register speedruns
     */
    // keys.loadSpeedrun('test', '161EK7zf,651r0!L+2hj2se,68Q0h2Y1Q3_P,831hu,87?X0f@Jqbk1uGpKrMwg#F')
    keys.loadSpeedrun( 'v', JSON.parse('{"65":[158,222,237,269],"68":[24,131,284,387],"87":[89,98,187,207,241,248]}') )

    const tss = '165he8V%,652N0k1J0t2*h1L_3QA0V0eu1K,68V1H0&1G0@1ytTZJ0O!3fO,8310m#6pw,871Uf0#Io&1c0e1BvGaFgVjKdFjGoJ?j+1Ddq1H'
    const ts2 = JSON.parse('{"16":[353,414,981,1019],"65":[141,228,329,429,574,609,715,758,976,1024,1109,1182,1198,1290],"68":[21,135,253,326,440,562,621,659,665,713,782,823,1055,1102],"83":[678,697,1129,1136],"87":[84,95,185,200,232,253,348,414,513,559,582,602,645,672,725,739,778,797,837,867,902,936,969,1023,1059,1076,1155,1181,1194,1287]}')

    keys.loadSpeedrun('test', tss)
    keys.loadSpeedrun('test2', '1610R_,652a0m!j5O_1dhz!sw-%AEgiO?VC,68W1K2?2H4cwBGqu%*HKgj,871Zq1Hm!c2JnHnIpJ_Zu3izRq')
    keys.loadSpeedrun('test3', '1611ZI10qy7Tm3oA2+U,652VZ^AHMVY0!VrAZj@D2GjJoSJ2PiVykGEwNc0dp_1H2eA0zB3Jm3$?3MU0inGKRV$?FH0WHcr4Xl2IN,68f0?ekrwmpw-?H3Pbv0@nDrD0j0@u%#T0X?4Z0dsI13_Xrv_$cflolr#J0xG3CF0GH%&y!0#%4GO,834RW36SZ12DMBP,871jz3_V_*$bP_IiJqSJkyRtPmX+lF0IqSa%Y$Flu1sGe?QnYDqLrNzpIjLuQDg*jAoZ@E2%AgIhCc%Y$b?hDXlipblkqn$lFk!kv')
    keys.loadSpeedrun('test4', '168Va3So4o-GP46V$6-Q2Dr,65_R0SwiDyPsBRhz?Tcw%PTXe^Gfr&Ico$Gw$BKQXds-^2IVYgip*IPZpz^EUfy&JWn&Jg1QVfkWYtuEF8nC2NuRx21x2VQv2U%Ual#2Gy0&f0-!#Q2Qs,68RwpJ#cKsOqEPjvEPjsALu$Ogz$NXu#Kgos$Br@^KQXdjpuz_%?EINSXafkmsx_#*DHv+$*IOdm+^IRgp^JZj$Gl0_0$&2?Ekp7f*Ed0@J30A0^1Ts,835jyKUq_KVpyHW+?Vf@?Uf+&Rafmsx@*jv@*3CJkqQX_Bv#5#AX3gycwMe0n0$n2ZuHf@PtAiyTrz_X0b#aDaD&z%1DP0Utjxs!0%EBIIO0YiiqX2Q5ZY,87QYBPtHZwBbsHVxGc#Gal&Fbk$DkvHQq+GPmvEMJVGRWejpuz_%?EIOSXafjosx_$*ERYdjow-%Xdv!DKdnRbgoCKXlPh3?FaqR3irdqNZ1Hb-1OuRyAOoMa&Jv^iwTlbm0&C?O@PsBY!LKsaKqO+TBjGqMzcGn*4Ag?jC&1JR0f0yJo*fpBpSuNvW@s')
    
    // console.log(tss)
    // console.log(keys.parseSpeedrun(tss))
    // console.log(ts2)
    const str = Object.entries(keys.buildSpeedrunObject(ts2)).map(([k, v]) => `${k}${v}`).join(',')
    // console.log(str)
    // console.log(keys.parseSpeedrun(str))
    // console.log(keys.buildSpeedrunString(ts2['65']))
    // console.log(keys.l)
    window.ts2 = ts2

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
    // doLogs()
    // noLoop()
    // return;

    background(0)
    push()
    scale(view.scale)
    try {
        game.scene.update()
    } catch(e) {
        console.log(e)
    }
    fill(255);
    // text(this.__frameRate, 20, 20);
    pop()

    keys.update()

    // background(255)

}

function mouseClicked() {
    if(keys.isRecording) {
        keys.stopRecording()
        keys.printSpeedrun()
    } else {
        keys.startRecording()
    }
}

function keyPressed() {
    // println(keyCode);
    keys.keyPressed(keyCode)
}
function keyReleased() {
    keys.keyReleased(keyCode)
}

function mouseMoved() {
    // view.cursorX = mouseX * view.scale
    // view.cursorY = mouseY * view.scale
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight)

    handleResize()

    game.level.camera.viewport.w = width / view.scale
    game.level.camera.viewport.h = height / view.scale
}
