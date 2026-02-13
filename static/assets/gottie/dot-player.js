import {
  DotLottie,
  DotLottieWorker
} from "/assets/libs/dotlottie.js";

const PLAY = "play"
const PAUSE = "pause"
const LOOPON = "loop-on"
const LOOPOFF = "loop-off"
const FSENTER = "fullscreen-enter"
const FSEXIT = "fullscreen-exit"

class DotPlayer {
  cfg = {
		renderConfig: {
			autoResize: true,
		},
		layout: {
			fit: 'contain',
			align: [0, 0],
		}
	};
  dot;
  noControls = false;
	aspectRatio = '16/9';
  params;
  playBtn;
	pauseBtn;
  loopBtn;
  fullscreenBtn;
  speedSel;
  timelineRange;
  ctrls;
  ctrlsDiv;
  animSel;
  settingsBtn;
  settingsMenu;
	settingsContent;
  assetDir = '/assets/';

  constructor() {
    DotLottie.setWasmUrl(window.location.origin + this.assetDir + 'libs/dotlottie-player.wasm');
    this.player = document.querySelector('.dot-player');
	  this.msgListener();
  }
	
	parseCfg(params) {
		this.params = params
    if (this.params.has("Autoplay")) {
      this.cfg.autoplay = true;
    }
    if (this.params.has("Loop")) {
      this.cfg.loop = true;
    }
    if (this.params.has("NoControls")) {
      this.noControls = true;
    }
    if (this.params.has("Src")) {
      this.cfg.src = window.location.origin + this.params.get('Src');
    }
    if (this.params.has("Mode")) {
      this.cfg.mode = this.params.get('Mode')
    }
    if (this.params.has("Speed")) {
      this.cfg.speed = parseFloat(this.params.get('Speed'));
    }
    if (this.params.has("AssetDir")) {
      this.assetDir = this.params.get('AssetDir');
    }
    if (this.params.has("AspectRatio")) {
      this.aspectRatio = this.params.get('AspectRatio');
    }
	}
	getCfg(key) {
    if (this.params.has(key)) {
      return this.params.get(key)
    }
		return ''
	}

  init(id) {
	  document.body.style = this.aspectRatio ? `aspect-ratio: ${this.aspectRatio}` : ''
    const params = new URLSearchParams(window.location.search);
	  this.parseCfg(params);
    const playerDiv = document.getElementById(id);
	  playerDiv.style = this.aspectRatio ? `aspect-ratio: ${this.aspectRatio}` : ''
    const canvasDiv = document.createElement('div');
    canvasDiv.className = "dotlottie-player";
    canvasDiv.appendChild(this.createCanvas());
    this.dot = new DotLottieWorker(this.cfg);

    playerDiv.appendChild(canvasDiv);

    this.dot?.addEventListener('load', () => {
      console.log("loaded");
      if (!this.noControls) {
				this.appendCtrlsDiv(canvasDiv);
        this.addCtrlsListeners();
      };
    });
  }
	createCanvas() {
    let canvas = document.createElement('canvas');
    canvas.className = "dotlottie-canvas";
		canvas.style = 'width: 100%; height: 100%;'
    this.cfg.canvas = canvas;
		return canvas
	}
	msgListener() {
    window.addEventListener('message', (e) => {
			for (const [key, value] of Object.entries(e.data)) {
				switch (key) {
					case 'src':
						break;
				}
			}
		});
	}
  sendMsg(data) {
    if (window.parent !== window) {
      window.parent?.postMessage(data, "*")
    }
  }
  appendCtrlsDiv(playerDiv) {
    const ctrls = document.createElement('div');
    ctrls.className = 'controls-container';
	  ctrls.appendChild(this.ctrlsTmpl());
    playerDiv.appendChild(ctrls);
  }

  addCtrlsListeners() {
    this.dot?.addEventListener('stop', () => {
    });
    this.dot?.addEventListener('play', () => {
    });
    this.dot?.addEventListener('pause', () => {
    });
    this.dot?.addEventListener('complete', () => {
    });
    this.dot?.addEventListener('frame', ({ currentFrame }) => {
      this.timelineRange.value = currentFrame;
    });
  }

  get animState() {
    switch (true) {
      case this.dot?.isPlaying:
        return "playing"
        break
      case this.dot?.isStopped:
        return "stopped"
        break
      case this.dot?.isPaused:
        return "paused"
        break
    };
  }
  ctrlsTmpl() {
	  let ctrls = document.createElement('div')
	  ctrls.className = 'controls'
	  ctrls.appendChild(this.leftCtrls())
	  ctrls.appendChild(this.middleCtrls())
	  ctrls.appendChild(this.rightCtrls())
	  return ctrls
  }
	createCtrlBtn(label, state) {
	  let btn = document.createElement('button');
		btn.className = `control-btn ${label}-btn`
		btn.setAttribute('data-state', state)
		btn.setAttribute('title', label)
		return btn
	}
	leftCtrls() {
		let ctrl = document.createElement("div")
		ctrl.className = 'left-controls'
		this.playBtnTmpl()
		this.pauseBtnTmpl()
		this.loopBtnTmpl()
		ctrl.appendChild(this.playBtn)
		ctrl.appendChild(this.pauseBtn)
		ctrl.appendChild(this.loopBtn)
		return ctrl
	}
  playBtnTmpl() {
		this.playBtn = this.createCtrlBtn(PLAY, 'playing');
    this.playBtn.addEventListener('click', (e) => {
      this.setPlayingState('playing');
    });
  }
  pauseBtnTmpl() {
		this.pauseBtn = this.createCtrlBtn(PAUSE, 'paused');
    this.pauseBtn.addEventListener('click', (e) => {
      this.setPlayingState('paused');
    });
  }
  togglePlaying() {
    let state = this.animState;
    switch (state) {
      case 'playing':
        this.setPlayingState('paused')
        break;
      case 'paused':
        this.setPlayingState('playing')
        break;
      case 'stopped':
        this.setPlayingState('playing')
        break;
    };
  }
  setPlayingState(state) {
    switch (state) {
      case 'playing':
        this.dot?.play();
        break;
      case 'paused':
        this.dot?.pause();
        break;
      case 'stopped':
        this.dot?.stop();
        break;
    };
  }

  loopBtnTmpl() {
		let loop = this.cfg?.loop ? LOOPON : LOOPOFF;
		this.loopBtn = this.createCtrlBtn('loop', loop);
    this.loopBtn.addEventListener('click', (e) => {
      this.toggleLooping();
    });
  }
  toggleLooping() {
    this.dot?.setLoop(!this.dot?.loop);
		this.loopBtn.setAttribute("data-state", this.dot.loop ? "loop-off" : "loop-on");
  }

	middleCtrls() {
		let ctrl = document.createElement("div")
		ctrl.className = 'middle-controls'
		this.timelineTmpl();
		ctrl.appendChild(this.timelineRange)
		return ctrl
	}
  timelineTmpl() {
		this.timelineRange = document.createElement('input')
		this.timelineRange.type = 'range'
		this.timelineRange.className = 'timeline-slider'
		this.timelineRange.min = 0;
		this.timelineRange.value = 0;
		this.timelineRange.step = 1;
		this.timelineRange.max = this.dot?.totalFrames-1
    this.timelineRange.addEventListener('input', (e) => {
      this.dot?.setFrame(e.target.value);
      if (this.dot?.isPlaying) {
        this.dot?.pause();
      };
    });
  }
  animsTmpl(item, animations) {
	  this.animSel = document.createElement('select')
	  this.animSel.className = 'anim-selector'
		animations?.forEach((a) => {
		var opt = document.createElement('option');
		opt.innerText = a;
			this.animSel.appendChild(opt)
		});
		this.animSel.addEventListener('change', (e) => {
			this.dot?.loadAnimation(e.target.value);
		});
	  item.appendChild(this.animSel)
	  return item
  }

	rightCtrls() {
		let ctrl = document.createElement("div")
		ctrl.className = 'right-controls'
		this.fullscreenBtnTmpl();
		this.speedSelectTmpl();
		let hasSettings = this.settingsTmpl();
		if (hasSettings) {
			console.log(hasSettings)
			ctrl.appendChild(this.settingsMenu);
		}
		ctrl.appendChild(this.speedSel);
		ctrl.appendChild(this.fullscreenBtn);
		return ctrl
	}
  settingsTmpl() {
	  let items = [];
		var animations = this.dot?.manifest?.animations?.map((x) => x.id)
		if (animations.length > 1) {
			let animsItem = this.newSettingsItem("anims");
			this.animsTmpl(animsItem, animations)
			items.push(animsItem)
		}
	  if (items.length > 0) {
			this.settingsMenu = document.createElement('div')
			this.settingsMenu.className = 'settings-menu'
			this.settingsMenu.setAttribute('data-state', 'hidden');
			this.settingsBtn = this.createCtrlBtn('settings', '')
			this.settingsMenu.appendChild(this.settingsBtn);
			this.settingsBtn.addEventListener('click', (e) => {
				this.toggleMenu()
				this.settingsMenu.classList.toggle('active');
			});
			this.settingsContent = document.createElement('div');
			this.settingsContent.className = 'settings-content'
			this.settingsContent.setAttribute('data-state', 'hidden');
				//this.settingsContent.appendChild(animsItem)
			this.settingsMenu.appendChild(this.settingsContent);
			return true
		}
	  return false
  }
	toggleMenu(e) {
		let visible = this.settingsMenu.dataset.state
    switch (visible) {
      case 'hide':
				this.settingsMenu.dataset.state = 'visible';
        break;
      case 'visible':
		    let i = document.querySelector('.anims-settings')
		    console.log(i)
				this.settingsMenu.dataset.state = 'hidden';
        break;
		};
	}
	
	newSettingsItem(label) {
		let item = document.createElement('div');
		item.className = `settings-item ${label}-settings`
		let lbl = document.createElement('span');
		lbl.className = "settings-label"
		lbl.textContent = label
		item.appendChild(lbl)
		return item
	}

  speedSelectTmpl() {
		this.speedSel = document.createElement('select')
		this.speedSel.className = 'speed-selector'
	  let speeds = ["0.5", "0.75", "1", "1.25", "1.5"]
	  speeds.forEach((s) => {
		  let opt = document.createElement('option')
		  opt.value = s
		  opt.textContent = s+'x'
		  if (s == "1") {
			  opt.selected = true
			}
		  this.speedSel.appendChild(opt)
		})
    this.speedSel.addEventListener('change', (e) => {
      this.dot?.setSpeed(parseFloat(e.target.value));
    });
  }
  fullscreenBtnTmpl() {
		this.fullscreenBtn = this.createCtrlBtn('fullscreen', FSENTER);
    this.fullscreenBtn.addEventListener('click', (e) => {
      this.toggleFullscreen(e)
    });
  }
  toggleFullscreen(e) {
    if (!document.fullscreenElement) {
      this.player.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
			e.target.dataset.state = FSEXIT;
    } else {
      document.exitFullscreen();
			e.target.dataset.state = FSENTER;
    };
  }

}

export {
  DotPlayer
}
