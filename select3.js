Element.prototype.Select3 = function(config = {}) {

    const select = this
    if (select.tagName !== 'SELECT') return false

    if (select.hasAttribute('data-select3-initialized') && select.getAttribute('data-select3-initialized') === '1') {
        if (select.nextSibling?.classList.contains('select3')) {
            select.nextSibling.remove()
        }
    }

    if (!select.multiple) {
        config.closeOnSelect = true
    }

    // If any options were set, apply them
    config = SimpleSelect_applyConfig(config)

    // TODO --> Rename
    // TODO --> Check all other TODOs in IDE

    let select3 = document.createElement('div')
    select3.classList.add('select3')

    for (let cssClass of select.classList) {
        select3.classList.add(cssClass)
    }

    // Handles opening and closing
    select3.addEventListener('click', (e) => {

        const classes = e.target.classList
        if (classes.contains('select3') || classes.contains('selected-top') || classes.contains('placeholder')) {

            let closestSelect3 = e.target.closest('div.select3')
            SimpleSelect_openCloseSelect3(closestSelect3, config)

            for (let sel3 of document.querySelectorAll('div.select3')) {
                if (!sel3.isEqualNode(closestSelect3)) {
                    SimpleSelect_closeSelect3(sel3)
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

    let inner = document.createElement('div')
    inner.classList.add('inner')

    // Search input
    if (config.search) {

        let searchWrapper = document.createElement('div')
        searchWrapper.classList.add('search-wrapper')

        let searchInput = document.createElement('input')
        searchInput.classList.add('search')
        searchInput.setAttribute('type', 'search')

        let previousSearchLength = 0

        searchInput.addEventListener('keyup', (e) => {
            let searchLength = e.target.value.length
            if (searchLength >= config.minimumInputLength || searchLength < previousSearchLength) {
                let childNodes = e.target.closest('.inner').querySelectorAll('span:not(.title, .no-results)')
                SimpleSelect_filterInput(e.target.value, childNodes, select, inner, config)
            }
            previousSearchLength = searchLength
        })
        searchWrapper.append(searchInput)
        inner.prepend(searchWrapper)
    }

    let label = document.querySelector('label[for="' + select.id + '"]')
    label?.addEventListener('click', (e) => {
        e.preventDefault()
        select.open(e)
    })

    for (let child of select.children) {

        if (child.tagName === 'OPTION') {
            SimpleSelect_appendOptions(select, select3, inner, child, config)
        } else if (child.tagName === 'OPTGROUP') {

            let optGroupEl = document.createElement('div')
            optGroupEl.classList.add('optgroup')

            let optGroupTitle = document.createElement('span')
            optGroupTitle.classList.add('title')
            optGroupTitle.textContent = child.label

            optGroupEl.append(optGroupTitle)

            for (let opt of child.children) {
                SimpleSelect_appendOptions(select, select3, optGroupEl, opt, config)
            }
            inner.append(optGroupEl)
        }
    }

    if (select.selectedOptions.length === 0 || (select[0].value === '' && select[0].textContent === '')) {
        let placeholder = document.createElement('span')
        placeholder.classList.add('placeholder')

        let text = (config.placeholder !== '' ? config.placeholder : '\u00A0')

        if (!select.multiple && select[0].label !== '') {
            text = select[0].label
        }

        placeholder.textContent = text
        select3.querySelector('span.selected-top')?.remove()
        select3.prepend(placeholder)
    }

    select3.append(inner)

    select.style.display = 'none'
    select.parentNode.insertBefore(select3, select.nextSibling)

    select.val = function() {
        let value = []
        for (let selOpt of select.selectedOptions) {
            value.push(selOpt.value)
        }
        return select.multiple ? value : value[0]
    }

    select.open = function(e = null) {
        e?.stopPropagation()
        SimpleSelect_openSelect3(select3, config.dropdownMaxHeight)
    }

    select.close = function(e = null) {
        e?.stopPropagation()
        SimpleSelect_closeSelect3(select3)
    }

    select.setAttribute('data-select3-initialized', '1')

    return select
}

function SimpleSelect_openSelect3(select3, configDropdownMaxHeight) {
    select3.classList.add('opened')
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
}

function SimpleSelect_closeSelect3(select3) {

    let inner = select3.querySelector('.inner')
    select3.classList.remove('opened')
    inner.style.maxHeight =  '0px'

    if (select3.querySelector('input.search') !== null) {
        select3.querySelector('input.search').value = ''
    }

    select3.querySelector('.no-results')?.remove()
    // Show all options again
    for (let opt of select3.querySelectorAll('.option-hidden')) {
        opt.classList.remove('option-hidden')
    }
}

function SimpleSelect_openCloseSelect3(select3, config = {}) {
    select3.classList.toggle('opened')

    if (select3.classList.contains('opened')) {
        SimpleSelect_openSelect3(select3, config.dropdownMaxHeight)
    } else {
        SimpleSelect_closeSelect3(select3)
    }
}

function SimpleSelect_appendOptions(select, select3, parent, opt, config) {

    let optEl = document.createElement('span')
    optEl.setAttribute('data-value', opt.value.toString())

    let isMultipleSelect = select.multiple

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
            let content = document.createElement('span')
            content.append(config.formatOptionsFunction(opt))
            optEl.innerHTML = content.innerHTML
        } else {
            optEl.textContent = (opt.label.length ? opt.label : opt.textContent)
        }
    }

    // Copy selected node for use at the top of select3
    if (opt.selected) {

        let cloneEl = optEl.cloneNode()
        cloneEl.classList.add('selected-top')

        cloneEl.textContent = (opt.label.length ? opt.label : opt.textContent)

        if (isMultipleSelect) {
            cloneEl.prepend(SimpleSelect_getCloseBtn(select, select3, config))
        }

        select3.append(cloneEl)

        optEl.classList.add('selected')
        optEl.setAttribute('data-selected', '1')
    } else {
        optEl.setAttribute('data-selected', '0')
    }

    if (opt.disabled) {
        optEl.classList.add('disabled')
    }

    optEl.addEventListener('click', () => {

        let cloneEl = optEl.cloneNode()
        cloneEl.innerHTML = optEl.textContent // TODO -- check this shenanigans...why even use cloneEl??
        cloneEl.classList.add('selected-top')

        // Can only do stuff if the option in the original select is not disabled
        if (!opt.disabled) {

            // If user selects an option, whilst already having max selected options
            if (select.selectedOptions.length >= config.maximumSelectedOptions && optEl.getAttribute('data-selected') === '0') {
                return
            }

            let isOptionAlreadySelected = false

            if (
                (!isMultipleSelect && select.val() === cloneEl.getAttribute('data-value')) ||
                (isMultipleSelect && select.val().includes(cloneEl.getAttribute('data-value')))
            ) {
                isOptionAlreadySelected = true
            }

            // Handle selecting/deselecting
            if (!isMultipleSelect && !isOptionAlreadySelected) {

                let children = select.querySelectorAll('option')
                for (let child of children) {
                    child.removeAttribute('selected')
                }

                let select3Children = select3.querySelectorAll('.inner span')
                for (let child of select3Children) {
                    child.classList.remove('selected')
                    child.setAttribute('data-selected', '0')
                }

                opt.setAttribute('selected', 'selected')
                select3.querySelector('.selected-top, .placeholder').replaceWith(cloneEl)
                optEl.classList.add('selected')
                optEl.setAttribute('data-selected', '1')

                // Trigger 'change' event on regular select only if option is not already selected.
                select.dispatchEvent(new Event('change'))

            } else if (isMultipleSelect) {

                if (isOptionAlreadySelected) {
                    select3.querySelector(':scope > span[data-value="' + cloneEl.getAttribute('data-value') + '"]')?.remove()
                    opt.removeAttribute('selected')
                    optEl.classList.remove('selected')
                    optEl.setAttribute('data-selected', '0')

                    SimpleSelect_showPlaceholderIfAppropriate(select, select3, config)
                } else {
                    select3.insertBefore(cloneEl, select3.querySelector('.inner'))
                    opt.setAttribute('selected', 'selected')
                    optEl.classList.add('selected')
                    optEl.setAttribute('data-selected', '1')

                    // Only happens if the option that was just clicked was the first selected option.
                    select3.querySelector(':scope > span.placeholder')?.remove()
                }

                // When the maximum allowed amount of options have been selected, add class to select3 to indicate this.
                if (select.selectedOptions.length === config.maximumSelectedOptions) {
                    select3.classList.add('maxed')
                } else {
                    select3.classList.remove('maxed')
                }

                cloneEl.prepend(SimpleSelect_getCloseBtn(select, select3,config))

                select.dispatchEvent(new Event('change'))
            }

            if (config.closeOnSelect) {
                SimpleSelect_closeSelect3(select3, config)
            }
        }
    })
    parent.append(optEl)
}

function SimpleSelect_showPlaceholderIfAppropriate(select, select3, config) {
    if (select.selectedOptions.length === 0 && config.placeholder !== '') {
        let placeholder = document.createElement('span')
        placeholder.classList.add('placeholder')
        placeholder.textContent = config.placeholder
        select3.prepend(placeholder)
    }
}

function SimpleSelect_getCloseBtn(select, select3, config) {
    let closeBtn = document.createElement('b')
    closeBtn.classList.add('remove')
    closeBtn.textContent = '×'
    closeBtn.addEventListener('click', (e) => {
        SimpleSelect_removeOption(select, select3, e.target.parentElement, config)
    })
    return closeBtn
}

function SimpleSelect_removeOption(select, select3, option, config) {

    let value = option.getAttribute('data-value')
    let selectOption = select.querySelector('option[value="' + value + '"]')

    selectOption?.removeAttribute('selected')
    let select3Option = select3.querySelector('.inner span[data-value="' + value + '"]')

    select3Option.classList.remove('selected')
    select3Option.setAttribute('data-selected', '0')

    option.remove()

    SimpleSelect_showPlaceholderIfAppropriate(select, select3, config)

    // Needed because anytime an option is deselected by clicking on the 'x' in the tags, the <select>'s value is updated.
    select.dispatchEvent(new Event('change'))
}

function SimpleSelect_filterInput(filter, options, select, inner, config) {

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
            let noResults = document.createElement('span')
            noResults.classList.add('no-results')
            noResults.textContent = config.searchNoResults
            inner.append(noResults)
        }
    }
}

function SimpleSelect_applyConfig(config) {

    /* All possible options and their default values */
    const confs = {
        search: false,
        closeOnSelect: true,
        minimumInputLength: 3,
        dropdownMaxHeight: 280,
        maximumSelectedOptions: 100,
        placeholder: '',
        searchNoResults: '',
        formatOptionsFunction: null,
    }

    for (let property in config) {
        // If 'options' argument contains a non-supported property, don't add it to 'opts'
        if (confs.hasOwnProperty(property)) {
            // Only add valid properties to opts
            if (SimpleSelect_isOptionValid(property, config[property])) {
                confs[property] = config[property]
            }
        }
    }

    return confs
}

function SimpleSelect_isOptionValid(key, value) {
    switch (key) {
        case 'search':
        case 'closeOnSelect':
            return typeof value === 'boolean'

        case 'minimumInputLength':
        case 'dropdownMaxHeight':
        case 'maximumSelectedOptions':
            return typeof value === 'number' && value > 0

        case 'placeholder':
        case 'searchNoResults':
            return typeof value === 'string' && value.length > 0 && value.length < 1000

        case 'formatOptionsFunction':
            return typeof value === 'function'
    }
}

function SimpleSelect_initDocumentListener() {
    /* Handle closing of select when clicking outside it */
    document.addEventListener('click', (e) => {
        e.stopPropagation()
        let el = e.target
        let clickedSelect = el.closest('div.select3')
        if (clickedSelect === null) {
            for (let select3 of document.querySelectorAll('div.select3')) {
                SimpleSelect_closeSelect3(select3)
            }
        }
    })
}

SimpleSelect_initDocumentListener()