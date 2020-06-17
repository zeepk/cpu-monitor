const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const Store = require('./Store')
const MainWindow = require('./MainWindow')
const AppTray = require('./AppTray')

// Set env
process.env.NODE_ENV = 'production'

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
	mainWindow = new MainWindow('./app/index.html', isDev)
}

app.on('ready', () => {
	createMainWindow()

	//fires when dom is ready!
	mainWindow.webContents.on('dom-ready', () => {
		mainWindow.webContents.send('settings:get', store.get('settings'))
	})

	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)

	mainWindow.on('close', (e) => {
		if (!app.isQuitting) {
			e.preventDefault()
			mainWindow.hide()
		}

		return true
	})

	const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png')

	//create tray instance
	tray = new AppTray(icon, mainWindow)
})

const menu = [
	...(isMac ? [{ role: 'appMenu' }] : []),
	{
		role: 'fileMenu',
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Toggle Nav',
				click: () => mainWindow.webContents.send('nav:toggle'),
			},
		],
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
