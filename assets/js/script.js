document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelector(selector);

  const taskInput = $("taskInput");
  const addTaskButton = $("addTaskButton");
  const blurButton = $("blurButton");
  const blurIcon = $("blurIcon");
  const unblurIcon = $("unblurIcon");
  const taskList = $("taskList");
  const taskBody = $("taskBody");
  const searchInput = $("searchInput");
  const searchButton = $("searchButton");
  const searchResults = $("searchResults");
  const weatherInfo = $("weatherInfo");
  const dateTimeInfo = $("dateTimeInfo");
  const calendarTitle = $("calendarTitle");
  const calendarBody = $("calendarBody");
  const bookmarksContainer = $("bookmarks");
  const addBookmarkButton = $("addBookmark");
  const bookmarkModal = $("bookmarkModal");
  const closeModalButton = $$(".close");
  const saveBookmarkButton = $("saveBookmark");
  const bookmarkUrl = $("bookmarkUrl");
  const bookmarkName = $("bookmarkName");
  const bookmarkEmoji = $("bookmarkEmoji");

  const weatherApiKey = "3045dd712ffe6e702e3245525ac7fa38";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=Tehran&units=metric&appid=${weatherApiKey}`;

  const weatherEmojis = {
    "clear sky": "☀️",
    "few clouds": "🌤️",
    "scattered clouds": "🌥️",
    "broken clouds": "☁️",
    "shower rain": "🌧️",
    rain: "🌧️",
    thunderstorm: "⛈️",
    snow: "❄️",
    mist: "🌫️",
    haze: "⚠️",
  };

  const weatherTranslations = {
    "clear sky": "آسمان صاف",
    "few clouds": "کمی ابر",
    "scattered clouds": "ابرهای پراکنده",
    "broken clouds": "ابرهای شکسته",
    "shower rain": "باران رگباری",
    rain: "باران",
    thunderstorm: "طوفان رعد و برق",
    snow: "برف",
    mist: "مه",
    haze: "غبار آلود",
  };

  const temperatureDescriptions = {
    "0-5": "هوا سردههه 😶‍🌫️",
    "6-15": "چایی میچسبه 🍵",
    "16-25": "هوا اوکیه",
    "26-35": "هوا گرمهههه 🫠",
    "36-100": "هوا آتیشه 💀",
  };

  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  const getTasksFromLocalStorage = () => {
    try {
      return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
      return [];
    }
  };
  const saveTasksToLocalStorage = (tasks) =>
    localStorage.setItem("tasks", JSON.stringify(tasks));

  function loadTasks() {
    const tasks = getTasksFromLocalStorage();
    for (const task of tasks) {
      addTaskToList(task.text, task.done);
    }
  }

  function saveTask(text, done = false) {
    const tasks = getTasksFromLocalStorage();
    tasks.push({ text, done });
    saveTasksToLocalStorage(tasks);
  }

  function updateTask(index, task) {
    const tasks = getTasksFromLocalStorage();
    if (index > -1) {
      tasks[index] = task;
      saveTasksToLocalStorage(tasks);
    }
  }

  function deleteTask(index) {
    const tasks = getTasksFromLocalStorage();
    if (index > -1) {
      tasks.splice(index, 1);
      saveTasksToLocalStorage(tasks);
    }
  }

  function loadBlurStatus() {
    const isBlurred = JSON.parse(localStorage.getItem("isBlurred")) || false;
    taskBody.classList.toggle("blur", isBlurred);
    blurIcon.style.display = isBlurred ? "none" : "inline";
    unblurIcon.style.display = isBlurred ? "inline" : "none";
  }

  const getTemperatureDescription = (temp) => {
    if (temp >= 0 && temp <= 5) return temperatureDescriptions["0-5"];
    if (temp <= 15) return temperatureDescriptions["6-15"];
    if (temp <= 25) return temperatureDescriptions["16-25"];
    if (temp <= 35) return temperatureDescriptions["26-35"];
    if (temp >= 36) return temperatureDescriptions["36-100"];
    return "دمای نامشخص";
  };

  async function fetchWeather() {
    try {
      const res = await fetch(weatherUrl);
      const data = await res.json();
      const { description } = data.weather[0];
      const emoji = weatherEmojis[description] || "🌈";
      const translation = weatherTranslations[description] || description;
      const temp = Math.round(data.main.temp);
      const tempDescription = getTemperatureDescription(temp);

      weatherInfo.innerHTML = `
        <h2>${temp}° ${emoji}</h2>
        <h3>${tempDescription}</h3>
        <p>${translation} . ${data.main.humidity}%</p>
      `;
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  }

  function updateDateTime() {
    const now = new Date();
    const jalaliDate = jalaali.toJalaali(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );

    const dateString = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const jalaliDateString = `${jalaliDate.jd} ${
      persianMonths[jalaliDate.jm - 1]
    } ${jalaliDate.jy}`;
    const timeString = `${String(now.getHours() % 12 || 12).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    const dateEl = dateTimeInfo.querySelector(".date");
    const jdateEl = dateTimeInfo.querySelector(".jdate");
    const timeEl = dateTimeInfo.querySelector(".time");

    if (dateEl) dateEl.textContent = dateString;
    if (jdateEl) jdateEl.textContent = jalaliDateString;
    if (timeEl) timeEl.textContent = timeString;
  }

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function generateCalendar(month, year) {
    calendarBody.innerHTML = "";

    const options = { month: "long", year: "numeric" };
    calendarTitle.textContent = new Date(year, month).toLocaleDateString(
      "en-US",
      options
    );

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");
        if (i === 0 && j < firstDay) {
          cell.textContent = "";
          cell.classList.add("empty-cell");
        } else if (date > daysInMonth) {
          cell.textContent = "";
          cell.classList.add("empty-cell");
        } else {
          cell.textContent = date;
          if (
            date === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear()
          ) {
            cell.classList.add("today");
          }
          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }
  }

  document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });

  function createBookmarkTile(url, name, emoji) {
    const tile = document.createElement("div");
    tile.classList.add("bookmark-tile");

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-bookmark");
    deleteBtn.innerHTML = "✖"; 
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteBookmark(url);
      tile.remove();
    });

    tile.innerHTML = `<span>${emoji}</span><p>${name}</p>`;
    tile.appendChild(deleteBtn);

    tile.addEventListener("click", () => window.open(url, "_blank"));
    bookmarksContainer.appendChild(tile);
  }

  function deleteBookmark(url) {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks = bookmarks.filter((bookmark) => bookmark.url !== url);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  function saveBookmark(url, name, emoji) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks.push({ url, name, emoji });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    createBookmarkTile(url, name, emoji);
  }

  function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks.forEach((bookmark) =>
      createBookmarkTile(bookmark.url, bookmark.name, bookmark.emoji)
    );
  }

  function addTaskToList(text, done = false) {
    const taskDiv = document.getElementById("taskTemplate").cloneNode(true);
    taskDiv.style.display = "";
    taskDiv.querySelector(".task-text").textContent = text;
    const taskDoneCheckbox = taskDiv.querySelector(".task-done");
    taskDoneCheckbox.checked = done;
    taskDiv.classList.toggle("done", done);

    taskDoneCheckbox.addEventListener("change", function () {
      const taskIndex = [...taskList.children].indexOf(taskDiv);
      updateTask(taskIndex, { text, done: this.checked });
      taskDiv.classList.toggle("done", this.checked);
    });

    taskDiv.querySelector(".edit-task").addEventListener("click", function () {
      taskInput.value = text;
      deleteTask([...taskList.children].indexOf(taskDiv));
      taskDiv.remove();
    });

    taskDiv
      .querySelector(".delete-task")
      .addEventListener("click", function () {
        deleteTask([...taskList.children].indexOf(taskDiv));
        taskDiv.remove();
      });

    taskList.appendChild(taskDiv);
  }

  addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    addTaskToList(taskText);
    saveTask(taskText);

    taskInput.value = "";
  });

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query)
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
  });

  searchInput.addEventListener("focus", () => {
    chrome.history.search({ text: "", maxResults: 10 }, (results) => {
      searchResults.innerHTML = "";
      results.forEach((result) => {
        if (result.url.includes("https://www.google.com/search")) {
          const div = document.createElement("div");
          div.className = "search-item";
          div.textContent =
            result.title.replace(/ - (YouTube|Google Search)$/, "") ||
            result.url;
          div.addEventListener("click", () =>
            window.open(result.url, "_blank")
          );
          searchResults.appendChild(div);
        }
      });
    });
  });

  searchInput.addEventListener("blur", () => {
    setTimeout(() => (searchResults.innerHTML = ""), 100);
  });

  addBookmarkButton.addEventListener(
    "click",
    () => (bookmarkModal.style.display = "block")
  );

  closeModalButton.addEventListener(
    "click",
    () => (bookmarkModal.style.display = "none")
  );

  window.addEventListener("click", (event) => {
    if (event.target === bookmarkModal) bookmarkModal.style.display = "none";
  });

  saveBookmarkButton.addEventListener("click", () => {
    if (bookmarkUrl.value && bookmarkName.value && bookmarkEmoji.value) {
      saveBookmark(bookmarkUrl.value, bookmarkName.value, bookmarkEmoji.value);
      bookmarkModal.style.display = "none";
      bookmarkUrl.value = "";
      bookmarkName.value = "";
      bookmarkEmoji.value = "";
    }
  });

  setInterval(updateDateTime, 1000);

  blurButton.addEventListener("click", () => {
    const isBlurred = taskBody.classList.toggle("blur");
    localStorage.setItem("isBlurred", JSON.stringify(isBlurred));
    blurIcon.style.display = isBlurred ? "none" : "inline";
    unblurIcon.style.display = isBlurred ? "inline" : "none";
  });

  loadBlurStatus();
  loadTasks();
  fetchWeather();
  loadBookmarks();
  generateCalendar(currentMonth, currentYear);

  var menuButton = document.getElementById("menuButton");
  var menu = document.getElementById("menu");

  menuButton.addEventListener("click", function () {
    if (menu.style.display === "block") {
      menu.style.display = "none";
    } else {
      menu.style.display = "block";
    }
  });

  window.addEventListener("click", function (event) {
    if (!event.target.closest("#menuButton")) {
      if (menu.style.display === "block") {
        menu.style.display = "none";
      }
    }
  });

  const apiUrl =
    "https://corsproxy.io/?url=https://api.dastyar.io/express/financial-item";

  async function fetchData() {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const tileContainer = document.getElementById("tileContainer");
      tileContainer.innerHTML = ""; // clear old data

      const formattedValue = (price) => {
        const number = Number(price);

        if (number >= 1000000) {
          return (number / 1000000).toFixed(1) + "M";
        } else if (number >= 1000) {
          return (number / 1000).toFixed(1) + "K";
        } else {
          return number.toLocaleString();
        }
      };

      // ✅ Only keep required items
      const allowedKeys = ["usd_btc", "18ayar", "sekkeh", "usd", "eur", "gbp"];

      data
        .filter((item) => allowedKeys.includes(item.key))
        .forEach((item) => {
          const tile = document.createElement("div");
          tile.className = "tile";

          const changeColor =
            item.change > 0 ? "green" : item.change < 0 ? "red" : "#fff";

          const formattedPrice = formattedValue(item.price);
          const formattedChange = Number(item.change).toFixed(2);

          tile.innerHTML = `
          <div class="tile-info">
            <div class="tile-text">
              <img src="https://liara-s3.dastyar.io/Img/icons/finance/${item.image}" alt="${item.title}">
              <h3>${item.title}: </h3>
              <p>${formattedPrice} <span>${item.currency}</span></p>
            </div>
          </div>
          <div class="value">
            <div class="change" style="color: ${changeColor};">(${formattedChange}%)</div>
          </div>
        `;

          tileContainer.appendChild(tile);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  fetchData();
});

const statusEl = document.getElementById("status");
const pingEl = document.getElementById("ping");
const ispEl = document.getElementById("isp");
const ipEl = document.getElementById("ip");

async function checkConnection() {
  if (!navigator.onLine) {
    statusEl.textContent = "وضعیت: ❌ آب قطعه";
    pingEl.textContent = "";
    return;
  }

  statusEl.textContent = "وضعیت: دارم تست میکنم ...";
  pingEl.textContent = "";

  const url = "https://www.cloudflare.com/cdn-cgi/trace";
  let start = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    let end = performance.now();
    let ping = Math.round(end - start);

    const text = await res.text();

    let ipMatch = text.match(/ip=([^\n]+)/);
    let locMatch = text.match(/loc=([^\n]+)/);

    let countryCode = locMatch ? locMatch[1] : null;
    let countryName = countryCode
      ? new Intl.DisplayNames(["fa"], { type: "region" }).of(countryCode)
      : "N/A";

    statusEl.textContent = "وضعیت: ✅ وصلی";
    pingEl.innerHTML = `پینگ: <span>${ping} میلی ثانیه</span>`;
    ispEl.innerHTML = `موقعیت مکانی: <span>${countryName}</span>`;
    ipEl.innerHTML = `آی پی: <span>${ipMatch ? ipMatch[1] : "N/A"}</span>`;
  } catch (err) {
    statusEl.textContent = "وضعیت: ❌ مشکلی پیش اومده";
    console.error(err);
  }
}

window.addEventListener("load", checkConnection);
