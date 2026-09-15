// get all the required elements from index.html

const resizer = document.getElementById('dragMe');
const leftPanel = document.querySelector('.left-panel');
const container = document.querySelector('.split-container');

// start functions
let x = 0;
let leftWidth = 0;

// function for when someone clicks on the slider 
const mousedownHandler = function (e) {
  x = e.clientX;
  leftWidth = leftPanel.getBoundingClientRect().width;
//   shows that the slider moves using the event listeners
  document.addEventListener('mousemove', mousemoveHandler);
  document.addEventListener('mouseup', mouseupHandler);
};

// when ever the mouse moves it will move the slider with the mouse
const mousemoveHandler = function (e) {
  const dx = e.clientX - x;
  const newWidth = ((leftWidth + dx) * 100) / container.getBoundingClientRect().width;
  
  if (newWidth > 10 && newWidth < 90) {
    leftPanel.style.width = `${newWidth}%`;
  }
};

// when ever you stop clicking it will remove all the events that allow it to move
const mouseupHandler = function () {
  document.removeEventListener('mousemove', mousemoveHandler);
  document.removeEventListener('mouseup', mouseupHandler);
};

// when ever you click back down on the slider.
resizer.addEventListener('mousedown', mousedownHandler);

// when you want the slider to go back to the center you double click the slider
resizer.addEventListener("dblclick", () => {
  leftPanel.style.width = "50%";
});