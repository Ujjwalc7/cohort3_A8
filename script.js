const links = document.querySelectorAll("[data-page]");
const content = document.querySelector(".content");
const addBtn = document.querySelector(".addBtn");
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const formDiv = document.querySelector(".formDiv");
const form = document.querySelector("form");
const closeForm = document.querySelector(".closeForm");
let editableObj = null;
let chart = null;
let balance = 0;
let income = 0;
let expense = 0;
let transaction = 0;

closeForm.addEventListener("click", () => {
  formDiv.style.display = "none";
  form.reset();
});

form.addEventListener("click", (e) => {
  e.stopPropagation();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editableObj === null) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const type = e.target[0].value;
    const des = e.target[1].value.trim();
    const amount = e.target[2].value;
    const date = e.target[3].value;
    const category = e.target[4].value;
    const obj = {
      id,
      type,
      des,
      amount,
      date,
      category,
    };
    transactions.push(obj);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    insertTransaction();
    form.reset();
  } else {
    editableObj["type"] = e.target[0].value;
    editableObj["des"] = e.target[1].value.trim();
    editableObj["amount"] = e.target[2].value;
    editableObj["date"] = e.target[3].value;
    editableObj["category"] = e.target[4].value;
    const index = transactions.findIndex((i) => i === editableObj.id);
    transactions[index] = editableObj;
    localStorage.setItem("transactions", JSON.stringify(transactions));
    insertTransaction();
    form.reset();
    editableObj = null;
  }
  formDiv.style.display = "none";
});

function insertTransaction() {
  const tableBody = document.querySelector(".tableBody");
  if (transactions.length === 0) {
    tableBody.innerHTML = `<h3 style="white-space: nowrap; margin-top: 10px">No Transactions</h3>`;
    loadAmount();
    return;
  }
  tableBody.innerHTML = "";
  transactions.forEach((data) => {
    tableBody.innerHTML += `        <tr>
          <td>${data.date}</td>
          <td>${data.des}</td>
          <td>${data.category}</td>
          <td>${data.amount}</td>
          <td>
            <button class="tableEditBtn" onclick="tableEdit('${data.id}')"><i class="ri-pencil-fill"></i></button>
            <button class="tableDeleteBtn" onclick="tableRemove('${data.id}')"><i class="ri-delete-bin-6-fill"></i></button>
          </td>
        </tr>`;
  });
  loadAmount();
}

function tableEdit(id) {
  editableObj = transactions.find((e) => e.id === id);
  formDiv.style.display = "flex";
  form.elements[0].value = editableObj.type;
  form.elements[1].value = editableObj.des;
  form.elements[2].value = editableObj.amount;
  form.elements[3].value = editableObj.date;
  form.elements[4].value = editableObj.category;
}

function tableRemove(id) {
  const isConfirmed = confirm("Are you sure you want to delete transaction?");
  if (isConfirmed) {
    const index = transactions.findIndex((ele) => ele.id === id);
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    insertTransaction();
  } else {
    return;
  }
}

addBtn.addEventListener("click", () => {
  formDiv.style.display = "flex";
});

formDiv.addEventListener("click", () => {
  formDiv.style.display = "none";
  form.reset();
});

links.forEach((link) => {
  link.addEventListener("click", () => {
    links.forEach((link) => {
      link.classList.remove("active");
    });
    link.classList.add("active");
    loadPage(link.dataset.page);
  });
});

// function createChart() {

// }

function loadAmount() {
  const currentBalance = document.querySelector(".currentBalance");
  const totalIncome = document.querySelector(".totalIncome");
  const totalExpense = document.querySelector(".totalExpense");
  const totalTransaction = document.querySelector(".totalTransaction");
  balance = 0;
  income = 0;
  expense = 0;
  transaction = transactions.length;
  transactions.forEach((ele) => {
    if (ele.type === "Income") {
      income += Number(ele.amount);
      balance += Number(ele.amount);
    } else if (ele.type === "Expense") {
      expense += Number(ele.amount);
      balance -= Number(ele.amount);
    }
  });
  currentBalance.innerHTML = balance.toFixed(2);
  totalIncome.innerHTML = income.toFixed(2);
  totalExpense.innerHTML = expense.toFixed(2);
  totalTransaction.innerHTML = transaction;
  if (chart !== null) {
    chart.data.datasets[0].data = [income];
    chart.data.datasets[1].data = [expense];
    chart.update();
  }
}

async function loadPage(page) {
  const data = await fetch(page);
  const res = await data.text();

  content.innerHTML = res;

  if (page === "dashboard.html") {
    const checked = document.querySelector("#checkbox");
    const filterDiv = document.querySelector("#filterDiv");
    const resetBtn = document.querySelector("#resetBtn");

    resetBtn.addEventListener("click", (e) => {
      localStorage.clear();
      transactions = [];
      insertTransaction();
    });
    checked.addEventListener("click", (e) => {
      if (e.target.checked) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    });
    insertTransaction();
    loadAmount();
    const ctx = document.getElementById("myChart");

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Income vs Expenses"],
        datasets: [
          {
            label: "Income",
            data: [income],
            backgroundColor: "#004702",
            borderRadius: 6,
          },
          {
            label: "Expenses",
            data: [expense],
            backgroundColor: "#7d0000",
            borderRadius: 6,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
    filterDiv.addEventListener("change", (e) => {
      console.log(e.target.value);

      if (e.target.value === "All") {
        transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        insertTransaction();
      } else if (e.target.value === "Income") {
        transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions = transactions.filter(
          (ele) => ele.type === e.target.value,
        );
        insertTransaction();
      } else {
        transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions = transactions.filter(
          (ele) => ele.type === e.target.value,
        );
        insertTransaction();
      }
    });
  }
}

loadPage("dashboard.html");
