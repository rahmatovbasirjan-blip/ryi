// ===============================
// RENTAL PRO - SCRIPT.JS
// ===============================

const PIPE_SIZES = [
  ["pipe04", "0.4 м", 0.4],
  ["pipe06", "0.6 м", 0.6],
  ["pipe08", "0.8 м", 0.8],
  ["pipe1", "1 м", 1],
  ["pipe13", "1.3 м", 1.3],
  ["pipe15", "1.5 м", 1.5],
  ["pipe18", "1.8 м", 1.8],
  ["pipe2", "2 м", 2],
  ["pipe23", "2.3 м", 2.3],
  ["pipe25", "2.5 м", 2.5],
  ["pipe28", "2.8 м", 2.8],
  ["pipe3", "3 м", 3],
  ["pipe33", "3.3 м", 3.3],
  ["pipe35", "3.5 м", 3.5],
  ["pipe38", "3.8 м", 3.8],
  ["pipe4", "4 м", 4],
  ["pipe43", "4.3 м", 4.3],
  ["pipe45", "4.5 м", 4.5],
  ["pipe48", "4.8 м", 4.8],
  ["pipe5", "5 м", 5],
  ["pipe53", "5.3 м", 5.3],
  ["pipe55", "5.5 м", 5.5],
  ["pipe58", "5.8 м", 5.8],
  ["pipe6", "6 м", 6]
];

const CLAMP_TYPES = [
  "кручӣ",
  "простой",
  "соединитель"
];

const KEY = {
  inventory: "rentalInventory",
  customers: "rentalCustomers",
  rentals: "rentalRecords",
  shipments: "rentalShipments",
  returns: "rentalReturns",
  payments: "rentalPayments",
  sales: "rentalSales",
  projects: "rentalProjects"
};

let DATA = {
  inventory: null,
  customers: [],
  rentals: [],
  shipments: [],
  returns: [],
  payments: [],
  sales: [],
  projects: []
};


// ===============================
// BASIC FUNCTIONS
// ===============================

function $(id) {
  return document.getElementById(id);
}

function num(value) {
  return Number(value) || 0;
}

function money(value) {
  return num(value).toFixed(2);
}

function uid() {
  return Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dateText(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("tg-TJ");
  } catch {
    return value;
  }
}

function todayInput() {
  const d = new Date();

  const z = n => String(n).padStart(2, "0");

  return (
    d.getFullYear() +
    "-" +
    z(d.getMonth() + 1) +
    "-" +
    z(d.getDate()) +
    "T" +
    z(d.getHours()) +
    ":" +
    z(d.getMinutes())
  );
}


// ===============================
// LOCAL STORAGE
// ===============================

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);

  } catch {
    return fallback;
  }
}


// ===============================
// INVENTORY
// ===============================

function createEmptyInventory() {

  const pipes = {};

  PIPE_SIZES.forEach(p => {

    pipes[p[0]] = {
      size: p[1],
      length: p[2],
      total: 0,
      rented: 0,
      price: 0
    };

  });


  const clamps = {};

  CLAMP_TYPES.forEach(type => {

    clamps[type] = {
      type: type,
      total: 0,
      rented: 0,
      price: 0
    };

  });


  return {

    pipes: pipes,

    lessa: {
      total: 0,
      rented: 0,
      price: 0
    },

    clamps: clamps,

    jack: {
      total: 0,
      rented: 0,
      price: 0
    }

  };
}


function normalizeInventory(old) {

  const fresh = createEmptyInventory();

  if (!old) {
    return fresh;
  }


  PIPE_SIZES.forEach(p => {

    const oldPipe =
      old.pipes &&
      old.pipes[p[0]];

    if (oldPipe) {

      fresh.pipes[p[0]].total =
        num(oldPipe.total);

      fresh.pipes[p[0]].rented =
        num(oldPipe.rented);

      fresh.pipes[p[0]].price =
        num(oldPipe.price);

    }

  });


  ["lessa", "jack"].forEach(type => {

    if (old[type]) {

      fresh[type].total =
        num(old[type].total);

      fresh[type].rented =
        num(old[type].rented);

      fresh[type].price =
        num(old[type].price);

    }

  });


  if (old.clamps) {

    CLAMP_TYPES.forEach(type => {

      if (old.clamps[type]) {

        fresh.clamps[type].total =
          num(old.clamps[type].total);

        fresh.clamps[type].rented =
          num(old.clamps[type].rented);

        fresh.clamps[type].price =
          num(old.clamps[type].price);

      }

    });

  }


  return fresh;
}


function available(item) {

  return Math.max(
    0,
    num(item.total) - num(item.rented)
  );

}


// ===============================
// SAVE EVERYTHING
// ===============================

function persist() {

  saveData(KEY.inventory, DATA.inventory);
  saveData(KEY.customers, DATA.customers);
  saveData(KEY.rentals, DATA.rentals);
  saveData(KEY.shipments, DATA.shipments);
  saveData(KEY.returns, DATA.returns);
  saveData(KEY.payments, DATA.payments);
  saveData(KEY.sales, DATA.sales);
  saveData(KEY.projects, DATA.projects);

}


// ===============================
// START
// ===============================

function init() {

  DATA.inventory =
    normalizeInventory(
      loadData(KEY.inventory, null)
    );

  DATA.customers =
    loadData(KEY.customers, []);

  DATA.rentals =
    loadData(KEY.rentals, []);

  DATA.shipments =
    loadData(KEY.shipments, []);

  DATA.returns =
    loadData(KEY.returns, []);

  DATA.payments =
    loadData(KEY.payments, []);

  DATA.sales =
    loadData(KEY.sales, []);

  DATA.projects =
    loadData(KEY.projects, []);


  persist();


  document
    .querySelectorAll(".nav")
    .forEach(button => {

      button.onclick = () => {
        go(button.dataset.p);
      };

    });


  if ($("rs")) {
    $("rs").value = todayInput();
  }


  if ($("cal")) {

    $("cal").value =
      new Date()
        .toISOString()
        .slice(0, 10);

  }


  renderAll();

}


// ===============================
// PAGE NAMES
// ===============================

const PAGE_NAMES = {

  dash: ["Command Center", "Идоракунӣ"],

  customers: [
    "Муштариён",
    "Customer"
  ],

  history: [
    "Таърих",
    "Customer History"
  ],

  projects: [
    "Project Rental",
    "Объект"
  ],

  inventory: [
    "Анбор",
    "Stock"
  ],

  pipeadd: [
    "Иловаи труба",
    "24 андоза"
  ],

  lessa: [
    "Леса",
    "Бо дона"
  ],

  clamp: [
    "Хамут",
    "3 намуд"
  ],

  jack: [
    "Дамкрат",
    "Бо дона"
  ],

  sale: [
    "Фурӯш",
    "Sales"
  ],

  rent: [
    "Аренда",
    "Rental"
  ],

  ship: [
    "Борҳо",
    "Shipments"
  ],

  ret: [
    "Баргардонидан",
    "Returns"
  ],

  pay: [
    "Пардохтҳо",
    "Payments"
  ],

  receipt: [
    "Receipt",
    "Чек"
  ],

  analytics: [
    "Analytics",
    "Ҳисобот"
  ],

  profit: [
    "Profit Center",
    "Фоида"
  ],

  forecast: [
    "Forecast",
    "Пешгӯии анбор"
  ],

  debt: [
    "Intelligent Debt",
    "Қарз"
  ],

  problem: [
    "Problem Center",
    "Мушкилот"
  ],

  smart: [
    "Smart / AI",
    "Ёрдамчӣ"
  ],

  calendar: [
    "Calendar",
    "Тақвим"
  ],

  material: [
    "Ҳисоби масолеҳ",
    "Calculator"
  ],

  settings: [
    "Танзимот",
    "Settings"
  ]

};


// ===============================
// NAVIGATION
// ===============================

function go(page) {

  document
    .querySelectorAll(".page")
    .forEach(section => {
      section.classList.remove("on");
    });


  const selected =
    $(page);

  if (selected) {
    selected.classList.add("on");
  }


  document
    .querySelectorAll(".nav")
    .forEach(button => {

      button.classList.toggle(
        "on",
        button.dataset.p === page
      );

    });


  if ($("title")) {

    $("title").textContent =
      PAGE_NAMES[page]?.[0] ||
      "Rental Pro";

  }


  if ($("sub")) {

    $("sub").textContent =
      PAGE_NAMES[page]?.[1] ||
      "";

  }


  renderAll();

}


// ===============================
// CUSTOMERS
// ===============================

function addCustomer() {

  const name =
    $("cn").value.trim();

  if (!name) {

    alert("❌ Номи муштариро навис.");

    return;
  }


  DATA.customers.push({

    id: uid(),

    name: name,

    phone:
      $("cp").value.trim(),

    address:
      $("ca").value.trim()

  });


  $("cn").value = "";
  $("cp").value = "";
  $("ca").value = "";


  persist();

  renderAll();

  alert("✅ Муштарӣ илова шуд.");

}


// ===============================
// PROJECT
// ===============================

function addProject() {

  const name =
    $("pn").value.trim();

  if (!name) {

    alert("❌ Номи объектро навис.");

    return;
  }


  DATA.projects.push({

    id: uid(),

    name: name,

    address:
      $("pa").value.trim(),

    area:
      num($("parea").value),

    height:
      num($("ph").value)

  });


  $("pn").value = "";
  $("pa").value = "";
  $("parea").value = "";
  $("ph").value = "";


  persist();

  renderAll();

  alert("✅ Объект илова шуд.");

}


// ===============================
// ADD PIPES
// ===============================

function addPipes() {

  let added = 0;


  PIPE_SIZES.forEach(pipe => {

    const checkbox =
      $("ck" + pipe[0]);

    const quantityInput =
      $("q" + pipe[0]);

    const priceInput =
      $("pr" + pipe[0]);


    if (
      checkbox &&
      checkbox.checked
    ) {

      const quantity =
        Math.floor(
          num(quantityInput.value)
        );


      if (quantity <= 0) {
        return;
      }


      const stock =
        DATA.inventory.pipes[
          pipe[0]
        ];


      stock.total += quantity;


      stock.price =
        num(priceInput.value);


      added += quantity;


      checkbox.checked = false;

      quantityInput.value = "";

    }

  });


  if (added <= 0) {

    alert(
      "❌ Аввал андозаи труба ва миқдорро интихоб кун."
    );

    return;
  }


  persist();

  renderAll();

  alert(
    "✅ " +
    added +
    " дона труба ба анбор илова шуд."
  );

}


// ===============================
// ADD LESSA
// ===============================

function addLessa() {

  const quantity =
    Math.floor(
      num($("lq").value)
    );


  if (quantity <= 0) {

    alert("❌ Миқдори лесаро навис.");

    return;
  }


  DATA.inventory.lessa.total +=
    quantity;


  DATA.inventory.lessa.price =
    num($("lp").value);


  $("lq").value = "";


  persist();

  renderAll();

  alert("✅ Леса ба анбор илова шуд.");

}


// ===============================
// ADD CLAMP
// ===============================

function addClamp() {

  const type =
    $("ct").value;

  const quantity =
    Math.floor(
      num($("cq").value)
    );


  if (quantity <= 0) {

    alert("❌ Миқдорро навис.");

    return;
  }


  DATA.inventory.clamps[type].total +=
    quantity;


  DATA.inventory.clamps[type].price =
    num($("cprice").value);


  $("cq").value = "";


  persist();

  renderAll();

  alert(
    "✅ Хамут (" +
    type +
    ") илова шуд."
  );

}


// ===============================
// ADD JACK
// ===============================

function addJack() {

  const quantity =
    Math.floor(
      num($("jq").value)
    );


  if (quantity <= 0) {

    alert("❌ Миқдорро навис.");

    return;
  }


  DATA.inventory.jack.total +=
    quantity;


  DATA.inventory.jack.price =
    num($("jp").value);


  $("jq").value = "";


  persist();

  renderAll();

  alert("✅ Дамкрат илова шуд.");

}


// ===============================
// RENTAL ITEM OPTIONS
// ===============================

function rentalOptions() {

  const result = [];


  PIPE_SIZES.forEach(pipe => {

    const stock =
      DATA.inventory.pipes[
        pipe[0]
      ];


    if (available(stock) > 0) {

      result.push({

        key:
          "pipe:" +
          pipe[0],

        name:
          "🔩 Труба " +
          pipe[1],

        available:
          available(stock),

        length:
          pipe[2],

        price:
          stock.price

      });

    }

  });


  if (
    available(DATA.inventory.lessa) > 0
  ) {

    result.push({

      key: "lessa",

      name: "🏗️ Леса",

      available:
        available(DATA.inventory.lessa),

      length: 1,

      price:
        DATA.inventory.lessa.price

    });

  }


  CLAMP_TYPES.forEach(type => {

    const stock =
      DATA.inventory.clamps[type];


    if (available(stock) > 0) {

      result.push({

        key:
          "clamp:" +
          type,

        name:
          "🔗 Хамут " +
          type,

        available:
          available(stock),

        length: 1,

        price:
          stock.price

      });

    }

  });


  if (
    available(DATA.inventory.jack) > 0
  ) {

    result.push({

      key: "jack",

      name: "🔧 Дамкрат",

      available:
        available(DATA.inventory.jack),

      length: 1,

      price:
        DATA.inventory.jack.price

    });

  }


  return result;
}


// ===============================
// GET ITEM
// ===============================

function getItem(key) {

  if (!key) {
    return null;
  }


  if (key.startsWith("pipe:")) {

    const id =
      key.split(":")[1];

    const pipe =
      PIPE_SIZES.find(
        p => p[0] === id
      );


    if (!pipe) {
      return null;
    }


    return {

      key: key,

      type: "pipe",

      id: id,

      name:
        "Труба " +
        pipe[1],

      length:
        pipe[2],

      stock:
        DATA.inventory.pipes[id]

    };

  }


  if (key.startsWith("clamp:")) {

    const type =
      key.split(":")[1];


    return {

      key: key,

      type: "clamp",

      id: type,

      name:
        "Хамут " +
        type,

      length: 1,

      stock:
        DATA.inventory.clamps[type]

    };

  }


  if (key === "lessa") {

    return {

      key: "lessa",

      type: "lessa",

      id: "lessa",

      name: "Леса",

      length: 1,

      stock:
        DATA.inventory.lessa

    };

  }


  if (key === "jack") {

    return {

      key: "jack",

      type: "jack",

      id: "jack",

      name: "Дамкрат",

      length: 1,

      stock:
        DATA.inventory.jack

    };

  }


  return null;
}


// ===============================
// RENTAL ROW
// ===============================

function rentRow() {

  const options =
    rentalOptions();


  if (!options.length) {

    alert(
      "❌ Ҳоло дар анбор мол нест."
    );

    return;
  }


  const row =
    document.createElement("div");

  row.className =
    "row rr";


  row.innerHTML = `

    <div class="form">

      <div>

        <label>Мол</label>

        <select class="rk">

          ${options.map(o => `

            <option value="${escapeHTML(o.key)}">

              ${escapeHTML(o.name)}
              — ${o.available} холӣ

            </option>

          `).join("")}

        </select>

      </div>


      <div>

        <label>Миқдор</label>

        <input
          class="rq"
          type="number"
          min="1"
          value="1"
        >

      </div>


      <div>

        <label>Ҳисоб</label>

        <select class="rm">

          <option value="meter">
            Метр
          </option>

          <option value="piece">
            Дона
          </option>

          <option value="square">
            М²
          </option>

        </select>

      </div>


      <div>

        <label>Нарх / рӯз</label>

        <input
          class="rp"
          type="number"
          value="0"
        >

      </div>

    </div>

  `;


  $("rentRows")
    .appendChild(row);


  const select =
    row.querySelector(".rk");

  const price =
    row.querySelector(".rp");


  function updatePrice() {

    const item =
      getItem(select.value);

    if (item) {

      price.value =
        item.stock.price || 0;

    }

  }


  select.addEventListener(
    "change",
    updatePrice
  );


  updatePrice();

}


// ===============================
// RENTAL DAILY PRICE
// ===============================

function calculateDailyRows() {

  let total = 0;


  document
    .querySelectorAll(".rr")
    .forEach(row => {

      const key =
        row.querySelector(".rk")?.value;

      const quantity =
        num(
          row.querySelector(".rq")?.value
        );

      const mode =
        row.querySelector(".rm")?.value;

      const price =
        num(
          row.querySelector(".rp")?.value
        );


      const item =
        getItem(key);


      if (!item) {
        return;
      }


      let multiplier = 1;


      if (
        item.type === "pipe" &&
        mode === "meter"
      ) {

        multiplier =
          item.length;

      }


      if (
        item.type === "pipe" &&
        mode === "square"
      ) {

        multiplier =
          item.length;

      }


      total +=
        quantity *
        price *
        multiplier;

    });


  if ($("daily")) {

    $("daily").textContent =
      money(total);

  }


  return total;
}


// ===============================
// ADD RENTAL
// ===============================

function rent() {

  const customerId =
    $("rc").value;


  if (!customerId) {

    alert(
      "❌ Аввал муштариро интихоб кун."
    );

    return;
  }


  const rows =
    [
      ...document.querySelectorAll(".rr")
    ];


  if (!rows.length) {

    alert(
      "❌ Аввал мол илова кун."
    );

    return;
  }


  const items = [];


  for (const row of rows) {

    const key =
      row.querySelector(".rk").value;

    const quantity =
      Math.floor(
        num(
          row.querySelector(".rq").value
        )
      );

    const mode =
      row.querySelector(".rm").value;

    const price =
      num(
        row.querySelector(".rp").value
      );


    const item =
      getItem(key);


    if (!item) {

      alert("❌ Мол ёфт нашуд.");

      return;
    }


    if (quantity <= 0) {

      alert(
        "❌ Миқдор нодуруст аст."
      );

      return;
    }


    if (
      quantity >
      available(item.stock)
    ) {

      alert(
        "❌ Барои " +
        item.name +
        " танҳо " +
        available(item.stock) +
        " дона холӣ аст."
      );

      return;
    }


    items.push({

      key: item.key,

      type: item.type,

      id: item.id,

      name: item.name,

      qty: quantity,

      planned: quantity,

      taken: 0,

      returned: 0,

      missing: 0,

      price: price,

      mode: mode,

      length: item.length

    });

  }


  const rental = {

    id: uid(),

    customerId:

      customerId,

    projectId:

      $("rpj").value,

    start:

      $("rs").value ||
      todayInput(),

    end:

      $("re").value,

    items:

      items,

    paid:

      num(
        $("rpaid").value
      ),

    closed: false

  };


  DATA.rentals.push(
    rental
  );


  if (rental.paid > 0) {

    DATA.payments.push({

      id: uid(),

      rentalId:
        rental.id,

      amount:
        rental.paid,

      note:
        "Пардохти аввал",

      date:
        new Date().toISOString()

    });

  }


  persist();


  $("rentRows").innerHTML = "";


  rentRow();


  renderAll();


  alert(
    "✅ Аренда сабт шуд.\n\n" +
    "Ҳоло ба «🚚 Борҳо» даро ва молеро, ки воқеан муштарӣ гирифтааст, сабт кун."
  );

}


// ===============================
// REMAINING PLANNED
// ===============================

function remainingToTake(item) {

  return Math.max(
    0,
    num(item.planned) -
    num(item.taken)
  );

}


// ===============================
// CURRENTLY WITH CUSTOMER
// ===============================

function currentlyOut(item) {

  return Math.max(
    0,
    num(item.taken) -
    num(item.returned) -
    num(item.missing)
  );

}


// ===============================
// CHANGE RENTED STOCK
// ===============================

function changeRented(item, amount) {

  let stock = null;


  if (item.type === "pipe") {

    stock =
      DATA.inventory.pipes[
        item.id
      ];

  }


  if (item.type === "clamp") {

    stock =
      DATA.inventory.clamps[
        item.id
      ];

  }


  if (item.type === "lessa") {

    stock =
      DATA.inventory.lessa;

  }


  if (item.type === "jack") {

    stock =
      DATA.inventory.jack;

  }


  if (!stock) {
    return;
  }


  stock.rented =
    Math.max(
      0,
      num(stock.rented) +
      amount
    );

}


// ===============================
// SHIPMENT FORM
// ===============================

function shipForm() {

  if (!$("sr")) {
    return;
  }


  const rental =
    DATA.rentals.find(
      r =>
        r.id ===
        $("sr").value
    );


  if (!rental) {

    $("shipItems").innerHTML =
      "";

    return;
  }


  $("shipItems").innerHTML =

    rental.items.map(item => `

      <div class="row">

        <b>
          ${escapeHTML(item.name)}
        </b>

        <br>

        Барои гирифтан:
        <b>
          ${remainingToTake(item)}
        </b>

        дона

        <input
          class="sqty"
          data-key="${escapeHTML(item.key)}"
          type="number"
          min="0"
          max="${remainingToTake(item)}"
          value="0"
        >

      </div>

    `).join("");

}


// ===============================
// ADD SHIPMENT
// ===============================

function shipment() {

  const rental =
    DATA.rentals.find(
      r =>
        r.id ===
        $("sr").value
    );


  if (!rental) {

    alert(
      "❌ Арендаро интихоб кун."
    );

    return;
  }


  const shipmentItems = [];


  const inputs =
    document.querySelectorAll(
      ".sqty"
    );


  for (const input of inputs) {

    const quantity =
      Math.floor(
        num(input.value)
      );


    if (quantity <= 0) {
      continue;
    }


    const item =
      rental.items.find(
        x =>
          x.key ===
          input.dataset.key
      );


    if (!item) {
      continue;
    }


    if (
      quantity >
      remainingToTake(item)
    ) {

      alert(
        "❌ Барои " +
        item.name +
        " танҳо " +
        remainingToTake(item) +
        " дона боқӣ мондааст."
      );

      return;
    }


    shipmentItems.push({

      key: item.key,

      name: item.name,

      qty: quantity

    });

  }


  if (!shipmentItems.length) {

    alert(
      "❌ Миқдори борро ворид кун."
    );

    return;
  }


  shipmentItems.forEach(shipmentItem => {

    const item =
      rental.items.find(
        x =>
          x.key ===
          shipmentItem.key
      );


    item.taken +=
      shipmentItem.qty;


    changeRented(
      item,
      shipmentItem.qty
    );

  });


  const number =
    DATA.shipments.filter(
      s =>
        s.rentalId ===
        rental.id
    ).length + 1;


  DATA.shipments.push({

    id: uid(),

    rentalId:
      rental.id,

    number:
      number,

    date:
      new Date().toISOString(),

    items:
      shipmentItems

  });


  persist();

  renderAll();


  alert(
    "✅ Бор №" +
    number +
    " сабт шуд."
  );

}


// ===============================
// RETURN FORM
// ===============================

function returnForm() {

  if (!$("rr")) {
    return;
  }


  const rental =
    DATA.rentals.find(
      r =>
        r.id ===
        $("rr").value
    );


  if (!rental) {

    $("retItems").innerHTML =
      "";

    return;
  }


  $("retItems").innerHTML =

    rental.items.map(item => `

      <div class="row">

        <b>
          ${escapeHTML(item.name)}
        </b>

        <br>

        Ҳоло назди муштарӣ:
        <b>
          ${currentlyOut(item)}
        </b>

        дона

        <input
          class="tqty"
          data-key="${escapeHTML(item.key)}"
          type="number"
          min="0"
          max="${currentlyOut(item)}"
          value="0"
        >

      </div>

    `).join("");

}


// ===============================
// RETURN GOODS
// ===============================

function ret() {

  const rental =
    DATA.rentals.find(
      r =>
        r.id ===
        $("rr").value
    );


  if (!rental) {

    alert(
      "❌ Арендаро интихоб кун."
    );

    return;
  }


  const returnedItems = [];


  const inputs =
    document.querySelectorAll(
      ".tqty"
    );


  for (const input of inputs) {

    const quantity =
      Math.floor(
        num(input.value)
      );


    if (quantity <= 0) {
      continue;
    }


    const item =
      rental.items.find(
        x =>
          x.key ===
          input.dataset.key
      );


    if (!item) {
      continue;
    }


    if (
      quantity >
      currentlyOut(item)
    ) {

      alert(
        "❌ Барои " +
        item.name +
        " танҳо " +
        currentlyOut(item) +
        " дона назди муштарӣ ҳаст."
      );

      return;
    }


    returnedItems.push({

      key: item.key,

      name: item.name,

      qty: quantity

    });

  }


  if (!returnedItems.length) {

    alert(
      "❌ Миқдори баргардонидашударо ворид кун."
    );

    return;
  }


  returnedItems.forEach(returned => {

    const item =
      rental.items.find(
        x =>
          x.key ===
          returned.key
      );


    item.returned +=
      returned.qty;


    changeRented(
      item,
      -returned.qty
    );

  });


  DATA.returns.push({

    id: uid(),

    rentalId:
      rental.id,

    date:
      new Date().toISOString(),

    items:
      returnedItems

  });


  rental.closed =
    rental.items.every(
      item =>
        remainingToTake(item) === 0 &&
        currentlyOut(item) === 0
    );


  persist();

  renderAll();


  alert(
    "✅ Баргардонидан сабт шуд."
  );

}


// ===============================
// RENTAL TOTAL
// ===============================

function rentalDailyTotal(rental) {

  let total = 0;


  rental.items.forEach(item => {

    let multiplier = 1;


    if (
      item.type === "pipe" &&
      item.mode === "meter"
    ) {

      multiplier =
        num(item.length);

    }


    if (
      item.type === "pipe" &&
      item.mode === "square"
    ) {

      multiplier =
        num(item.length);

    }


    total +=
      num(item.qty) *
      num(item.price) *
      multiplier;

  });


  return total;

}


function rentalDays(rental) {

  if (!rental.end) {
    return 1;
  }


  const start =
    new Date(rental.start);

  const end =
    new Date(rental.end);


  const diff =
    end.getTime() -
    start.getTime();


  return Math.max(
    1,
    Math.ceil(
      diff / 86400000
    )
  );

}


function rentalTotal(rental) {

  return (
    rentalDailyTotal(rental) *
    rentalDays(rental)
  );

}


function rentalDebt(rental) {

  return Math.max(
    0,
    rentalTotal(rental) -
    num(rental.paid)
  );

}


// ===============================
// PAYMENTS
// ===============================

function payment() {

  const rental =
    DATA.rentals.find(
      r =>
        r.id ===
        $("pr").value
    );


  const amount =
    num($("pamt").value);


  if (!rental) {

    alert(
      "❌ Арендаро интихоб кун."
    );

    return;
  }


  if (amount <= 0) {

    alert(
      "❌ Маблағро навис."
    );

    return;
  }


  rental.paid +=
    amount;


  DATA.payments.push({

    id: uid(),

    rentalId:
      rental.id,

    amount:
      amount,

    note:
      $("pnote").value.trim(),

    date:
      new Date().toISOString()

  });


  $("pamt").value = "";

  $("pnote").value = "";


  persist();

  renderAll();


  alert(
    "✅ Пардохт сабт шуд."
  );

}


// ===============================
// SALES
// ===============================

function sale() {

  const key =
    $("saleItem").value;


  const item =
    getItem(key);


  const quantity =
    Math.floor(
      num(
        $("saleQty").value
      )
    );


  const total =
    num(
      $("saleTotal").value
    );


  if (!item) {

    alert(
      "❌ Молро интихоб кун."
    );

    return;
  }


  if (quantity <= 0) {

    alert(
      "❌ Миқдори фурӯшро навис."
    );

    return;
  }


  if (
    quantity >
    available(item.stock)
  ) {

    alert(
      "❌ Дар анбор танҳо " +
      available(item.stock) +
      " дона ҳаст."
    );

    return;
  }


  item.stock.total -=
    quantity;


  DATA.sales.push({

    id: uid(),

    name:
      item.name,

    key:
      item.key,

    qty:
      quantity,

    total:
      total,

    buyer:
      $("saleBuyer").value.trim(),

    date:
      new Date().toISOString()

  });


  $("saleQty").value = "";
  $("saleTotal").value = "";
  $("saleBuyer").value = "";


  persist();

  renderAll();


  alert(
    "✅ Фурӯш сабт шуд ва миқдор аз анбор кам шуд."
  );

}


// ===============================
// FILL SELECTS
// ===============================

function fillSelects() {

  const customerOptions =

    `<option value="">
      Интихоб кунед
    </option>` +

    DATA.customers.map(
      customer => `

        <option value="${escapeHTML(customer.id)}">

          ${escapeHTML(customer.name)}

        </option>

      `
    ).join("");


  if ($("rc")) {
    $("rc").innerHTML =
      customerOptions;
  }


  if ($("hc")) {
    $("hc").innerHTML =
      customerOptions;
  }


  if ($("rpj")) {

    $("rpj").innerHTML =

      `<option value="">
        Бе объект
      </option>` +

      DATA.projects.map(
        project => `

          <option value="${escapeHTML(project.id)}">

            ${escapeHTML(project.name)}

          </option>

        `
      ).join("");

  }


  const activeRentals =
    DATA.rentals.filter(
      rental =>
        !rental.closed
    );


  const rentalOptions =

    `<option value="">
      Интихоб кунед
    </option>` +

    activeRentals.map(
      rental => {

        const customer =
          DATA.customers.find(
            c =>
              c.id ===
              rental.customerId
          );


        return `

          <option value="${escapeHTML(rental.id)}">

            ${escapeHTML(
              customer?.name ||
              "Муштарӣ"
            )}

            · ${escapeHTML(
              dateText(rental.start)
            )}

          </option>

        `;

      }
    ).join("");


  [
    "sr",
    "rr",
    "pr",
    "receiptR"
  ].forEach(id => {

    if ($(id)) {

      $(id).innerHTML =
        rentalOptions;

    }

  });


  if ($("saleItem")) {

    $("saleItem").innerHTML =

      rentalOptionsForSale();

  }

}


function rentalOptionsForSale() {

  return rentalOptions()
    .map(item => `
      <option value="${escapeHTML(item.key)}">
        ${escapeHTML(item.name)}
        — ${item.available}
      </option>
    `)
    .join("");

}


// ===============================
// INVENTORY RENDER
// ===============================

function renderInventory() {

  if (!$("invSummary")) {
    return;
  }


  const pipeTotal =
    PIPE_SIZES.reduce(
      (sum, p) =>
        sum +
        num(
          DATA.inventory
            .pipes[p[0]]
            .total
        ),
      0
    );


  const pipeRented =
    PIPE_SIZES.reduce(
      (sum, p) =>
        sum +
        num(
          DATA.inventory
            .pipes[p[0]]
            .rented
        ),
      0
    );


  const lessaTotal =
    num(
      DATA.inventory
        .lessa.total
    );


  const lessaRented =
    num(
      DATA.inventory
        .lessa.rented
    );


  const clampTotal =
    CLAMP_TYPES.reduce(
      (sum, type) =>
        sum +
        num(
          DATA.inventory
            .clamps[type]
            .total
        ),
      0
    );


  const clampRented =
    CLAMP_TYPES.reduce(
      (sum, type) =>
        sum +
        num(
          DATA.inventory
            .clamps[type]
            .rented
        ),
      0
    );


  const jackTotal =
    num(
      DATA.inventory.jack.total
    );


  const jackRented =
    num(
      DATA.inventory.jack.rented
    );


  $("invSummary").innerHTML = [

    [
      "🔩",
      "Труба",
      pipeTotal,
      pipeRented
    ],

    [
      "🏗️",
      "Леса",
      lessaTotal,
      lessaRented
    ],

    [
      "🔗",
      "Хамут",
      clampTotal,
      clampRented
    ],

    [
      "🔧",
      "Дамкрат",
      jackTotal,
      jackRented
    ]

  ].map(x => `

    <div class="card stat">

      ${x[0]}

      <div class="big">
        ${x[2]}
      </div>

      <span class="muted">

        ${x[1]}
        · Аренда ${x[3]}
        · Холӣ ${x[2] - x[3]}

      </span>

    </div>

  `).join("");


  if ($("pipeGrid")) {

    $("pipeGrid").innerHTML =

      PIPE_SIZES.map(
        pipe => {

          const stock =
            DATA.inventory
              .pipes[pipe[0]];


          return `

            <div class="pbox">

              <b>
                ${pipe[1]}
              </b>

              <br>

              Ҳама:
              ${stock.total}

              <br>

              Аренда:
              ${stock.rented}

              <br>

              Холӣ:
              <b>
                ${available(stock)}
              </b>

            </div>

          `;

        }
      ).join("");

  }


  if ($("clampOut")) {

    $("clampOut").innerHTML =

      CLAMP_TYPES.map(
        type => {

          const stock =
            DATA.inventory
              .clamps[type];


          return `

            <div class="row">

              🔗
              <b>${type}</b>

              · Ҳама:
              ${stock.total}

              · Аренда:
              ${stock.rented}

              · Холӣ:
              ${available(stock)}

            </div>

          `;

        }
      ).join("");

  }

}


// ===============================
// PIPE ADD FORM
// ===============================

function renderPipeForm() {

  if (!$("pipeRows")) {
    return;
  }


  $("pipeRows").innerHTML =

    PIPE_SIZES.map(
      pipe => {

        const stock =
          DATA.inventory
            .pipes[pipe[0]];


        return `

          <tr>

            <td>

              <input
                id="ck${pipe[0]}"
                type="checkbox"
              >

            </td>


            <td>

              <b>
                ${pipe[1]}
              </b>

              <br>

              <small class="muted">

                Холӣ:
                ${available(stock)}

              </small>

            </td>


            <td>

              <input
                id="q${pipe[0]}"
                type="number"
                min="0"
                placeholder="0"
              >

            </td>


            <td>

              <input
                id="pr${pipe[0]}"
                type="number"
                min="0"
                value="${stock.price || 0}"
              >

            </td>

          </tr>

        `;

      }
    ).join("");

}


// ===============================
// CUSTOMERS RENDER
// ===============================

function renderCustomers() {

  if (!$("customersTable")) {
    return;
  }


  if (!DATA.customers.length) {

    $("customersTable").innerHTML =
      "👤 Ҳоло муштарӣ нест.";

    return;
  }


  $("customersTable").innerHTML = `

    <table>

      <tr>

        <th>
          Ном
        </th>

        <th>
          Телефон
        </th>

        <th>
          Адрес
        </th>

      </tr>


      ${DATA.customers.map(
        customer => `

          <tr>

            <td>
              ${escapeHTML(
                customer.name
              )}
            </td>

            <td>
              ${escapeHTML(
                customer.phone
              )}
            </td>

            <td>
              ${escapeHTML(
                customer.address
              )}
            </td>

          </tr>

        `
      ).join("")}

    </table>

  `;

}


// ===============================
// PROJECT RENDER
// ===============================

function renderProjects() {

  if (!$("projectsOut")) {
    return;
  }


  if (!DATA.projects.length) {

    $("projectsOut").innerHTML =
      "🏗️ Объект нест.";

    return;
  }


  $("projectsOut").innerHTML =

    DATA.projects.map(
      project => `

        <div class="row">

          🏗️
          <b>
            ${escapeHTML(
              project.name
            )}
          </b>

          <br>

          📍
          ${escapeHTML(
            project.address
          )}

          <br>

          📐
          ${project.area || 0}
          м²

          ·

          Баландӣ:
          ${project.height || 0}
          м

        </div>

      `
    ).join("");

}


// ===============================
// CUSTOMER HISTORY
// ===============================

function renderHistory() {

  if (!$("historyOut")) {
    return;
  }


  const customerId =
    $("hc").value;


  if (!customerId) {

    $("historyOut").innerHTML =
      "👤 Муштариро интихоб кун.";

    return;
  }


  const rentals =
    DATA.rentals.filter(
      rental =>
        rental.customerId ===
        customerId
    );


  if (!rentals.length) {

    $("historyOut").innerHTML =
      "📜 Барои ин муштарӣ таърих нест.";

    return;
  }


  $("historyOut").innerHTML =

    rentals.map(
      rental => `

        <div class="row">

          <b>
            📝 Аренда
          </b>

          <br>

          📅
          ${dateText(
            rental.start
          )}

          <br><br>

          ${rental.items.map(
            item => `

              ${escapeHTML(
                item.name
              )}

              :

              нақша
              ${item.planned}

              · гирифта
              ${item.taken}

              · баргашт
              ${item.returned}

              · ҳоло назди муштарӣ
              ${currentlyOut(item)}

              <br>

            `
          ).join("")}

          <br>

          💰 Пардохт:
          <b>
            ${money(
              rental.paid
            )}
          </b>

          сомонӣ

          <br>

          💳 Қарз:
          <b>
            ${money(
              rentalDebt(rental)
            )}
          </b>

          сомонӣ

        </div>

      `
    ).join("");

}


// ===============================
// SHIPMENT HISTORY
// ===============================

function renderShipmentHistory() {

  if (!$("shipOut")) {
    return;
  }


  if (!DATA.shipments.length) {

    $("shipOut").innerHTML =
      "🚚 Ҳоло бор нест.";

    return;
  }


  $("shipOut").innerHTML =

    DATA.shipments
      .slice()
      .reverse()
      .map(
        shipment => `

          <div class="row">

            🚚
            <b>
              Бор №${shipment.number}
            </b>

            <br>

            📅
            ${dateText(
              shipment.date
            )}

            <br>

            ${shipment.items.map(
              item => `

                ${escapeHTML(
                  item.name
                )}

                ×

                ${item.qty}

                <br>

              `
            ).join("")}

          </div>

        `
      ).join("");

}


// ===============================
// RETURN HISTORY
// ===============================

function renderReturnHistory() {

  if (!$("retOut")) {
    return;
  }


  if (!DATA.returns.length) {

    $("retOut").innerHTML =
      "🔄 Ҳоло баргардонӣ нест.";

    return;
  }


  $("retOut").innerHTML =

    DATA.returns
      .slice()
      .reverse()
      .map(
        returned => `

          <div class="row">

            🔄
            <b>
              Баргардонидан
            </b>

            <br>

            📅
            ${dateText(
              returned.date
            )}

            <br>

            ${returned.items.map(
              item => `

                ${escapeHTML(
                  item.name
                )}

                ×

                ${item.qty}

                <br>

              `
            ).join("")}

          </div>

        `
      ).join("");

}


// ===============================
// PAYMENT HISTORY
// ===============================

function renderPayments() {

  if (!$("payOut")) {
    return;
  }


  if (!DATA.payments.length) {

    $("payOut").innerHTML =
      "💰 Пардохт нест.";

    return;
  }


  $("payOut").innerHTML =

    DATA.payments
      .slice()
      .reverse()
      .map(
        payment => `

          <div class="row">

            💰
            <b>
              ${money(
                payment.amount
              )}
              сомонӣ
            </b>

            <br>

            📅
            ${dateText(
              payment.date
            )}

            <br>

            ${escapeHTML(
              payment.note || ""
            )}

          </div>

        `
      ).join("");

}


// ===============================
// SALES HISTORY
// ===============================

function renderSales() {

  if (!$("salesOut")) {
    return;
  }


  if (!DATA.sales.length) {

    $("salesOut").innerHTML =
      "🛒 Фурӯш нест.";

    return;
  }


  $("salesOut").innerHTML =

    DATA.sales
      .slice()
      .reverse()
      .map(
        saleItem => `

          <div class="row">

            🛒
            <b>
              ${escapeHTML(
                saleItem.name
              )}
            </b>

            ×

            ${saleItem.qty}

            <br>

            💰
            ${money(
              saleItem.total
            )}
            сомонӣ

            <br>

            👤
            ${escapeHTML(
              saleItem.buyer
            )}

            <br>

            📅
            ${dateText(
              saleItem.date
            )}

          </div>

        `
      ).join("");

}


// ===============================
// DASHBOARD
// ===============================

function renderDashboard() {

  if (!$("sCus")) {
    return;
  }


  const stockTotal =
    PIPE_SIZES.reduce(
      (sum, pipe) =>
        sum +
        available(
          DATA.inventory
            .pipes[pipe[0]]
        ),
      0
    ) +

    available(
      DATA.inventory.lessa
    ) +

    CLAMP_TYPES.reduce(
      (sum, type) =>
        sum +
        available(
          DATA.inventory
            .clamps[type]
        ),
      0
    ) +

    available(
      DATA.inventory.jack
    );


  $("sCus").textContent =
    DATA.customers.length;


  $("sStock").textContent =
    stockTotal;


  $("sRent").textContent =
    DATA.rentals.filter(
      r => !r.closed
    ).length;


  const totalDebt =
    DATA.rentals.reduce(
      (sum, rental) =>
        sum +
        rentalDebt(rental),
      0
    );


  $("sDebt").textContent =
    money(totalDebt);


  if ($("dashProblems")) {

    const list =
      getProblems();


    $("dashProblems").innerHTML =

      list.slice(0, 5)
        .map(
          problem => `

            <div class="row danger">

              ${problem}

            </div>

          `
        )
        .join("") ||

      "✅ Ҳама чиз хуб аст.";

  }

}


// ===============================
// PROBLEM CENTER
// ===============================

function getProblems() {

  const problems = [];


  PIPE_SIZES.forEach(
    pipe => {

      const stock =
        DATA.inventory
          .pipes[pipe[0]];


      if (
        stock.total > 0 &&
        available(stock) === 0
      ) {

        problems.push(
          "🔩 Трубаи " +
          pipe[1] +
          " тамом шудааст."
        );

      }

    }
  );


  DATA.rentals.forEach(
    rental => {

      const debt =
        rentalDebt(rental);


      if (debt > 0) {

        const customer =
          DATA.customers.find(
            c =>
              c.id ===
              rental.customerId
          );


        problems.push(
          "💳 Қарзи " +
          (
            customer?.name ||
            "муштарӣ"
          ) +
          ": " +
          money(debt) +
          " сомонӣ"
        );

      }


      rental.items.forEach(
        item => {

          if (
            num(item.missing) > 0
          ) {

            problems.push(
              "❌ Камомад: " +
              item.name +
              " × " +
              item.missing
            );

          }

        }
      );

    }
  );


  return problems;

}


function renderProblems() {

  if (!$("problemOut")) {
    return;
  }


  const problems =
    getProblems();


  $("problemOut").innerHTML =

    problems.map(
      problem => `

        <div class="row danger">

          ${escapeHTML(problem)}

        </div>

      `
    ).join("") ||

    "✅ Мушкилот нест.";

}


// ===============================
// SMART AI
// ===============================

function smart() {

  const question =
    $("sq").value
      .trim()
      .toLowerCase();


  let answer = "";


  if (
    question.includes("қарз")
  ) {

    const totalDebt =
      DATA.rentals.reduce(
        (sum, rental) =>
          sum +
          rentalDebt(rental),
        0
      );


    answer =
      "💳 Қарзи умумӣ: " +
      money(totalDebt) +
      " сомонӣ.";

  }

  else if (
    question.includes("анбор") ||
    question.includes("мол")
  ) {

    answer =
      "📦 Барои дидани миқдори ҳар мол ба «Анбор» даро.";

  }

  else if (
    question.includes("муштар")
  ) {

    answer =
      "👤 Ҳоло " +
      DATA.customers.length +
      " муштарӣ сабт шудааст.";

  }

  else {

    answer =
      "🧠 Ман метавонам ба ту дар бораи анбор, аренда, қарз ва муштариён маълумот диҳам.";

  }


  $("smartOut").innerHTML = `

    <div class="row">

      ${escapeHTML(answer)}

    </div>

  `;

}


// ===============================
// CALENDAR
// ===============================

function calendar() {

  if (!$("calOut")) {
    return;
  }


  const date =
    $("cal").value;


  const rentals =
    DATA.rentals.filter(
      rental =>
        (
          rental.start ||
          ""
        ).slice(0, 10) === date
    );


  if (!rentals.length) {

    $("calOut").innerHTML =
      "📅 Барои ин рӯз кор нест.";

    return;
  }


  $("calOut").innerHTML =

    rentals.map(
      rental => {

        const customer =
          DATA.customers.find(
            c =>
              c.id ===
              rental.customerId
          );


        return `

          <div class="row">

            📝 Аренда

            <br>

            👤
            ${escapeHTML(
              customer?.name ||
              "Муштарӣ"
            )}

            <br>

            🕐
            ${dateText(
              rental.start
            )}

          </div>

        `;

      }
    ).join("");

}


// ===============================
// ANALYTICS
// ===============================

function analytics() {

  if (!$("analyticsOut")) {
    return;
  }


  const payments =
    DATA.payments.reduce(
      (sum, p) =>
        sum +
        num(p.amount),
      0
    );


  const sales =
    DATA.sales.reduce(
      (sum, s) =>
        sum +
        num(s.total),
      0
    );


  $("analyticsOut").innerHTML = `

    📋 Арендаҳо:
    <b>${DATA.rentals.length}</b>

    <br>

    🚚 Борҳо:
    <b>${DATA.shipments.length}</b>

    <br>

    🔄 Баргардониҳо:
    <b>${DATA.returns.length}</b>

    <br>

    💰 Пардохтҳо:
    <b>${money(payments)}</b>
    сомонӣ

    <br>

    🛒 Фурӯш:
    <b>${money(sales)}</b>
    сомонӣ

  `;

}


// ===============================
// PROFIT
// ===============================

function profit() {

  if (!$("profitOut")) {
    return;
  }


  const payments =
    DATA.payments.reduce(
      (sum, p) =>
        sum +
        num(p.amount),
      0
    );


  const sales =
    DATA.sales.reduce(
      (sum, s) =>
        sum +
        num(s.total),
      0
    );


  const income =
    payments +
    sales;


  $("profitOut").innerHTML = `

    💰 Даромад:

    <b>
      ${money(income)}
      сомонӣ
    </b>

    <br><br>

    <span class="muted">

      Барои ҳисоб кардани фоидаи ҳақиқӣ
      арзиши хариди молҳо ҳам лозим аст.

    </span>

  `;

}


// ===============================
// FORECAST
// ===============================

function forecast() {

  if (!$("forecastOut")) {
    return;
  }


  const warnings = [];


  PIPE_SIZES.forEach(
    pipe => {

      const stock =
        DATA.inventory
          .pipes[pipe[0]];


      if (
        stock.total > 0 &&
        available(stock) <=
        Math.max(
          2,
          Math.ceil(
            stock.total * 0.15
          )
        )
      ) {

        warnings.push(

          pipe[1] +
          " — танҳо " +
          available(stock) +
          " дона холӣ."

        );

      }

    }
  );


  $("forecastOut").innerHTML =

    warnings.map(
      warning => `

        <div class="row danger">

          ⚠️
          ${escapeHTML(warning)}

        </div>

      `
    ).join("") ||

    "✅ Ҳоло камшавии ҷиддӣ нест.";

}


// ===============================
// DEBT
// ===============================

function debtPage() {

  if (!$("debtOut")) {
    return;
  }


  const debts =
    DATA.rentals.filter(
      rental =>
        rentalDebt(rental) > 0
    );


  if (!debts.length) {

    $("debtOut").innerHTML =
      "✅ Қарз нест.";

    return;
  }


  $("debtOut").innerHTML =

    debts.map(
      rental => {

        const customer =
          DATA.customers.find(
            c =>
              c.id ===
              rental.customerId
          );


        return `

          <div class="row danger">

            👤
            <b>
              ${escapeHTML(
                customer?.name ||
                "Муштарӣ"
              )}
            </b>

            <br>

            💳 Қарз:
            <b>
              ${money(
                rentalDebt(rental)
              )}
              сомонӣ
            </b>

          </div>

        `;

      }
    ).join("");

}


// ===============================
// RECEIPT
// ===============================

function receipt() {

  if (!$("receiptOut")) {
    return;
  }


  const rental =
    DATA.rentals.find(
      r =>
        r.id ===
        $("receiptR").value
    );


  if (!rental) {

    $("receiptOut").innerHTML =
      "";

    return;
  }


  const customer =
    DATA.customers.find(
      c =>
        c.id ===
        rental.customerId
    );


  $("receiptOut").innerHTML = `

    <div
      class="card"
      id="print"
    >

      <h2>
        RENTAL PRO
      </h2>

      <hr>

      👤 Муштарӣ:
      <b>
        ${escapeHTML(
          customer?.name ||
          "—"
        )}
      </b>

      <br>

      📅
      ${dateText(
        rental.start
      )}

      <hr>

      ${rental.items.map(
        item => `

          ${escapeHTML(
            item.name
          )}

          ×
          ${item.qty}

          =
          ${money(
            item.qty *
            item.price
          )}

          сомонӣ / рӯз

          <br>

        `
      ).join("")}

      <hr>

      💰 Пардохт:
      ${money(
        rental.paid
      )}
      сомонӣ

      <br>

      💳 Қарз:
      ${money(
        rentalDebt(rental)
      )}
      сомонӣ

    </div>

  `;

}


// ===============================
// PRINT
// ===============================

function printR() {

  const element =
    $("print");


  if (!element) {

    alert(
      "❌ Аввал Receipt-ро интихоб кун."
    );

    return;
  }


  const windowPrint =
    window.open(
      "",
      "_blank"
    );


  if (!windowPrint) {

    alert(
      "❌ Chrome равзанаи Print-ро баст."
    );

    return;
  }


  windowPrint.document.write(`

    <html>

      <head>

        <title>
          Rental Pro Receipt
        </title>

        <style>

          body{
            font-family:Arial;
            padding:30px;
          }

        </style>

      </head>

      <body>

        ${element.outerHTML}

      </body>

    </html>

  `);


  windowPrint.document.close();

  windowPrint.focus();

  windowPrint.print();

}


// ===============================
// MATERIAL CALCULATOR
// ===============================

function material() {

  const area =
    num($("ma").value);

  const height =
    num($("mh").value);


  if (
    area <= 0 ||
    height <= 0
  ) {

    alert(
      "❌ Масоҳат ва баландиро навис."
    );

    return;
  }


  const volume =
    area *
    height;


  $("matOut").innerHTML = `

    <div class="row">

      📐 Масоҳат:
      <b>
        ${area}
        м²
      </b>

      <br>

      📏 Баландӣ:
      <b>
        ${height}
        м
      </b>

      <br>

      📦 Ҳаҷм:
      <b>
        ${volume.toFixed(2)}
        м³
      </b>

    </div>

  `;

}


// ===============================
// SETTINGS
// ===============================

function saveSettings() {

  const name =
    $("sys").value.trim();


  localStorage.setItem(
    "rentalProSettings",
    JSON.stringify({
      name: name
    })
  );


  alert(
    "✅ Танзимот сабт шуд."
  );

}


// ===============================
// BACKUP
// ===============================

function backup() {

  const backupData = {

    inventory:
      DATA.inventory,

    customers:
      DATA.customers,

    rentals:
      DATA.rentals,

    shipments:
      DATA.shipments,

    returns:
      DATA.returns,

    payments:
      DATA.payments,

    sales:
      DATA.sales,

    projects:
      DATA.projects

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backupData,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const link =
    document.createElement("a");


  link.href =
    URL.createObjectURL(
      blob
    );


  link.download =
    "rental-pro-backup.json";


  link.click();

}


// ===============================
// CLEAR DATA
// ===============================

function wipe() {

  const answer =
    confirm(
      "⚠️ ҲАМА маълумот тоза шавад?"
    );


  if (!answer) {
    return;
  }


  Object.values(KEY)
    .forEach(
      key =>
        localStorage.removeItem(
          key
        )
    );


  location.reload();

}


// ===============================
// RENDER ALL
// ===============================

function renderAll() {

  if (!DATA.inventory) {
    return;
  }


  fillSelects();

  renderDashboard();

  renderInventory();

  renderPipeForm();

  renderCustomers();

  renderProjects();

  renderHistory();

  shipForm();

  returnForm();

  renderShipmentHistory();

  renderReturnHistory();

  renderPayments();

  renderSales();

  analytics();

  profit();

  forecast();

  debtPage();

  renderProblems();

  calendar();


  if (
    $("rentRows") &&
    !document.querySelector(".rr")
  ) {

    rentRow();

  }


  calculateDailyRows();

}


// ===============================
// EVENT LISTENERS
// ===============================

document.addEventListener(
  "input",
  event => {

    if (
      event.target.closest(
        "#rentRows"
      )
    ) {

      calculateDailyRows();

    }

  }
);


document.addEventListener(
  "change",
  event => {

    if (
      event.target.matches(
        "#hc"
      )
    ) {

      renderHistory();

    }


    if (
      event.target.matches(
        "#sr"
      )
    ) {

      shipForm();

    }


    if (
      event.target.matches(
        "#rr"
      )
    ) {

      returnForm();

    }


    if (
      event.target.matches(
        "#receiptR"
      )
    ) {

      receipt();

    }


    if (
      event.target.matches(
        "#cal"
      )
    ) {

      calendar();

    }

  }
);


// ===============================
// START APP
// ===============================

init();