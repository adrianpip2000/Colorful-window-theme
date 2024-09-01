const DEBUG = true;

/*------------------------------------------------------------------------------*/

class BasicColorTheme {
    constructor(frame, tab_background_text = '#111') {
        this.frame = frame;
        this.tab_background_text = tab_background_text;
        this.usage = 0;
        this.lastUsed = Math.random();
    }

    get browserThemeObject() {
        return {
            colors: {
                frame: this.frame,
                tab_background_text: this.tab_background_text,
            }
        };
    }
}

//Colors in this class are largely based on the built-in Firefox dark theme
class BasicColorThemeDark {
    constructor(frame, tab_background_text = '#fbfbfe') {
        this.frame = frame;
        this.tab_background_text = tab_background_text;
        this.usage = 0;
        this.lastUsed = Math.random();
    }

    get browserThemeObject() {
        return {
            colors: {
                frame: this.frame,
                tab_background_text: this.tab_background_text,
                //tab_text: this.tab_background_text,
                icons: 'rgb(251,251,254)',
                //frame: 'rgb(28, 27, 34)',
                frame_inactive: `color-mix(in srgb, black 15%,${this.frame})`,
                popup: 'rgb(66,65,77)',
                popup_text: 'rgb(251,251,254)',
                popup_border: 'rgb(82,82,94)',
                popup_highlight: 'rgb(43,42,51)',
                tab_line: 'transparent',
                tab_selected: 'rgba(210,210,210,.20)',
                //toolbar: `color-mix(in srgb, white 10%,${this.frame})`,
                toolbar: 'rgba(210,210,210,.15)',
                toolbar_top_separator: 'transparent',
                toolbar_bottom_separator: `color-mix(in srgb, black 50%,${this.frame})`,
                toolbar_field: 'rgb(28,27,34)',
                toolbar_field_border: 'transparent',
                toolbar_field_text: 'rgb(251,251,254)',
                toolbar_field_focus: 'rgb(66,65,77)',
                toolbar_text: 'rgb(251,251,254)',
                ntp_background: 'rgb(43,42,51)',
                ntp_card_background: 'rgb(66,65,77)',
                ntp_text: 'rgb(251,251,254)',
                sidebar: '#38383D',
                sidebar_text: 'rgb(249,249,250)',
                sidebar_border: 'rgba(255,255,255,0.1)',
                button: 'rgba(0,0,0,.33)',
                button_hover: 'rgba(207,207,216,.20)',
                button_active: 'rgba(207,207,216,.40)',
                button_primary: 'rgb(0,221,255)',
                button_primary_hover: 'rgb(128,235,255)',
                button_primary_active: 'rgb(170,242,255)',
                button_primary_color: 'rgb(43,42,51)',
                input_background: '#42414D',
                input_color: 'rgb(251,251,254)',
                urlbar_popup_separator: 'rgb(82,82,94)',
                tab_icon_overlay_stroke: 'rgb(66,65,77)',
                tab_icon_overlay_fill: 'rgb(251,251,254)',
            },
            properties: {
                color_scheme: 'dark',
            }
        };
    }
}

let themeOfWindowID = new Map();
const ALL_THEMES = [
    new BasicColorTheme('#ec5f67'),
    new BasicColorTheme('#f99157'),
    new BasicColorTheme('#fac863'),
    new BasicColorTheme('#99c794'),
    new BasicColorTheme('#5fb3b3'),
    new BasicColorTheme('#6699cc'),
    new BasicColorTheme('#c594c5'),
];
const ALL_THEMES_DARK = [
    new BasicColorThemeDark('#341b1b'),
    new BasicColorThemeDark('#352318'),
    new BasicColorThemeDark('#352c1b'),
    new BasicColorThemeDark('#242c23'),
    new BasicColorThemeDark('#1b2828'),
    new BasicColorThemeDark('#1c242d'),
    new BasicColorThemeDark('#2b232b'),
];
const ALL_THEMES_DARK_lighter = [       //unused
    new BasicColorThemeDark('#4b2425'),
    new BasicColorThemeDark('#4e3121'),
    new BasicColorThemeDark('#4e3f25'),
    new BasicColorThemeDark('#333f31'),
    new BasicColorThemeDark('#243a3a'),
    new BasicColorThemeDark('#263341'),
    new BasicColorThemeDark('#3f313f'),
];
var ALL_THEMES_CUSTOM;
var CURRENT_THEME;

var settings = {};
var useCustomColorsBool = 0;
var useDarkModeBool = 0;
var customColorsList = "";
var customColorsArray = [];

async function setDefaultSettings() {
    settings = {};
    useCustomColorsBool = 0;
    useDarkModeBool = 0;
    customColorsList = "";
    customColorsArray = [];
    const defaultSettings = {
        useCustomColors: useCustomColorsBool,
        useDarkMode: useDarkModeBool,
        customColors: customColorsList
    };
    return browser.storage.local.set({colorfulSettings: defaultSettings});
}

async function getSettings() {
    try {
        let items = await browser.storage.local.get('colorfulSettings');
        settings = items;
        useCustomColorsBool = settings.colorfulSettings.useCustomColors;
        useDarkModeBool = settings.colorfulSettings.useDarkMode;
        customColorsList = settings.colorfulSettings.customColors;
        customColorsArray = customColorsList.split('\n').filter(element => element);
        return;
    } catch (error) {
        //console.warn(`Error in getSettings: ${error}`);
        if(DEBUG){console.info('Previous settings not found. Attempting to set default settings.');}
        try {
            await setDefaultSettings();
            if(DEBUG){console.info('Default settings were set.');}
            browser.storage.onChanged.addListener(applyThemeToAllWindows);
        } catch (errorSetDefaultSettings) {
            console.error(`Error in setDefaultSettings: ${errorSetDefaultSettings}`);
            throw errorSetDefaultSettings;
        }
    }
}

async function makeTheme() {
    if(DEBUG){console.debug("2 - inside makeTheme");}
    await getSettings();
    let numCustomColors = customColorsArray.length;
    if ((useCustomColorsBool == true) && (numCustomColors != 0)) {
        if (useDarkModeBool) {
            if(DEBUG){console.log("Using custom colors dark mode");}
            ALL_THEMES_CUSTOM = [];
            for (let i = 0; i < customColorsArray.length; i++) {
                ALL_THEMES_CUSTOM[i] = new BasicColorThemeDark(customColorsArray[i]);
            }
        }else {
            if(DEBUG){console.log("Using custom colors light mode");}
            ALL_THEMES_CUSTOM = [];
            for (let i = 0; i < customColorsArray.length; i++) {
                ALL_THEMES_CUSTOM[i] = new BasicColorTheme(customColorsArray[i]);
            }
        }
        CURRENT_THEME = [...ALL_THEMES_CUSTOM];
    }else if (useDarkModeBool) {
        if(DEBUG){console.log("Using dark mode");}
        CURRENT_THEME = [...ALL_THEMES_DARK];
    }else {
        if(DEBUG){console.log("Using light mode");}
        CURRENT_THEME = [...ALL_THEMES];
    }
    if(DEBUG){console.debug("3 - end of makeTheme");}
    return CURRENT_THEME; //unused return, but it resolves promise upstream
}

function getNextTheme() {
    var sortedThemes = [...CURRENT_THEME];
    //sortedThemes = [...ALL_THEMES];
    sortedThemes.sort((a, b) => {
        if (a.usage == b.usage) {
            return a.lastUsed > b.lastUsed;
        }
        return a.usage > b.usage;
    });
    return sortedThemes[0];
}

function applyThemeToWindow(window) {
    var newTheme = getNextTheme();
    browser.theme.update(window.id, newTheme.browserThemeObject);

    newTheme.usage += 1;
    newTheme.lastUsed = Date.now();
    themeOfWindowID.set(window.id, newTheme);
}

async function applyThemeToAllWindows() {
    if(DEBUG){console.debug('1- before makeTheme');}
    await makeTheme();
    if(DEBUG){console.debug("4 - after makeTheme");}
    for (const window of await browser.windows.getAll()) {
        applyThemeToWindow(window);
    }
}

function freeThemeOfDestroyedWindow(window_id) {
    const theme = themeOfWindowID.get(window_id);
    theme.usage -= 1;
    themeOfWindowID.delete(window_id);
}

browser.windows.onCreated.addListener(applyThemeToWindow);
browser.windows.onRemoved.addListener(freeThemeOfDestroyedWindow);
browser.runtime.onStartup.addListener(applyThemeToAllWindows);
browser.runtime.onInstalled.addListener(applyThemeToAllWindows);
// browser.storage.onChanged.addListener(applyThemeToAllWindows);