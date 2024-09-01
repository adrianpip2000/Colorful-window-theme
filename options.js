const reg = /^#([0-9a-f]{3}){1,2}$/i;
function validateHEX (inString) {
    return reg.test(inString);
}
function validateHEXarray (inArray) {
    for (let i = 0; i < inArray.length; i++) {
        if (!reg.test(inArray[i])) {
            return false;
        }
    }
    return true;
}


async function saveOptions(e, refreshFlipIn = false) {
    e.preventDefault();
    let customColorArray = document.querySelector('#pref_custom_colors').value.split('\n').filter(element => element);
    if (validateHEXarray(customColorArray)) {
        document.querySelector('#pref_custom_colors').style.color = '';
        await browser.storage.local.set({
            colorfulSettings: {
                useCustomColors: document.querySelector('#pref_use_custom_colors').checked,
                useDarkMode: document.querySelector('#pref_use_darkmode').checked,
                customColors: document.querySelector('#pref_custom_colors').value,
                refreshFlip: refreshFlipIn,
            },
        });
    }else {
        document.querySelector('#pref_custom_colors').style.color = 'red';
        document.querySelector('#pref_use_custom_colors').checked = false;
        await browser.storage.local.set({
            colorfulSettings: {
                useCustomColors: document.querySelector('#pref_use_custom_colors').checked,
                useDarkMode: document.querySelector('#pref_use_darkmode').checked,
                //customColors: document.querySelector('#pref_custom_colors').value,
                refreshFlip: refreshFlipIn,
            },
        });
        console.warn('Invalid HEX entered in custom color list!')
    }
    /*console.log(document.querySelector('#pref_use_custom_colors').checked);
    console.log(document.querySelector('#pref_use_darkmode').checked);
    console.log(document.querySelector('#pref_custom_colors').value.split('\n').filter(element => element));*/
    //console.log('Saved settings');
}


async function restoreOptions() {
    //e.preventDefault();
    let res = await browser.storage.local.get('colorfulSettings');
    //console.log('Restored settings');
    document.querySelector('#pref_use_custom_colors').checked = res.colorfulSettings.useCustomColors || false;
    document.querySelector('#pref_use_darkmode').checked = res.colorfulSettings.useDarkMode || false;
    document.querySelector('#pref_custom_colors').value = res.colorfulSettings.customColors || '';
}

async function setDefaultOptions() {
    await browser.storage.local.set({
        colorfulSettings: {
            useCustomColors: false,
            useDarkMode: false,
            customColors: "",
            refreshFlip: false,
        },
    });
}

async function refreshSaveOptions(e) {
    //e.preventDefault();
    await browser.storage.local.get('colorfulSettings').then(async (items) => {
        if ('refreshFlip' in items.colorfulSettings) {
            await saveOptions(e,!items.colorfulSettings.refreshFlip);
        }
    })
    .catch(error => {
        console.error(`Error in refreshSaveOptions: ${error}`);
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#pref_use_custom_colors').addEventListener('change', saveOptions);
document.querySelector('#pref_use_darkmode').addEventListener('change', saveOptions);
document.querySelector('#pref_custom_colors').addEventListener('blur', saveOptions);
document.querySelector('#btn_refresh_colors').addEventListener('click', refreshSaveOptions);
//browser.runtime.onInstalled.addListener(setDefaultOptions);