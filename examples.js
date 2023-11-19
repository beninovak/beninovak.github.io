document.getElementById('example-closeOnSelectTrue').Select3({
    closeOnSelect: true,
})
document.getElementById('example-closeOnSelectFalse').Select3({
    closeOnSelect: false,
})
document.getElementById('example-searchTrue').Select3({
    search: true,
})
document.getElementById('example-searchFalse').Select3({
    search: false,
})
document.getElementById('minimumInputLength2').Select3({
    search: true,
    minimumInputLength: 2,
})
document.getElementById('minimumInputLength4').Select3({
    search: true,
    minimumInputLength: 4,
})
document.getElementById('dropdownMaxHeight200').Select3({
    dropdownMaxHeight: 200,
})
document.getElementById('dropdownMaxHeight300').Select3({
    dropdownMaxHeight: 300,
})
document.getElementById('maximumSelectedOptions2').Select3({
    closeOnSelect: false,
    maximumSelectedOptions: 2,
})
document.getElementById('maximumSelectedOptions4').Select3({
    closeOnSelect: false,
    maximumSelectedOptions: 4,
})
document.getElementById('placeholderSingle').Select3({
    placeholder: 'Please select an option',
})
document.getElementById('placeholderMultiple').Select3({
    closeOnSelect: false,
    placeholder: 'Please select an option',
})
document.getElementById('searchNoResultsTest').Select3({
    search: true,
    searchNoResults: 'No option found',
})
document.getElementById('formatOptionsFunctionTest').Select3({
    formatOptionsFunction: function(option) {
        if (!option.value) {
            return option.textContent;
        }

        let content = document.createElement('span')
        let image = document.createElement('img')

        image.src = option.dataset.imgSrc
        image.alt = option.textContent
        content.append(image)
        content.append(option.textContent)

        return content;
    }
})