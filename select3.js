const d = document
Element.prototype.Select3 = function(config = {}) {
    const select = this
    if (select.tagName !== 'SELECT') return false

    if (select.hasAttribute('data-select3-initialized') && select.getAttribute('data-select3-initialized') === '1') {
        if (select.nextSibling?.classList.contains('select3')) {
            select.nextSibling.remove()
        }
    }

    select.setAttribute('tab-index', '-1')

    // If any options were set, apply them
    config = Select3_applyConfig(config)

    if (select.selectedOptions.length > config.maximumSelectedOptions) {
        config.maximumSelectedOptions = select.selectedOptions.length
    }

    // TODO --> Rename
    // TODO --> minify function names to save chars
    // TODO --> Check all other TODOs

    let select3 = d.createElement('div')
    select3.classList.add('select3')
    select3.setAttribute('tab-index', '0')

    for (let cssClass of select.classList) {
        select3.classList.add(cssClass)
    }

    // Handles opening and closing
    select3.addEventListener('click', (e) => {

        // select3.focus()
        select3.querySelector('.inner')?.focus()

        // If no closest '.inner' exists, the target can only be the select3 itself, the selected-top option/tags, and the placeholder element
        if (e.target.closest('.inner') === null) {

            let closestSelect3 = e.target.closest('div.select3')
            Select3_openCloseSelect3(select, closestSelect3, config)

            for (let sel3 of d.querySelectorAll('div.select3.opened')) {
                if (!sel3.isEqualNode(closestSelect3)) {
                    Select3_closeSelect3(sel3.previousElementSibling, sel3)
                }
            }
        }
    })

    if (select.selectedOptions.length > config.maximumSelectedOptions) {
        config.maximumSelectedOptions = select.selectedOptions.length
    }

    if (select.multiple) {
        select3.classList.add('multiple')
    } else {
        select3.classList.add('single')
    }

    let inner = d.createElement('div')
    inner.classList.add('inner')

    // Search input
    if (config.search) {
        let searchWrapper = d.createElement('div')
        searchWrapper.classList.add('search-wrapper')

        let searchInput = d.createElement('input')
        searchInput.classList.add('search')
        searchInput.setAttribute('type', 'search')
        searchInput.placeholder = config.searchPlaceholder

        let previousSearchLength = 0

        searchInput.addEventListener('keyup', (e) => {
            select.dispatchEvent(new Event('select3:search'))
            let searchLength = e.target.value.length
            if (searchLength >= config.minimumInputLength || searchLength < previousSearchLength) {
                let childNodes = e.target.closest('.inner')?.querySelectorAll('span:not(.title, .no-results)')
                if (childNodes.length) {
                    Select3_filterInput(e.target.value, childNodes, select, inner, config)
                }
            }
            previousSearchLength = searchLength
        })

        searchInput.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            searchInput.focus()
        })
        searchWrapper.append(searchInput)
        inner.prepend(searchWrapper)
    }

    // TODO - check if this 'if' could be replaced with an upgraded version of 'Select3_ShowPlaceholderIfAppropriate' function
    if (select.selectedOptions.length === 0 || (select[0].value === '' && select[0].textContent === '')) {
        let placeholder = d.createElement('span')
        placeholder.classList.add('placeholder')

        let text = (config.placeholder !== '' ? config.placeholder : '\u00A0')

        if (!select.multiple && select[0].label !== '') {
            text = select[0].label
        }

        placeholder.textContent = text
        select3.querySelector('span.selected-top')?.remove()
        select3.prepend(placeholder)
    }

    d.querySelector('label[for="' + select.id + '"]')?.addEventListener('click', (e) => {
        e.preventDefault()
        select.open(e)
    })


    // ---------------------------------------------------------------
    // ------------------ Attached helper functions ------------------
    // ---------------------------------------------------------------
    select.val = function() {
        let value = []
        for (let selOpt of select.selectedOptions) {
            value.push(selOpt.value)
        }
        if (value.length > 0) {
            return select.multiple ? value : value[0]
        }
        return '';
    }

    select.open = function(e = null) {
        e?.stopPropagation()
        Select3_openSelect3(select, select3, config.dropdownMaxHeight)
    }

    select.close = function(e = null) {
        e?.stopPropagation()
        Select3_closeSelect3(select, select3)
    }

    select.toggle = function(e = null) {
        if (select3.getAttribute('data-opened') === '1') {
            select.close(e)
        } else {
            select.open(e)
        }
    }

    select.appendOptions = function(options, parent = null, e = null) { // TODO - asses the 'e' argument...is it necessary? Also 'parent'...
        if (!Array.isArray(options)) {
            throw new TypeError('Incorrect argument passed to function appendOptions! The "options" argument must be of type array.');
        }

        // let parentToAppendTo = (parent === null ? select : parent)

        const optionDefaults = {
            textContent: '',
            label: '',
            value: '',
            selected: false,
            disabled: false,
            dataset: [],
            children: [],
        }

        // TODO - 'options' should be array with
        //      - 'label' or 'textContent' ( regular option or optgroup ) - required
        //      - 'value' - required ( only for regular option )
        //      - 'selected' ( regular option )
        //      - 'disabled' ( regular option )
        //      - 'dataset' => JSON ( regular option )
        //      - 'children' => should contain array of options ( optgroup )
        //      - 'optgroup' option to specify which optgroup the option should be appended to...maybe?...use index or label of optgroup???

        for (const option of options) {
            if (option.children?.length === 0 && (!option.hasOwnProperty('value') || !Select3_isOptionValid('value', option.value))) { // Only do the value check on regular options and not optgroups
                continue
            }
            let optionConfig = optionDefaults

            for (const property in option) {
                // If 'options' argument contains a non-supported property, ignore it
                if (optionDefaults.hasOwnProperty(property)) {
                    // Only add valid properties to optionDefaults
                    if (Select3_isOptionValid(property, option[property])) {
                        optionConfig[property] = option[property]
                    }
                }
            }

            console.table(optionConfig)
            if (optionConfig.children.length === 0) { // Is regular option
                let newOption = d.createElement('option')
                for (const property in optionConfig) {
                    newOption[property] = optionConfig[property]
                }
                if ((select.multiple && select3.selectedOptionsCount >= config.maximumSelectedOptions) || (!select.multiple && select.val() !== '')) { // Deselect option if too max options are already selected
                    optionConfig.selected = false
                }
                select.append(newOption)
                Select3_appendOptions(select, select3, inner, newOption, config)
            } else { // Is optgroup - TODO --> do this recursively??...so that in the for loop below this function is just called again?
                let newOptGroup = d.createElement('optgroup')
                newOptGroup.label = optionConfig.label
                let optGroupEl = d.createElement('div')
                optGroupEl.classList.add('optgroup')
                let optGroupTitle = d.createElement('span')
                optGroupTitle.classList.add('title')
                optGroupTitle.textContent = optionConfig.label
                optGroupEl.append(optGroupTitle)

                for (const childOption of option.children) {
                    let newOption = d.createElement('option')
                    for (const property in childOption) {
                        // If 'options' argument contains a non-supported property, ignore it
                        if (optionDefaults.hasOwnProperty(property)) {
                            // Only add valid properties to optionDefaults
                            if (Select3_isOptionValid(property, childOption[property])) {
                                newOption[property] = childOption[property]
                            }
                        }
                    }

                    if ((select.multiple && select3.selectedOptionsCount >= config.maximumSelectedOptions) || (!select.multiple && select.val() !== '')) { // Deselect option if max options are already selected
                        newOption.selected = false
                    }
                    newOptGroup.append(newOption)
                    Select3_appendOptions(select, select3, optGroupEl, newOption, config)
                }
                select.append(newOptGroup)
                inner.append(optGroupEl)
            }
        }

        select3.querySelector(':scope > .placeholder')?.remove()
        Select3_showPlaceholderIfAppropriate(select, select3, config)
        Select3_initKeyboard(select, select3, config)
    }

    select.clear = function() {
        select.dispatchEvent(new Event('select3:clearing'))
        select.innerHTML = ''
        select.value = ''
        inner.querySelectorAll(':scope > :not(.placeholder, .search-wrapper)').forEach(el => {
            el.remove()
        })
        select3.selectedOptionsCount = 0
        select3.querySelectorAll('.selected-top, .placeholder')?.forEach((el) => {
            el.remove()
        })
        Select3_showPlaceholderIfAppropriate(select, select3, config)
        select.dispatchEvent(new Event('select3:clear'))
        select.dispatchEvent(new Event('change'))
        //select.close() // TODO -> decide if this should always happen or if it should be a function parameter...IT SHOULDN'T BE BECAUSE IT CAN LEAD TO RECURSION WHEN USED INSIDE 'closing' EVENT
    }

    select.destroy = function() {
        select3.remove()
        select.dispatchEvent(new Event('select3:destroy'))
        select.style.display = ''
        select.removeAttribute('tab-index')
        select.removeAttribute('data-select3-initialized')
    }

    select3.selectedOptionsCount = 0 // Custom property for tracking how many options are already selected

    for (let child of select.children) { // Append options

        if (child.tagName === 'OPTION') {
            Select3_appendOptions(select, select3, inner, child, config)
        } else if (child.tagName === 'OPTGROUP') {

            let optGroupEl = d.createElement('div')
            optGroupEl.classList.add('optgroup')

            let optGroupTitle = d.createElement('span')
            optGroupTitle.classList.add('title')
            optGroupTitle.textContent = child.label

            optGroupEl.append(optGroupTitle)

            for (let opt of child.children) {
                Select3_appendOptions(select, select3, optGroupEl, opt, config)
            }
            inner.append(optGroupEl)
        }
    }

    select3.append(inner)

    select.style.display = 'none'
    select.parentNode.insertBefore(select3, select.nextSibling)

    Select3_initKeyboard(select, select3, config)

    select.setAttribute('data-select3-initialized', '1')

    select.dispatchEvent(new Event('select3:init'))
    return select
}

function Select3_openSelect3(select, select3, configDropdownMaxHeight) {
    select.dispatchEvent(new Event('select3:opening'))
    select3.classList.add('opened')
    // select3.focus()
    select3.classList.add('opened')
    select3.setAttribute('data-opened', '1')
    let inner = select3.querySelector('.inner')
    let dropdownMaxHeight = inner.scrollHeight
    dropdownMaxHeight = dropdownMaxHeight > configDropdownMaxHeight ? configDropdownMaxHeight : dropdownMaxHeight
    inner.style.maxHeight = dropdownMaxHeight + 'px' // Here inner.offsetHeight is just the combined width of the top and bottom border
    inner.classList.remove('drop-up')

    // Determine whether the options should drop-down or drop-up
    let innerFromBottom = window.innerHeight - inner.getBoundingClientRect().top
    if (inner.offsetHeight >= innerFromBottom) {
        inner.classList.add('drop-up')
    }
    select.dispatchEvent(new Event('select3:open'))
}

function Select3_closeSelect3(select, select3) {
    select.dispatchEvent(new Event('select3:closing'))

    select3.classList.remove('opened')
    let inner = select3.querySelector('.inner')
    select3.classList.remove('opened')
    select3.setAttribute('data-opened', '0')
    inner.style.maxHeight = '0px'

    if (select3.querySelector('input.search') !== null) {
        select3.querySelector('input.search').value = ''
    }

    select3.querySelector('.no-results')?.remove()
    // Show all options again
    for (let opt of select3.querySelectorAll('.option-hidden')) {
        opt.classList.remove('option-hidden')
    }
    select.dispatchEvent(new Event('select3:close'))
}

function Select3_openCloseSelect3(select, select3, config = {}) {
    if (select3.classList.contains('opened')) {
        Select3_closeSelect3(select, select3)
    } else {
        Select3_openSelect3(select, select3, config.dropdownMaxHeight)
    }
}

function Select3_initKeyboard(select, select3, config) {
    const SPACEBAR_KEY_CODE = 32
    const ENTER_KEY_CODE = 13
    const DOWN_ARROW_KEY_CODE = 40
    const UP_ARROW_KEY_CODE = 38
    const ESCAPE_KEY_CODE = 27

    const options = select3.querySelectorAll('.inner span[data-value]:not(.disabled)')

    let focusedIndex = 0
    options[focusedIndex].classList.add('focused')

    select3.onkeydown = null
    select3.onkeydown = function(e) {
        switch(e.keyCode) {
            case SPACEBAR_KEY_CODE:
                e.preventDefault() // Prevents scrolling down of list
                Select3_openSelect3(select, select3, config.dropdownMaxHeight)
                break

            case ESCAPE_KEY_CODE:
                Select3_closeSelect3(select, select3)
                break

            case UP_ARROW_KEY_CODE:
                if (select3.getAttribute('data-opened') === '1' && focusedIndex > 0) {
                    options[focusedIndex].classList.remove('focused')
                    focusedIndex--
                    options[focusedIndex].classList.add('focused')
                }
                break

            case DOWN_ARROW_KEY_CODE:
                if (select3.getAttribute('data-opened') === '1' && focusedIndex < options.length - 1) {
                    options[focusedIndex].classList.remove('focused')
                    focusedIndex++
                    options[focusedIndex].classList.add('focused')
                }
                break

            case ENTER_KEY_CODE:
                if (select3.getAttribute('data-opened') === '1') {
                    options[focusedIndex].dispatchEvent(new Event('click'))
                }
                break
        }
    }
}

function Select3_appendOptions(select, select3, parent, opt, config) {

    let optEl = d.createElement('span')
    optEl.setAttribute('data-selected', '0')
    optEl.setAttribute('data-value', opt.value.toString())

    // Transfer data- attributes
    if (Object.keys(opt.dataset).length) {
        let optDataSet = opt.dataset
        for (const property in optDataSet) {
            optEl.setAttribute('data-' + property, optDataSet[property])
        }
    }

    if (opt.value === '' && opt.textContent === '') {
        optEl.classList.add('placeholder')
        optEl.textContent = (config.placeholder !== '' ? config.placeholder : '\u00A0')
    } else {
        // Format option if special formatting exists, else just fill option with text
        if (config.formatOptionsFunction !== null) {
            let content = d.createElement('span')
            content.append(config.formatOptionsFunction(opt))
            optEl.innerHTML = content.innerHTML
        } else {
            optEl.textContent = (opt.label.length ? opt.label : opt.textContent)
        }
    }

    if (opt.disabled) {
        optEl.classList.add('disabled')
    }

    if (opt.selected) {
        opt.selected = true // In case this option was added with 'appendOptions' function
        let cloneEl = optEl.cloneNode() // Copy selected node for use at the top of select3
        cloneEl.classList.add('selected-top')

        if (opt.value === '' && opt.textContent === '') { // For placeholder element
            cloneEl.textContent = config.placeholder;
        } else {
            cloneEl.textContent = (opt.label.length ? opt.label : opt.textContent)
        }


        if (!select.multiple) {
            select.value = opt.value
            if (select3.querySelector('.selected-top, .placeholder')?.length) {
                select3.querySelector('.selected-top, .placeholder').replaceWith(cloneEl)
            } else {
                select3.querySelector('.selected-top, .placeholder')?.remove()
                select3.prepend(cloneEl)
            }
        } else if (select.multiple && select3.selectedOptionsCount < config.maximumSelectedOptions) {
            select3.selectedOptionsCount++
            cloneEl.prepend(Select3_getCloseBtn(select, select3, config))
            select3.querySelector('.placeholder')?.remove()
            select3.prepend(cloneEl)

            select.dispatchEvent(new Event('change'))

            if (select3.selectedOptionsCount === config.maximumSelectedOptions) {
                select3.classList.add('maxed')
                select.dispatchEvent(new Event('select3:maxed'))
            }
        }
        optEl.classList.add('selected')
        optEl.setAttribute('data-selected', '1')
    }

    optEl.addEventListener('click', () => {
        // Can only do stuff if the option in the original select is not disabled
        // Or if user selects an option, whilst already having max selected options
        if (opt.disabled || select.selectedOptions.length >= config.maximumSelectedOptions && optEl.getAttribute('data-selected') === '0') return

        let cloneEl = optEl.cloneNode() // cloneEl needed for '.selected-top'
        cloneEl.innerHTML = optEl.textContent
        cloneEl.classList.add('selected-top')

        let isOptionAlreadySelected = false

        if ((!select.multiple && select.val() === cloneEl.getAttribute('data-value')) || (select.multiple && select.val().includes(cloneEl.getAttribute('data-value')))) {
            isOptionAlreadySelected = true
        }

        // TODO - CONTINUE HERE PROBABLY?? Appended options on multiple select don't work ( they don't count towards the selected options count and can each be selected multiple times )
        // ^^ This should be fixed now I think

        // Handle selecting/deselecting
        if (!select.multiple && !isOptionAlreadySelected) {
            // select.dispatchEvent(new Event('select3:selecting'))
            let children = select.querySelectorAll('option')
            for (let child of children) {
                child.selected = false
            }

            let select3Children = select3.querySelectorAll('.inner span')
            for (let child of select3Children) {
                child.classList.remove('selected')
                child.setAttribute('data-selected', '0')
            }

            opt.selected = true
            select.value = opt.value // Needed in case custom options were added
            select3.querySelector('.selected-top, .placeholder')?.replaceWith(cloneEl)
            optEl.classList.add('selected')
            optEl.setAttribute('data-selected', '1')
            select.dispatchEvent(new Event('select3:selected'))
        } else if (select.multiple) {

            if (isOptionAlreadySelected) {
                // select.dispatchEvent(new Event('select3:unselecting'))
                select3.querySelector(':scope > span[data-value="' + cloneEl.getAttribute('data-value') + '"]')?.remove()
                opt.selected = false
                optEl.classList.remove('selected')
                optEl.setAttribute('data-selected', '0')
                Select3_showPlaceholderIfAppropriate(select, select3, config)
                select.dispatchEvent(new Event('select3:unselected'))
            } else {
                // select.dispatchEvent(new Event('select3:selecting'))
                select3.insertBefore(cloneEl, select3.querySelector('.inner'))
                opt.selected = true

                optEl.classList.add('selected')
                optEl.setAttribute('data-selected', '1')

                // Only happens if the option that was just clicked was the first selected option.
                select3.querySelector(':scope > span.placeholder')?.remove()
                select.dispatchEvent(new Event('select3:selected'))
            }

            // When the maximum allowed amount of options has been selected, add class to select3 to indicate this.
            if (select.selectedOptions.length >= config.maximumSelectedOptions) {
                select3.classList.add('maxed')
                select.dispatchEvent(new Event('select3:maxed'))
            } else {
                select3.classList.remove('maxed')
            }
            cloneEl.prepend(Select3_getCloseBtn(select, select3, config))
        }

        // Trigger 'change' event on regular select only if option is not already selected. TODO - check if this is true
        select.dispatchEvent(new Event('change'))

        if (config.closeOnSelect) {
            Select3_closeSelect3(select, select3)
        }
    })
    parent.append(optEl)
}

function Select3_showPlaceholderIfAppropriate(select, select3, config) {
    if (select.selectedOptions.length === 0 && config.placeholder !== '') {
        let placeholder = d.createElement('span')
        placeholder.classList.add('placeholder')
        placeholder.textContent = config.placeholder
        select3.prepend(placeholder)
    }
}

function Select3_getCloseBtn(select, select3, config) {
    let closeBtn = d.createElement('b')
    closeBtn.classList.add('remove')
    closeBtn.textContent = '×'
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation() // Needed for multiple select when closeOnSelect is 'false'
        Select3_unselectOption(select, select3, e.target.parentElement, config)
    })
    return closeBtn
}

// TODO - consider using this in other appropriate places - 'data-selected', '0' - what did I mean by this???
function Select3_unselectOption(select, select3, option, config) {

    let value = option.getAttribute('data-value')
    select.querySelector('option[value="' + value + '"]').selected = false

    let select3Option = select3.querySelector('.inner span[data-value="' + value + '"]')

    select3Option.classList.remove('selected')
    select3Option.setAttribute('data-selected', '0')

    option.remove()

    Select3_showPlaceholderIfAppropriate(select, select3, config)

    // Needed because anytime an option is deselected by clicking on the 'x' in the tags, the <select>'s value is updated
    select.dispatchEvent(new Event('change'))
}

function Select3_filterInput(filter, options, select, inner, config) {
    filter = filter.toUpperCase()
    for (let opt of options) {
        let txtValue = opt.textContent || opt.innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            opt.classList.remove('option-hidden')
        } else {
            opt.classList.add('option-hidden')
        }

        if (opt.closest('div.optgroup') !== null) {

            let isAnyOptionVisible = false
            let siblings = opt.parentElement.querySelectorAll('span:not(.title, .no-results)')

            for (let sibling of siblings) {
                if (!sibling.classList.contains('option-hidden')) {
                    isAnyOptionVisible = true
                    break
                }
            }

            if (isAnyOptionVisible) {
                opt.closest('div.optgroup').classList.remove('option-hidden')
            } else {
                opt.closest('div.optgroup').classList.add('option-hidden')
            }
        }
    }

    // Handles 'no-results' thing when searching
    if (config.searchNoResults !== '') {
        let children = inner.querySelectorAll('span:not(.title, .no-results, .option-hidden)')

        if (children.length) {
            inner.querySelector('.no-results')?.remove()
        } else if (!children.length && !inner.querySelector('.no-results')) {
            let noResults = d.createElement('span')
            noResults.classList.add('no-results')
            noResults.textContent = config.searchNoResults
            inner.append(noResults)
        }
    }
}

function Select3_applyConfig(config) {

    /* All possible options and their default values */
    const defaultConfig = {
        search: false,
        searchPlaceholder: '',
        closeOnSelect: true,
        minimumInputLength: 3,
        dropdownMaxHeight: 280,
        maximumSelectedOptions: 100,
        placeholder: '',
        searchNoResults: '',
        formatOptionsFunction: null,
    }

    for (let property in config) {
        // If 'config' argument contains a non-supported property, ignore it
        if (defaultConfig.hasOwnProperty(property)) {
            // Only add valid properties to defaultConfig
            if (Select3_isOptionValid(property, config[property])) {
                defaultConfig[property] = config[property]
            }
        }
    }

    return defaultConfig
}

function Select3_isOptionValid(key, value) {
    switch (key) {
        case 'selected': // for options object
        case 'disabled': // for options object
        case 'search':
        case 'closeOnSelect':
            return typeof value === 'boolean'

        case 'minimumInputLength':
        case 'dropdownMaxHeight':
        case 'maximumSelectedOptions':
            return typeof value === 'number' && value > 0

        case 'label': // for options object
        case 'value': // for options object
        case 'textContent': // for options object
        case 'placeholder':
        case 'searchNoResults':
        case 'searchPlaceholder':
            return typeof value === 'string' && value.length > 0 && value.length < 1000

        case 'dataset':  // for options object
        case 'children': // for options object
            return Array.isArray(value)

        case 'formatOptionsFunction':
            return typeof value === 'function'
    }
}

function Select3_initDocumentListener() {
    /* Handle closing of select when clicking outside it */
    d.addEventListener('click', (e) => {
        e.stopPropagation()
        if (e.target.closest('div.select3') === null) {
            for (let select3 of d.querySelectorAll('div.select3.opened')) {
                Select3_closeSelect3(select3.previousSibling, select3)
            }
        }
    })
}

Select3_initDocumentListener() // TODO Should be last line in file --> maybe just unwrap this function??
