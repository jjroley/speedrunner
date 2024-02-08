
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
