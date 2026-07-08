let user = JSON.parse(localStorage.getItem("loggedInUser"));
if (user === null) {
  window.location.href = "index.html";
}

let users = JSON.parse(localStorage.getItem("users"));
const username = document.querySelector("#username");
const links = document.querySelectorAll("[data-page]");
const content = document.querySelector(".content");
const addBtn = document.querySelector(".addBtn");
const formDiv = document.querySelector(".formDiv");
const form = document.querySelector("form");
const closeForm = document.querySelector(".closeForm");
const logoutBtn = document.querySelector("#logoutBtn");
let darkMode = false;
let editableObj = null;
let chart = null;
let balance = 0;
let income = 0;
let expense = 0;
let transaction = 0;

username.innerHTML = user.userName;

closeForm.addEventListener("click", () => {
  formDiv.style.display = "none";
  form.reset();
});

form.addEventListener("click", (e) => {
  e.stopPropagation();
});

logoutBtn.addEventListener("click", (e) => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
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
    user.transactions.push(obj);
    const index = users.findIndex((e) => e.id === user.id);
    users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    insertTransaction();
    form.reset();
  } else {
    editableObj["type"] = e.target[0].value;
    editableObj["des"] = e.target[1].value.trim();
    editableObj["amount"] = e.target[2].value;
    editableObj["date"] = e.target[3].value;
    editableObj["category"] = e.target[4].value;
    const objIndex = user.transactions.findIndex(
      (i) => i.id === editableObj.id,
    );
    user.transactions[objIndex] = editableObj;
    const index = users.findIndex((ele) => ele.id === user.id);
    users[index] = user;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("users", JSON.stringify(users));
    insertTransaction();
    form.reset();
    editableObj = null;
  }
  formDiv.style.display = "none";
});

function insertTransaction() {
  const tableBody = document.querySelector(".tableBody");
  if (user.transactions.length === 0) {
    tableBody.innerHTML = `<h3 style="white-space: nowrap; margin-top: 10px">No Transactions</h3>`;
    loadAmount();
    return;
  }
  tableBody.innerHTML = "";
  user.transactions.forEach((data) => {
    tableBody.innerHTML += `<tr>
          <td>${data.date}</td>
          <td style="font-weight: bold;">${data.des}</td>
          <td><span id="category">${data.category}</span></td>
          <td style="font-weight: bold; ${data.type === "Income" ? "color: green" : "color: rgb(189, 2, 2)"}">${data.type === "Income" ? "+" : "-"}${user.currency}${data.amount}</td>
          <td>
            <button class="tableEditBtn" onclick="tableEdit('${data.id}')"><i class="ri-pencil-fill"></i></button>
            <button class="tableDeleteBtn" onclick="tableRemove('${data.id}')"><i class="ri-delete-bin-6-fill"></i></button>
          </td>
        </tr>`;
  });
  loadAmount();
}

function tableEdit(id) {
  editableObj = user.transactions.find((e) => e.id === id);
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
    const objIndex = user.transactions.findIndex((ele) => ele.id === id);
    user.transactions.splice(objIndex, 1);
    const index = users.findIndex((ele) => ele.id === user.id);
    users[index] = user;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("users", JSON.stringify(users));
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
  transaction = user.transactions.length;
  user.transactions.forEach((ele) => {
    if (ele.type === "Income") {
      income += Number(ele.amount);
      balance += Number(ele.amount);
    } else if (ele.type === "Expense") {
      expense += Number(ele.amount);
      balance -= Number(ele.amount);
    }
  });
  currentBalance.innerHTML = `${user.currency}${balance.toFixed(2)}`;
  totalIncome.innerHTML = `${user.currency}${income.toFixed(2)}`;
  totalExpense.innerHTML = `${user.currency}${expense.toFixed(2)}`;
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
    const searchInput = document.querySelector("#searchInput");
    checked.checked = darkMode;
    resetBtn.addEventListener("click", (e) => {
      user.transactions = [];
      const index = users.findIndex((ele) => ele.id === user.id);
      users[index] = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      localStorage.setItem("users", JSON.stringify(users));
      insertTransaction();
    });
    checked.addEventListener("click", (e) => {
      if (e.target.checked) {
        document.body.classList.add("dark");
        darkMode = e.target.checked;
      } else {
        document.body.classList.remove("dark");
        darkMode = e.target.checked;
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
      if (e.target.value === "All") {
        user = JSON.parse(localStorage.getItem("loggedInUser"));
        insertTransaction();
      } else if (e.target.value === "Income") {
        user = JSON.parse(localStorage.getItem("loggedInUser"));
        user.transactions = user.transactions.filter(
          (ele) => ele.type === e.target.value,
        );
        insertTransaction();
      } else {
        user = JSON.parse(localStorage.getItem("loggedInUser"));
        user.transactions = user.transactions.filter(
          (ele) => ele.type === e.target.value,
        );
        insertTransaction();
      }
    });

    searchInput.addEventListener("input", () => {
      user = JSON.parse(localStorage.getItem("loggedInUser"));
      const search = searchInput.value.trim().toLowerCase();

      user.transactions = user.transactions.filter((transaction) => {
        return (
          transaction.des.toLowerCase().includes(search) ||
          transaction.category.toLowerCase().includes(search)
        );
      });
      insertTransaction();
    });
  } else {
    const settingsForm = document.querySelector("#settingsForm");
    const name = document.querySelector("#name");
    const currencySelect = document.querySelector("#currency");

    name.value = user.userName;
    currencySelect.value = user.currency;
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userName = e.target[0].value.trim();
      const currency = e.target[1].value;
      user.userName = userName;
      user.currency = currency;
      const index = users.findIndex((ele) => ele.id === user.id);
      users[index] = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      localStorage.setItem("users", JSON.stringify(users));
      alert("Settings saved successfully");
      username.innerHTML = user.userName;
    });
  }
}

loadPage("dashboard.html");
