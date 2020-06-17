const { BrowserWindow } = require('electron')

class MainWindow extends BrowserWindow {
	constructor(file, isDev) {
		super({
			title: 'SysTop',
			width: isDev ? 700 : 355,
			height: 600,
			icon: './assets/icons/icon.png',
			resizable: isDev ? true : false,
			backgroundColor: 'white',
			//this lets us use node modules like CPU and such
			webPreferences: {
				nodeIntegration: true,
			},
			//pop up on open vs just open in tray
			show: true,
			opacity: 0.9,
		})
		this.loadFile(file)
		if (isDev) {
			this.webContents.openDevTools()
		}
	}
}

module.exports = MainWindow
