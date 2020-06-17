const { app, BrowserWindow, Menu, ipcMain, Tray } = require('electron')
const log = require('electron-log')
const path = require('path')
const Store = require('./Store')

// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let tray

//init store and defaults
const store = new Store({
	//this will be the file name + .json
	configName: 'user-settings',
	defaults: {
		settings: {
			cpuOverload: 80,
			alertFreq: 5,
		},
	},
})

function createMainWindow() {
	mainWindow = new BrowserWindow({
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
		show: false,
		opacity: 0.9,
	})

	if (isDev) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
	createMainWindow()

	//fires when dom is ready!
	mainWindow.webContents.on('dom-ready', () => {
		mainWindow.webContents.send('settings:get', store.get('settings'))
	})

	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)

	const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png')

	//create tray instance
	tray = new Tray(icon)
	tray.on('click', () => {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
		} else {
			mainWindow.show()
		}
	})
})

const menu = [
	...(isMac ? [{ role: 'appMenu' }] : []),
	{
		role: 'fileMenu',
	},
	...(isDev
		? [
				{
					label: 'Developer',
					submenu: [
						{ role: 'reload' },
						{ role: 'forcereload' },
						{ type: 'separator' },
						{ role: 'toggledevtools' },
					],
				},
		  ]
		: []),
]

//set new settings
ipcMain.on('settings:set', (e, value) => {
	store.set('settings', value)
	mainWindow.webContents.send('settings:get', store.get('settings'))
})

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow()
	}
})

app.allowRendererProcessReuse = true
