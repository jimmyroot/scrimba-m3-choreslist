// TODO 1: Add light/dark mode
// TODO 2: Fix up HTML
// TODO 3: Fix up CSS
// TODO 4: Any more refactoring in JS?

const inputChore = document.getElementById('input-chore')
const btnAdd = document.getElementById('btn-add')
const btnClearComplete = document.getElementById('btn-del-complete')
const btnReset = document.getElementById('btn-reset')
const ulChores = document.getElementById('ul-choreslist')

let chores = []

const initChoresArr = () => {
    const localChores = JSON.parse(localStorage.getItem('chores'))
    chores = localChores || []
}

ulChores.addEventListener('click', (e) => {
    if (e.target.dataset.index) {
        toggleChoreComplete(e.target)
    }
})

btnAdd.addEventListener('click', () => {
    Boolean(inputChore.value) ? addChore() : alertFieldEmpty(inputChore)
})

btnReset.addEventListener('click', () => {
    clearAllChores()
})

btnClearComplete.addEventListener('click', () => {
    clearCompleteChores()
})

const render = () => {
    if (chores.length > 0) {
        const listHtml = chores.map((chore, index) => {
            return `
                <li class="li-chore ${chore.isDone && 'completed'}" data-index="${index}">
                    ${chore.choreText}
                </li>
            `
        }).join('')
        ulChores.innerHTML = listHtml
    } else {
        ulChores.innerHTML = `<li class="empty-list">You're all caught up!</li>`
    }
}

const addChore = () => {
    choreExists = chores.filter(chore => chore.choreText === inputChore.value).length > 0
    
    if (!choreExists) {
        const newChore = {
            choreText: inputChore.value,
            isDone: false
        }
        chores.unshift(newChore)
        updateChoresInLocalStorage(chores)
        render()
    } else {
        inputChore.setAttribute('placeholder', 'Duplicate chore!')
        setTimeout(() => {
            inputChore.setAttribute('placeholder', 'Do dishes')
        }, 1500)
    }
    clearInputField()
}

const toggleChoreComplete = (target) => {
    target.classList.toggle('completed')
    currentChore = chores[target.dataset.index]
    currentChore.isDone = !currentChore.isDone
    updateChoresInLocalStorage(chores)
}

const clearCompleteChores = () => {
    chores = chores.filter(chore => !chore.isDone)
    updateChoresInLocalStorage(chores)
    render()
}

const clearAllChores = () => {
    chores = []
    updateChoresInLocalStorage(chores)
    render()
}

// Local storage stuff
const updateChoresInLocalStorage = (chores) => {
    chores.length > 0 ? localStorage.setItem('chores', JSON.stringify(chores)) : localStorage.removeItem('chores')
}

// Helper functions
const alertFieldEmpty = (element) => {
    setLimitedInterval(() => {
        element.classList.toggle('is-empty-warning')
    }, 80, 14)
}

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

initChoresArr()
render()