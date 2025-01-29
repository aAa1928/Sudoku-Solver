"use strict";

// Check for saved theme preference
const savedTheme = localStorage.getItem("theme") || "light";
document.body.setAttribute("data-theme", savedTheme);
document.getElementById("dark-mode-toggle").checked = savedTheme === "dark";

let grid = Array.from({ length: 9 }, () => Array(9).fill(0));

// Identifies cells by row and column
document.querySelectorAll("table tbody tr").forEach((row, rowIndex) => {
  row.querySelectorAll("td input").forEach((cell, cellIndex) => {
    cell.id = `cell-${rowIndex}-${cellIndex}`;
    cell.classList.add("cell"); // Add the 'cell' class to each input element

    // Allows user to navigate the board using arrow keys
    cell.addEventListener("keydown", (event) => {
      const currentId = event.target.id;
      const [_, row, col] = currentId.split("-").map(Number);

      let newRow = row;
      let newCol = col;

      // If a number key is pressed and there's already a value, clear it
      if (/^[1-9]$/.test(event.key) && cell.value) {
        cell.value = "";
        return;
      }

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newRow = Math.max(0, row - 1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          newRow = Math.min(8, row + 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          newCol = Math.max(0, col - 1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          newCol = Math.min(8, col + 1);
          break;
        default:
          return;
      }

      event.preventDefault();
      document.getElementById(`cell-${newRow}-${newCol}`).focus();
    });

    // Add class for user input
    cell.addEventListener("input", () => {
      if (cell.value) {
        cell.classList.add("user-input");
        cell.classList.remove("solved-cell");
        cell.style.backgroundColor = "";
      } else {
        cell.classList.remove("user-input");
      }
    });
  });
});

// Function to validate input
function validateInput(e) {
  let value = e.target.value;

  value = value.replace(/[^1-9]/g, "");
  e.target.value = value;
}

// Add event listener to the reset button
document.getElementById("reset-button").addEventListener("click", () => {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.value = "";
    cell.classList.remove("user-input", "solved-cell");
    cell.style.backgroundColor = ""; // Reset background color on reset
  });
});

// Solves board
document.getElementById("solve-button").addEventListener("click", () => {
  updateGrid();
  console.log(grid);

  if (!isSolvable()) {
    alert("Board is not solvable");
    return;
  } else {
    solveGrid();
    console.log(grid);
    document.querySelectorAll(".cell").forEach((cell) => {
      const [_, row, col] = cell.id.split("-").map(Number);
      if (!cell.classList.contains("user-input")) {
        cell.value = grid[row][col] !== 0 ? grid[row][col] : "";
        cell.classList.add("solved-cell");
      }
    });
  }
});

// Dark Mode Toggle
document.getElementById("dark-mode-toggle").addEventListener("click", (e) => {
  const theme = e.target.checked ? "dark" : "light";
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

// Checks if a number can be placed in a cell
function isValid(row, column, number) {
  // row
  if (grid[row].includes(number)) {
    return false;
  } else if (grid.map((row) => row[column]).includes(number)) {
    return false;
  } else if (
    grid
      .slice(row - (row % 3), row - (row % 3) + 3)
      .map((row) => row.slice(column - (column % 3), column - (column % 3) + 3))
      .flat()
      .includes(number)
  ) {
    return false;
  }
  return true;
}

// Solves the board through recursive backtracking
function solveGrid(row = 0, column = 0) {
  if (row === 9) {
    return true;
  }

  if (grid[row][column] !== 0) {
    return solveGrid(column === 8 ? row + 1 : row, (column + 1) % 9);
  }

  for (let number = 1; number <= 9; number++) {
    if (isValid(row, column, number)) {
      grid[row][column] = number;

      if (solveGrid(column === 8 ? row + 1 : row, (column + 1) % 9)) {
        return true;
      }
    }
  }

  grid[row][column] = 0;
  return false;
}

// Checks if board is solvable (17 clues minimum)
function isSolvable() {
  let filledCells = 0;

  for (let row of grid) {
    for (let cell of row) {
      if (cell !== 0) {
        filledCells++;
      }
    }
  }

  return filledCells >= 17;
}

// Updates grid variable with user input
function updateGrid() {
  grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  document.querySelectorAll(".cell").forEach((cell) => {
    const [_, row, col] = cell.id.split("-").map(Number);
    grid[row][col] = Number(cell.value) || 0;
  });
}
