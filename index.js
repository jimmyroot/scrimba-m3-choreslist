import { v4 as uuidv4 } from 'https://jspm.dev/uuid'
import { gifs } from './gifs.js'

// Init element references
const inputChore = document.getElementById('input-chore')
const btnAdd = document.getElementById('btn-add')
const btnDeleteCompletedChores = document.getElementById('btn-del-complete')
const btnDeleteAllChores = document.getElementById('btn-del-all')
const btnModalOk = document.getElementById('btn-modal-ok')
const btnModalCancel = document.getElementById('btn-modal-cancel')
const ulChores = document.getElementById('ul-choreslist')
const toggleHideComplete = document.getElementById('toggle-hide-complete')
const toggleDarkMode = document.getElementById('toggle-dark-mode')

// Init vars
let chores = []
let defaultTheme = 'light'


// Set up event listeners
ulChores.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
        toggleChoreComplete(e.target)
    }
})

btnAdd.addEventListener('click', () => {
    Boolean(inputChore.value) ? addChore() : alertFieldEmpty(inputChore)
})

btnDeleteAllChores.addEventListener('click', () => {
    showResetModal(true)
})

btnDeleteCompletedChores.addEventListener('click', () => {
    deleteCompletedChores()
})

btnModalOk.addEventListener('click', () => {
    deleteAllChores()
    showResetModal(false)
})

btnModalCancel.addEventListener('click', () => {
    showResetModal(false)
})

toggleHideComplete.addEventListener('change', () => {
    // Small delay before re-render to sync up with toggle animation
    setTimeout(() => {
        render(chores)
    }, 200)
})

toggleDarkMode.addEventListener('change', () => {
    // Small delay before re-render to sync up with toggle animation
    setTimeout(() => {
        toggleTheme()
    }, 200)
})

// Main render function
const render = (arr) => {
    // Check if hide completed tasks filter is on, if it is then filter chores by chore.isDone
    if (toggleHideComplete.checked) arr = arr.filter(chore => !chore.isDone)
    // Use map to create the html
    if (arr.length > 0) {
        const listHtml = arr.map(chore => {
            return `
                <li class="li-chore ${chore.isDone ? 'completed' : ''}" data-id="${chore.id}">
                    ${chore.choreText}
                </li>
            `
        }).join('')
        ulChores.innerHTML = listHtml

        // Set button states depending on if we are displaying completed chores
        if (arr.some(chore => chore.isDone === true)) {
            enableButtons([btnDeleteCompletedChores, btnDeleteAllChores], true)
        } else {
            enableButtons([btnDeleteAllChores], true)
            enableButtons([btnDeleteCompletedChores], false)
        }
    } else {
        // Show empty chore list message and didsable buttons
        ulChores.innerHTML = `<li class="empty-list">You're all caught up!</li>`
        enableButtons([btnDeleteCompletedChores, btnDeleteAllChores], false)
    }
}

// Init the chores array from local storage if it exists
const initChoresArr = () => {
    const localChores = JSON.parse(localStorage.getItem('chores'))
    chores = localChores || []
}

const addChore = () => {
    // Get a bool of true or false if the chore we are trying to add already exists
    const choreExists = chores.filter(chore => chore.choreText === inputChore.value).length > 0
    
    // If chore doesn't exist, create it, unshift it to the array
    if (!choreExists) {
        const newChore = {
            choreText: inputChore.value,
            isDone: false,
            id: uuidv4()
        }
        chores.unshift(newChore)
        updateChoresInLocalStorage(chores)
        render(chores)
    } else {
        // Let the user know the chore already exists
        inputChore.setAttribute('placeholder', 'Chore is already on the list!')
        setTimeout(() => {
            inputChore.setAttribute('placeholder', 'Do dishes')
        }, 1500)
    }
    clearInputField()
}

// Toggle chore status
const toggleChoreComplete = (target) => {
    // markup the chore as complete and grab the id
    target.classList.toggle('completed')
    const targetChoreID = target.dataset.id
    // update the chore status in the array, flip it's status
    const targetChore = chores[chores.findIndex(chore => chore.id === targetChoreID)]
    targetChore.isDone = !targetChore.isDone
    updateChoresInLocalStorage(chores)
    render(chores)
}

// Delete chores who's isDone is true
const deleteCompletedChores = () => {
    // get a new array with only unfinished items
    chores = chores.filter(chore => !chore.isDone)
    // if there are no chores left, treat the user to a gif!
    if (!chores.length > 0) showGifModal(gifs)
    updateChoresInLocalStorage(chores)
    render(chores)
}

// Delete all chores and treat the user to a gif
const deleteAllChores = () => {
    chores = []
    showGifModal(gifs)
    updateChoresInLocalStorage(chores)
    render(chores)
}

// Local storage stuff
const updateChoresInLocalStorage = (chores) => {
    // If there are chores, write them to local storage, else clean up the object
    chores.length > 0 ? localStorage.setItem('chores', JSON.stringify(chores)) : localStorage.removeItem('chores')
}

// Helper functions

// Set up a little animation to blink a border on the input field, we'll 
// call this if user tries to enter an empty chore
const alertFieldEmpty = (element) => {
    const interval = 80
    const count = 14
    setLimitedInterval(() => {
        element.classList.toggle('is-empty-warning')
    }, interval, count)
    enableButtons([btnAdd], false)
    setTimeout(() => {
        enableButtons([btnAdd], true)
    }, interval * count)
}

// This function lets us call setTimeout a limited number of times, so 
// we can control how long the 'empty field' animation runs for 
const setLimitedInterval = (fn, delay, times) => {
    if(!times) return
    setTimeout(() => {
        fn() 
        setLimitedInterval(fn, delay, times-1)
    }, delay)
}

const clearInputField = () => {
    inputChore.value = ''
}

// takes an array of button elements so we can bulk enable/disable buttons
const enableButtons = (buttons, doEnable) => {
    buttons.length > 0 && buttons.forEach(button => button.disabled = !doEnable)
}

// Display warning modal
const showResetModal = (show) => {
    const divModal = document.getElementById('div-modal')
    divModal.style.display = show ? 'inline' : 'none'
}

// Show the gif modal with a random gif from our list
const showGifModal = (gifArr) => {
    console.log('firing')
    const divGifModal = document.getElementById('div-gif-modal')
    const randomGif = Math.floor(Math.random() * gifArr.length)
    const imgURL = `${gifArr[randomGif]}`
    const html = `
        <picture>
            <img src="${imgURL}" alt="Animated gif to say congratulations on finishing your jobs!">
        </picture>
    `
    divGifModal.innerHTML = html
    divGifModal.style.display = 'inline'
    setTimeout(() => {
        divGifModal.style.display = 'none'
    }, 4000)
}

// Theme functions
const setTheme = (theme = defaultTheme) => {
    localStorage.setItem('choreslistTheme', theme)
    document.documentElement.className = theme
}

const toggleTheme = () => {
    localStorage.getItem('choreslistTheme') === 'light' ? setTheme('dark') : setTheme('light')
}

initChoresArr()
setTheme()
render(chores)