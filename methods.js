// val() method
const single = document.getElementById('method-val-single')
const multiple = document.getElementById('method-val-multiple')
const output = document.querySelector('output')

single.Select3()
multiple.Select3({
    closeOnSelect: false,
})

document.getElementById('val-output-btn').addEventListener('click', () => {
    let singleValue = single.val()
    let multipleValue = multiple.val()
    output.innerHTML = `
        Single select value (string): <code class="red result">${singleValue}</code><br/><br/> 
        Multiple select value (array): <code class="red result">${multipleValue}</code>
    `
})

// open() / close() method
const openClose = document.getElementById('method-open-close')
const openBtn = document.getElementById('open-btn')
const closeBtn = document.getElementById('close-btn')

openClose.Select3()

openBtn.addEventListener('click', (event) => {
    openClose.open(event)
})

closeBtn.addEventListener('click', (event) => {
    openClose.close(event)
})