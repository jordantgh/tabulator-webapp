let fields = document.querySelectorAll("input");
let addButton = document.querySelector(".add-button");
let addRowButton = document.querySelector(".add-row-button");
let root = document.querySelector(":root");
let numRows = 1;
let maxRowWidth = 0;

const getLongestRow = () => {
  const allRows = document.querySelectorAll(".field-container");
  let longestRowFields = 0;
  let longestRowNode;
  allRows.forEach((row) => {
    let numFields = row.querySelectorAll(".input-field").length;
    if (numFields > longestRowFields) {
      longestRowFields = numFields;
      longestRowNode = row;
    }
  });

  allRows.forEach((row) => {
    row.classList.remove("longest-row");
  });
  longestRowNode.classList.add("longest-row");
  maxRowWidth = longestRowNode.offsetWidth;
  root.style.setProperty("--r1width", maxRowWidth + "px");
};

const instantiateField = (className) => {
  const field = document.createElement("input");
  field.type = "text";
  field.classList.add(className);
  field.addEventListener("input", () => {
    createArray();
    sendData();
  });
  return field;
};

const createField = (event) => {
  const id = event.target.id;
  const currentRow = +id.substring(id.length - 1);
  const fieldContainer = document.querySelector(`#field-row-${currentRow}`);
  fieldContainer.appendChild(instantiateField("input-field"));

  getLongestRow();
};

const createRow = () => {
  numRows++;
  const newRowsContainer = document.querySelector(".new-rows-container");

  const newInputGroup = document.createElement("div");
  newInputGroup.classList.add("input-group");
  newRowsContainer.appendChild(newInputGroup);

  const newFieldContainer = document.createElement("div");
  newFieldContainer.classList.add("field-container");
  newFieldContainer.id = `field-row-${numRows}`;

  newInputGroup.appendChild(instantiateField("variable-field"));
  newInputGroup.appendChild(newFieldContainer);

  newFieldContainer.appendChild(instantiateField("input-field"));

  copyButton = addButton.cloneNode(true);
  copyButton.id = `btn-row-${numRows}`;
  newInputGroup.appendChild(copyButton);

  copyButton.addEventListener("click", function (event) {
    createField(event);
  });

  getLongestRow();
};

addButton.addEventListener("click", function (event) {
  createField(event);
});

addRowButton.addEventListener("click", createRow);

let rowsArr = [];
const createArray = () => {
  const allRows = document.querySelectorAll(".field-container");
  allRows.forEach((row, idx) => {
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
      while (header.firstChild) {
        header.removeChild(header.firstChild); // Remove default headers
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

// Update the table whenever a field is changed
// needed for the first field as it is not created by the add button
fields.forEach((field) => {
  field.addEventListener("input", () => {
    createArray();
    sendData();
  });
});

getLongestRow();