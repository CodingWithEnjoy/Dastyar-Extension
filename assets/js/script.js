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

  let currentJYear = jalaali.toJalaali(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  ).jy;
  let currentJMonth =
    jalaali.toJalaali(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ).jm - 1;

  function generateJalaliCalendar(jy, jm) {
    calendarBody.innerHTML = "";

    const daysInMonth = jalaali.jalaaliMonthLength(jy, jm + 1);

    calendarTitle.textContent = `${persianMonths[jm]} ${jy}`;

    const firstDayGregorian = jalaali.toGregorian(jy, jm + 1, 1);
    let firstDayWeek = new Date(
      firstDayGregorian.gy,
      firstDayGregorian.gm - 1,
      firstDayGregorian.gd
    ).getDay();

    firstDayWeek = (firstDayWeek + 1) % 7;

    let date = 1;

    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");

        if (i === 0 && j < firstDayWeek) {
          cell.textContent = "";
          cell.classList.add("empty-cell");
        } else if (date > daysInMonth) {
          cell.textContent = "";
          cell.classList.add("empty-cell");
        } else {
          cell.textContent = date;

          const today = jalaali.toJalaali(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            new Date().getDate()
          );
          if (date === today.jd && jm + 1 === today.jm && jy === today.jy) {
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
    currentJMonth--;
    if (currentJMonth < 0) {
      currentJMonth = 11;
      currentJYear--;
    }
    generateJalaliCalendar(currentJYear, currentJMonth);
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentJMonth++;
    if (currentJMonth > 11) {
      currentJMonth = 0;
      currentJYear++;
    }
    generateJalaliCalendar(currentJYear, currentJMonth);
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
        }
      });
    });
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
  generateJalaliCalendar(currentJYear, currentJMonth);

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
      const tileWrapper = document.createElement("div");
      tileWrapper.className = "tile-wrapper";
      tileContainer.innerHTML = "";
      tileContainer.appendChild(tileWrapper);

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

      const allowedKeys = [
        "usd_btc",
        "usd_eth",
        "18ayar",
        "sekkeh",
        "usd",
        "eur",
        "gbp",
      ];

      const tiles = data
        .filter((item) => allowedKeys.includes(item.key))
        .map((item) => {
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

          return tile;
        });

      // Append tiles twice for seamless loop
      tiles.forEach((t) => tileWrapper.appendChild(t.cloneNode(true)));
      tiles.forEach((t) => tileWrapper.appendChild(t.cloneNode(true)));

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

          tileWrapper.appendChild(tile);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  fetchData();

  const searchDropdown = document.getElementById("searchDropdown");
  const dropdownOverlay = document.getElementById("dropdownOverlay");
  const trendsList = document.getElementById("trendsList");

  async function fetchTrends() {
    try {
      const res = await fetch(
        "https://api.widgetify.ir/extension/searchbox?region=IR&limit=10"
      );
      const data = await res.json();
      trendsList.innerHTML = "";

      data.trends.forEach((trend) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#e8eaed" style="margin-right:8px; vertical-align:middle;">
            <path d="M378.09-314.5q-111.16 0-188.33-77.17-77.17-77.18-77.17-188.33t77.17-188.33q77.17-77.17 188.33-77.17 111.15 0 188.32 77.17 77.18 77.18 77.18 188.33 0 44.48-13.52 83.12-13.53 38.64-36.57 68.16l222.09 222.33q12.67 12.91 12.67 31.94 0 19.04-12.91 31.71-12.68 12.67-31.83 12.67t-31.82-12.67L529.85-364.59q-29.76 23.05-68.64 36.57-38.88 13.52-83.12 13.52Zm0-91q72.84 0 123.67-50.83 50.83-50.82 50.83-123.67t-50.83-123.67q-50.83-50.83-123.67-50.83-72.85 0-123.68 50.83-50.82 50.82-50.82 123.67t50.82 123.67q50.83 50.83 123.68 50.83Z"/>
          </svg>
          
          <div>${trend.title}</div>
        `;

        li.addEventListener("click", () => {
          const query = encodeURIComponent(trend.title);
          window.open(`https://www.google.com/search?q=${query}`, "_blank");
          hideDropdown();
        });

        trendsList.appendChild(li);
      });
    } catch (err) {
      console.error("Error fetching trends:", err);
    }
  }

  function showDropdown() {
    fetchTrends();
    searchDropdown.classList.add("show");
    dropdownOverlay.classList.add("show");
  }

  function hideDropdown() {
    searchDropdown.classList.remove("show");
    dropdownOverlay.classList.remove("show");
  }

  searchInput.addEventListener("focus", showDropdown);

  dropdownOverlay.addEventListener("click", hideDropdown);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideDropdown();
  });
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

async function fetchStreams() {
  try {
    const res = await fetch(
      "https://corsproxy.io/?url=https://streamfa.com/api/streams/live"
    );
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected API data", data);
      return;
    }

    data.sort((a, b) => (b.total_viewers || 0) - (a.total_viewers || 0));

    const streams = data.slice(0, 10);

    const slider = document.getElementById("slider");
    slider.innerHTML = "";

    streams.forEach((streamer) => {
      const firstPlatform = streamer.platforms?.[0];
      if (!firstPlatform) return;

      const slide = document.createElement("div");
      slide.className = "slide";

      slide.innerHTML = `
        <img src="${
          firstPlatform.thumbnail_url
        }" class="thumbnail" alt="thumbnail">
        <div>
          <div class="streamer-name">${streamer.display_name}</div>
          <div>👀 ${streamer.total_viewers || 0}</div>
          <a href="${firstPlatform.stream_url}" target="_blank">تماشا در ${
        firstPlatform.platform
      }</a>
        </div>
      `;
      slider.appendChild(slide);
    });

    let isDown = false;
    let startX;
    let scrollLeft;
    let hasDragged = false;

    slider.addEventListener("pointerdown", (e) => {
      isDown = true;
      hasDragged = false;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      slider.setPointerCapture(e.pointerId);
    });

    slider.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 5) {
        hasDragged = true;
        slider.scrollLeft = scrollLeft - walk;
      }
    });

    slider.addEventListener("pointerup", (e) => {
      isDown = false;
      slider.releasePointerCapture(e.pointerId);
    });

    slider.addEventListener("pointerleave", () => {
      isDown = false;
    });

    slider.addEventListener("click", (e) => {
      if (hasDragged) e.stopImmediatePropagation();
    });
  } catch (err) {
    console.error("Error fetching streams:", err);
  }
}

document.addEventListener("DOMContentLoaded", fetchStreams);

const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const settingsOverlay = document.getElementById("settingsOverlay");
const settingsModal = document.getElementById("settingsModal");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

const box1 = document.getElementById("task");
const box2 = document.getElementById("speedtest");
const box3 = document.getElementById("slider");
const box4 = document.getElementById("google-services");
const box5 = document.getElementById("tileContainer");
const toggleBox1 = document.getElementById("toggleBox1");
const toggleBox2 = document.getElementById("toggleBox2");
const toggleBox3 = document.getElementById("toggleBox3");
const toggleBox4 = document.getElementById("toggleBox4");
const toggleBox5 = document.getElementById("toggleBox5");

function saveSetting(key, value) {
  localStorage.setItem(key, value);
}

function loadBooleanSetting(key, defaultValue) {
  const value = localStorage.getItem(key);
  if (value === null) return defaultValue;
  return value === "true";
}

function loadSetting(key, defaultValue) {
  const value = localStorage.getItem(key);
  return value !== null ? value : defaultValue;
}

function applySettings() {
  const showBox1 = loadBooleanSetting("showBox1", true);
  const showBox2 = loadBooleanSetting("showBox2", true);
  const showBox3 = loadBooleanSetting("showBox3", true);
  const showBox4 = loadBooleanSetting("showBox4", true);
  const showBox5 = loadBooleanSetting("showBox5", true);
  const themeColor = loadSetting("themeColor", "rgba(11, 13, 24, 0.85)");

  toggleBox1.checked = showBox1;
  toggleBox2.checked = showBox2;
  toggleBox3.checked = showBox3;
  toggleBox4.checked = showBox4;
  toggleBox5.checked = showBox5;

  box1.style.display = showBox1 ? "flex" : "none";
  box2.style.display = showBox2 ? "flex" : "none";
  box3.style.display = showBox3 ? "flex" : "none";
  box4.style.display = showBox4 ? "flex" : "none";
  box5.style.display = showBox5 ? "flex" : "none";

  document.documentElement.style.setProperty("--theme-color", themeColor);

  document.querySelectorAll(".color-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.color === themeColor);
  });
}

applySettings();

toggleBox1.addEventListener("change", () => {
  const state = toggleBox1.checked;
  box1.style.display = state ? "flex" : "none";
  saveSetting("showBox1", state);
});

toggleBox2.addEventListener("change", () => {
  const state = toggleBox2.checked;
  box2.style.display = state ? "flex" : "none";
  saveSetting("showBox2", state);
});

toggleBox3.addEventListener("change", () => {
  const state = toggleBox3.checked;
  box3.style.display = state ? "flex" : "none";
  saveSetting("showBox3", state);
});

toggleBox4.addEventListener("change", () => {
  const state = toggleBox4.checked;
  box4.style.display = state ? "flex" : "none";
  saveSetting("showBox4", state);
});

toggleBox5.addEventListener("change", () => {
  const state = toggleBox5.checked;
  box5.style.display = state ? "flex" : "none";
  saveSetting("showBox5", state);
});

const colorOptions = document.querySelectorAll(".color-option");
colorOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    const color = opt.dataset.color;
    document.documentElement.style.setProperty("--theme-color", color);
    saveSetting("themeColor", color);

    colorOptions.forEach((o) => o.classList.remove("active"));
    opt.classList.add("active");
  });
});

openSettingsBtn.addEventListener("click", () => {
  settingsOverlay.classList.remove("closing");
  settingsOverlay.style.display = "flex";
  settingsOverlay.classList.add("active");
  settingsModal.classList.remove("closing");
});

function closeSettings() {
  settingsModal.classList.add("closing");
  settingsOverlay.classList.add("closing");
  settingsOverlay.classList.remove("active");

  settingsOverlay.addEventListener(
    "animationend",
    () => {
      if (settingsOverlay.classList.contains("closing")) {
        settingsOverlay.style.display = "none";
        settingsOverlay.classList.remove("closing");
        settingsModal.classList.remove("closing");
      }
    },
    { once: true }
  );
}
closeSettingsBtn.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) closeSettings();
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabPanes.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

const userInfoDiv = document.getElementById("userInfo");
const loginBtn = document.getElementById("loginBtn");
const userPopup = document.getElementById("userPopup");
const greeting = document.getElementById("greeting");

async function fetchAndDisplayUser(token) {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();

    userInfoDiv.innerHTML = `
            <img src="${user.picture}" alt="Avatar">
        `;

    userInfoDiv.addEventListener("click", (e) => {
      greeting.textContent = `${user.name} خوش اومدی 🤙`;
      userPopup.classList.toggle("show");
    });
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    userInfoDiv.innerText = "Failed to fetch user info.";
  }
}

function loginWithGoogle() {
  if (!chrome.identity) {
    console.error("chrome.identity is undefined. Must run inside extension.");
    userInfoDiv.innerText = "Extension context required.";
    return;
  }

  chrome.identity.getAuthToken({ interactive: false }, async (token) => {
    if (chrome.runtime.lastError || !token) {
      console.warn("Silent login failed:", chrome.runtime.lastError);
      loginBtn.style.display = "block";
      loginBtn.addEventListener("click", () => {
        chrome.identity.getAuthToken(
          { interactive: true },
          async (tokenInteractive) => {
            if (chrome.runtime.lastError || !tokenInteractive) {
              console.error(
                "Interactive login failed:",
                chrome.runtime.lastError
              );
              userInfoDiv.innerText = "Login failed.";
              return;
            }
            loginBtn.style.display = "none";
            await fetchAndDisplayUser(tokenInteractive);
          }
        );
      });
      return;
    }

    await fetchAndDisplayUser(token);
  });
}

document.addEventListener("DOMContentLoaded", loginWithGoogle);

document.addEventListener("click", (e) => {
  if (!userInfoDiv.contains(e.target) && !userPopup.contains(e.target)) {
    userPopup.classList.remove("show");
  }
});
