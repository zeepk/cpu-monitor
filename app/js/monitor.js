const path = require('path')
const { ipcRenderer } = require('electron')
const osu = require('node-os-utils')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload
let alertFreq

//get settings and values
ipcRenderer.on('settings:get', (e, settings) => {
	cpuOverload = +settings.cpuOverload
	alertFreq = +settings.alertFreq
})

//run every x seconds
setInterval(() => {
	//cpu usage
	cpu.usage().then((info) => {
		document.getElementById('cpu-usage').innerText = `${info}%`

		document.getElementById('cpu-progress').style.width = info + '%'

		//make progress bar red if overload
		if (info > cpuOverload) {
			//overload!!!
			document.getElementById('cpu-progress').style.background = 'red'
		} else {
			document.getElementById('cpu-progress').style.background = '#30c88b'
		}

		//check overload
		if (info >= cpuOverload && runNotify(alertFreq)) {
			notify({
				title: 'CPU Overload',
				body: `CPU is over ${cpuOverload}%`,
				icon: path.join(__dirname, 'img', 'icon.png'),
			})

			//store timestamp of current datetime
			localStorage.setItem('lastNotify', +new Date())
		}
	})

	//cpu free
	cpu.free().then((info) => {
		document.getElementById('cpu-free').innerText = `${info}%`
	})

	//show uptime
	document.getElementById('sys-uptime').innerText = secondsFormat(os.uptime())
}, 2000)

//set model
document.getElementById('cpu-model').innerText = cpu.model()

//computer name
document.getElementById('comp-name').innerText = os.hostname()

//operating system
document.getElementById('os').innerText = `${
	os.type() === 'Darwin' ? 'Mac OS' : os.type()
} ${os.arch()}`

//total mem
mem.info().then((info) => {
	document.getElementById('mem-total').innerText = `${info.totalMemMb} mb`
})

//show uptime
function secondsFormat(seconds) {
	seconds = +seconds
	const d = Math.floor(seconds / (3600 * 24))
	const h = Math.floor((seconds % (3600 * 24)) / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)
	return `${d}d, ${h}h, ${m}m, ${s}s`
}

//send notification
function notify(options) {
	new Notification(options.title, options)
}

//check how much time has passed since last notif
function runNotify(freq) {
	if (!localStorage.getItem('lastNotify')) {
		//create initial timestamp if not exist
		localStorage.setItem('lastNotify', +new Date())
		return true
	}
	const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
	const now = new Date()
	const diffTime = Math.abs(now - notifyTime)
	const minutesPassed = Math.ceil(diffTime / (1000 * 60))

	if (minutesPassed > freq) {
		return true
	} else {
		return false
	}
}
