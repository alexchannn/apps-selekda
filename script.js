document.addEventListener('DOMContentLoaded', function() {
   const canvas = document.getElementById('canvas');
   const ctx = canvas.getContext('2d');
   let isDrawing = false;
   let lastX = 0;
   let lastY = 0;

   // Initialize canvas
   ctx.fillStyle = 'white';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   // Tool selection
   let currentTool = 'brush';
   document.getElementById('brush-tool').addEventListener('click', function() {
       currentTool = 'brush';
   });
   document.getElementById('eraser-tool').addEventListener('click', function() {
       currentTool = 'eraser';
   });

   // Canvas event listeners
   canvas.addEventListener('mousedown', startDrawing);
   canvas.addEventListener('mousemove', draw);
   canvas.addEventListener('mouseup', stopDrawing);
   canvas.addEventListener('mouseout', stopDrawing);

   // Brush properties
   let brushSize = 5;
   let brushColor = '#000000';
   let brushOpacity = 1;

   document.getElementById('brush-size').addEventListener('input', function() {
       brushSize = this.value;
   });

   document.getElementById('brush-opacity').addEventListener('change', function() {
       brushOpacity = this.value / 100;
   });

   function startDrawing(e) {
       isDrawing = true;
       [lastX, lastY] = [e.offsetX, e.offsetY];
   }

   function draw(e) {
       if (!isDrawing) return;
       ctx.beginPath();
       ctx.moveTo(lastX, lastY);
       ctx.lineTo(e.offsetX, e.offsetY);
       ctx.strokeStyle = currentTool === 'eraser' ? 'white' : brushColor;
       ctx.lineWidth = brushSize;
       ctx.lineCap = 'round';
       ctx.globalAlpha = brushOpacity;
       ctx.stroke();
       [lastX, lastY] = [e.offsetX, e.offsetY];
   }

   function stopDrawing() {
       if (isDrawing) {
           isDrawing = false;
           saveState();
       }
   }

   // Undo/Redo functionality
   const undoStack = [];
   const redoStack = [];

   function saveState() {
       undoStack.push(canvas.toDataURL());
       redoStack.length = 0;
       updateUndoRedoButtons();
   }

   document.getElementById('undo').addEventListener('click', undo);
   document.getElementById('redo').addEventListener('click', redo);

   function undo() {
       if (undoStack.length > 1) {
           redoStack.push(undoStack.pop());
           loadState(undoStack[undoStack.length - 1]);
           updateUndoRedoButtons();
       }
   }

   function redo() {
       if (redoStack.length > 0) {
           undoStack.push(redoStack.pop());
           loadState(undoStack[undoStack.length - 1]);
           updateUndoRedoButtons();
       }
   }

   function loadState(state) {
       const img = new Image();
       img.onload = function() {
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           ctx.drawImage(img, 0, 0);
       };
       img.src = state;
   }

   function updateUndoRedoButtons() {
       document.getElementById('undo').disabled = undoStack.length <= 1;
       document.getElementById('redo').disabled = redoStack.length === 0;
       document.getElementById('undo-counter').textContent = undoStack.length - 1;
       document.getElementById('redo-counter').textContent = redoStack.length;
   }

   // Zoom functionality
   let zoomLevel = 100;
   document.getElementById('zoom-in').addEventListener('click', zoomIn);
   document.getElementById('zoom-out').addEventListener('click', zoomOut);

   function zoomIn() {
       zoomLevel = Math.min(zoomLevel + 10, 200);
       applyZoom();
   }

   function zoomOut() {
       zoomLevel = Math.max(zoomLevel - 10, 50);
       applyZoom();
   }

   function applyZoom() {
       canvas.style.transform = `scale(${zoomLevel / 100})`;
       document.getElementById('zoom-percentage').textContent = `${zoomLevel}%`;
   }

   // Initialize
   saveState();
   updateUndoRedoButtons();
});
