// get all the required elements from index.html
const resizer = document.getElementById('dragMe')
const leftPanel = document.querySelector('.left-panel')
const container = document.querySelector('.split-container')
const reload_button = document.getElementById('reload_button')
const google_doc = document.getElementById('doc')
const textbox = document.getElementById('textbox')
const file = document.getElementById('file_button')
const preview = document.getElementById('preview')
const text_link = document.getElementById('link')
const button_link = document.getElementById('linkbutton')

// start functions
let x = 0
let leftWidth = 0

// function for when someone clicks on the slider 
const mousedownHandler = function (e) {
  x = e.clientX
  leftWidth = leftPanel.getBoundingClientRect().width
//   shows that the slider moves using the event listeners
  document.addEventListener('mousemove', mousemoveHandler)
  document.addEventListener('mouseup', mouseupHandler)
}

// when ever the mouse moves it will move the slider with the mouse
const mousemoveHandler = function (e) {
  const dx = e.clientX - x
  const newWidth = ((leftWidth + dx) * 100) / container.getBoundingClientRect().width
  
  if (newWidth > 10 && newWidth < 90) {
    leftPanel.style.width = `${newWidth}%`
  }
}

// when ever you stop clicking it will remove all the events that allow it to move
const mouseupHandler = function () {
  document.removeEventListener('mousemove', mousemoveHandler)
  document.removeEventListener('mouseup', mouseupHandler)
}

// when ever you click back down on the slider.
resizer.addEventListener('mousedown', mousedownHandler)

// when you want the slider to go back to the center you double click the slider
resizer.addEventListener("dblclick", () => {
  leftPanel.style.width = "50%"
})

// function to reset / refresh the docs side IF NEEDED
// const refresh = 15000
// setInterval(function() {
// const google_doc = document.getElementById('doc')
// if (google_doc) {
// google_doc.src = google_doc.src
// }
// }, refresh)



// allows the button to refresh the doc
reload_button.addEventListener('click', () => {
  if (google_doc) {
google_doc.src = google_doc.src
}
})

textbox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      if (google_doc) {
        google_doc.src = google_doc.src
}
}
})

// image preview
file.addEventListener('change', function() {
  const file = this.files[0]

  if (file) {
    const objectURL = URL.createObjectURL(file)

    preview.src = objectURL
    preview.style.display = 'block'
  }

  else {
    preview.src = ''
    preview.style.display = 'none'
  }
})

button_link.addEventListener('click', function() {
  
  google_doc.src = text_link.value

})