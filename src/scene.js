
/**
 * Scene class
 * 
 * Used with the SceneHandler class, this mananges a individual scene
 */

class Scene {
	constructor(callback, context) {
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

	on(action, callback) {
		if (!this.actions[action]) {
			throw {
				message: "Invalid action: " + action
			}
		}
		this.actions[action].push(callback.bind(this.sceneContext))
		return this
	}

	doAction(action) {
		for (let i = 0; i < this.actions[action].length; i++) {
			this.actions[action][i](this.state, this.setState)
		}
	}

	setState(newState) {
		this.state = Object.assign(this.state, newState)
	}

	update() {
		if (!this.loaded) {
			this.doAction('load')
			this.loaded = true
		}
		this.callback(this.state, this.setState)
	}

	start() {
		this.loaded = false
		return this
	}
}

/**
* SceneHandler class
* 
* Tracks and manages all scenes.
*/
class SceneHandler {
	constructor(initialScene, sceneContext) {
		this.current = initialScene;
		this.sceneContext = sceneContext || false
		this.scenes = {}
	}

	add(name, cb) {
		this.scenes[name] = new Scene(cb, this.sceneContext)
		return this.scenes[name]
	}

	change(newScene) {
		const scene = this.scenes[newScene]
		if (!scene) {
			throw {
				message: "Invalid scene name: " + newScene
			}
		}
		this.current = scene
		this.current.start()
	}

	update() {
		this.current.update()
	}
}
