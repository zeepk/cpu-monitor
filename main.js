const { app, BrowserWindow, Menu } = require('electron')
const log = require('electron-log')
const os = require('os')

// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

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
	})

	if (isDev) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
	createMainWindow()

	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)
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
