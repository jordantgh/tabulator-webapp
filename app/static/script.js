let fields = document.querySelectorAll("input");
let addButton = document.querySelector(".add-button");
let addRowButton = document.querySelector(".add-row-button");
let firstRowFields = document.querySelectorAll("#field-row-1 > .input-field");
let firstRowWidth = document.querySelector("#field-row-1").offsetWidth;
let root = document.querySelector(":root");
let row = 1;

// function to instantiate a field, add class and event listener and return it
const instantiateField = (className) => {
  const field = document.createElement("input");
  field.type = "text";
  field.classList.add(className);
  field.addEventListener("change", () => {
    createArray();
    sendData();
  });
  return field;
};

const createField = (event) => {
  // Get the id of the button that was clicked
  const id = event.target.id;

  // Get the substring of the id with the number (last character)
  const row = +id.substring(id.length - 1);

  // Create a new input-group div
  const inputGroup = document.querySelector(`#field-row-${row}`);

  // If this is not the first row, check if the number of input fields
  // is less than in the first row. If so, add a new input field.
  if (row === 1 || (row > 1 &&
    inputGroup.querySelectorAll(".input-field")
    .length < firstRowFields.length)) {
    inputGroup.appendChild(instantiateField("input-field"));
  }

  firstRowWidth = document.querySelector("#field-row-1").offsetWidth;
  firstRowFields = document.querySelectorAll("#field-row-1 > .input-field");
  
  root.style.setProperty("--r1width", firstRowWidth + "px");
  root.style.setProperty("--r1cols", firstRowFields.length);

  checkAddButton();
};

const createRow = () => {
  row++;
  const rowsGroup = document.querySelector(".new-rows-container");

  // Create a new input-group div
  const vInputGroup = document.createElement("div");
  vInputGroup.classList.add("input-group");
  rowsGroup.appendChild(vInputGroup);

  // Add a new field-container div
  const vFieldContainer = document.createElement("div");
  vInputGroup.appendChild(instantiateField("variable-field"));
  vInputGroup.appendChild(vFieldContainer);
  vFieldContainer.classList.add("field-container");
  vFieldContainer.id = `field-row-${row}`;

  // Add the input field
  vFieldContainer.appendChild(instantiateField("input-field"));

  // Copy button and add to input-group
  copyButton = addButton.cloneNode(true);
  copyButton.id = `btn-row-${row}`;
  vInputGroup.appendChild(copyButton);

  // Add event listener to the copy button
  copyButton.addEventListener("click", function (event) {
    createField(event);
  });

  checkAddButton();

};

addButton.addEventListener("click", function (event) {
  createField(event);
});

addRowButton.addEventListener("click", createRow);

const checkAddButton = () => {
  const rows = document.querySelectorAll(".field-container");
  rows.forEach((row, idx) => {
    if (idx > 0) {
    const fields = row.querySelectorAll(".input-field");
    const addButton = document.querySelector("#btn-row-" + (idx + 1));
    if (fields.length < firstRowFields.length) {
      addButton.style.visibility = "visible";
    } else {
      addButton.style.visibility = "hidden";
    }
  }
  });
};

let rowsArr = [];
// Iterate through the rows and create an array of arrays
const createArray = () => {
  const rows = document.querySelectorAll(".field-container");
  rows.forEach((row, idx) => {
    rowsArr[idx] = [];
    const fields = row.querySelectorAll(".input-field");
    fields.forEach((field, i) => {
      rowsArr[idx][i] = field.value.split(",");
    });
  });
}

let result;
const sendData = () => {
  fetch("http://localhost:5000/process_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: rowsArr })
  })
    .then(res => res.text())
    .then(html => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");
      let table = doc.querySelector("table");
      let header = table.querySelector("thead tr");
      // Remove the existing headers
      while (header.firstChild) {
        header.removeChild(header.firstChild);
      }
      let headers = document.querySelectorAll(".variable-field");
      headers.forEach((field, i) => {
        let th = doc.createElement("th");
        let headerName = field.value ? field.value : "Variable " + (i + 1);
        th.innerHTML = headerName;
        header.appendChild(th);
      });
      document.getElementById("table-container").innerHTML = doc.body.innerHTML;
    })
};

// Update the array whenever an input field is changed
// needed for the first field as it is not created by the add button
// todo: simplify this
fields.forEach((field) => {
  field.addEventListener("change", () => {
    createArray();
    sendData();
  });
});