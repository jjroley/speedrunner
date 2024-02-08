/**
 * KeyManager class
 *
 * Handles everything relating to keys.
 */

class KeyManager {
	constructor() {
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

	register(key, name, keyCode) {
		this.keys[key] =  { keyCode: keyCode, name: name }
		this.keyCodeMap[keyCode] = key
	}

	isKeyPressed(selector, state) {
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

	pressed(selector) {
			return this.isKeyPressed(selector, this.current)
	}

	pressStart(selector) {
			return (
					this.isKeyPressed(selector, this.current) &&
					!this.isKeyPressed(selector, this.prev)
			)
	}

	pressEnd(selector) {
			return (
					!this.isKeyPressed(selector, this.current) &&
					this.isKeyPressed(selector, this.prev)
			)
	}

	keyPressed(keyCode) {
			this.current[keyCode] = true
	}
	
	keyReleased(keyCode) {
			delete this.current[keyCode]
	}

	update() {
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
	parseSpeedrun(speedrun) {
			const keys = speedrun.split(',');
			const output = {};
			for(let i = 0; i < keys.length; i++) {
					var data = keys[i];
					var keyCode = Number(data.slice(0, 2));
					output[keyCode] = this.parseKeyPresses(data.slice(2));
			}
			return output;
	}
	parseKeyPresses(data) {
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
	updateSpeedrun(keyCode) {
			this.verboseSpeedrun[keyCode] = this.verboseSpeedrun[keyCode] || []
			this.verboseSpeedrun[keyCode].push(this.speedrunTimer)
	}
	buildSpeedrunString(arr) {
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
	startRecording() {
			this.isRecording = true;
			this.speedrunData = {};
			this.speedrunTimer = 0;
	}
	stopRecording() {
			this.isRecording = false;
			this.speedrunData = this.buildSpeedrunObject(this.verboseSpeedrun)
	}
	buildSpeedrunObject(verboseSpeedrun) {
			const data = {}
			for(const keyCode in verboseSpeedrun) {
					data[keyCode] = this.buildSpeedrunString(verboseSpeedrun[keyCode])
			}
			return data
	}
	printSpeedrun() {
			const output = Object.entries(this.speedrunData).map(([keyCode, data]) => {
					return keyCode + data;
			})
			
			console.log(output.join(','));
	}
	loadSpeedrun(name, speedrun) {
			this.speedruns[name] = speedrun
	}
	playSpeedrun(name) {
			this.speedrunInProgress = true;
			this.speedrun = typeof this.speedruns[name] === 'string' ? this.parseSpeedrun(this.speedruns[name]) : this.speedruns[name];
			this.isRecording = false;
			this.speedrunTimer = 0;
	}
}
