document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskButton = document.getElementById("addTaskButton");
  const blurButton = document.getElementById("blurButton");
  const blurIcon = document.getElementById("blurIcon");
  const unblurIcon = document.getElementById("unblurIcon");
  const taskList = document.getElementById("taskList");
  const taskBody = document.getElementById("taskBody");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchResults = document.getElementById("searchResults");
  const weatherInfo = document.getElementById("weatherInfo");
  const dateTimeInfo = document.getElementById("dateTimeInfo");
  const calendarTitle = document.getElementById("calendarTitle");
  const calendarBody = document.getElementById("calendarBody");
  const bookmarksContainer = document.getElementById("bookmarks");
  const addBookmarkButton = document.getElementById("addBookmark");
  const bookmarkModal = document.getElementById("bookmarkModal");
  const closeModalButton = document.querySelector(".close");
  const saveBookmarkButton = document.getElementById("saveBookmark");
  const bookmarkUrl = document.getElementById("bookmarkUrl");
  const bookmarkName = document.getElementById("bookmarkName");
  const bookmarkEmoji = document.getElementById("bookmarkEmoji");

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
  };

  const temperatureDescriptions = {
    "0-5": "هوا نا جوانمردانه سرده 😶‍🌫️",
    "6-15": "هوا کمی سرده",
    "16-25": "هوا مطبوعه",
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

  const getTasksFromLocalStorage = () =>
    JSON.parse(localStorage.getItem("tasks")) || [];
  const saveTasksToLocalStorage = (tasks) =>
    localStorage.setItem("tasks", JSON.stringify(tasks));

  function loadTasks() {
    getTasksFromLocalStorage().forEach((task) =>
      addTaskToList(task.text, task.done)
    );
  }

  function saveTask(text, done = false) {
    const tasks = getTasksFromLocalStorage();
    tasks.push({ text, done });
    saveTasksToLocalStorage(tasks);
  }

  function updateTask(index, task) {
    const tasks = getTasksFromLocalStorage();
    tasks[index] = task;
    saveTasksToLocalStorage(tasks);
  }

  function deleteTask(index) {
    const tasks = getTasksFromLocalStorage();
    tasks.splice(index, 1);
    saveTasksToLocalStorage(tasks);
  }

  function loadBlurStatus() {
    const isBlurred = JSON.parse(localStorage.getItem("isBlurred")) || false;
    taskBody.classList.toggle("blur", isBlurred);
    blurIcon.style.display = isBlurred ? "none" : "inline";
    unblurIcon.style.display = isBlurred ? "inline" : "none";
  }

  function getTemperatureDescription(temp) {
    if (temp >= 0 && temp <= 5) return temperatureDescriptions["0-5"];
    if (temp >= 6 && temp <= 15) return temperatureDescriptions["6-15"];
    if (temp >= 16 && temp <= 25) return temperatureDescriptions["16-25"];
    if (temp >= 26 && temp <= 35) return temperatureDescriptions["26-35"];
    if (temp >= 36) return temperatureDescriptions["36-100"];
    return "دمای نامشخص";
  }

  async function fetchWeather() {
    try {
      const response = await fetch(weatherUrl);
      const data = await response.json();
      const description = data.weather[0].description;
      const emoji = weatherEmojis[description] || "🌈";
      const translation = weatherTranslations[description] || description;
      const temp = Math.round(data.main.temp);
      const tempDescription = getTemperatureDescription(temp);
      weatherInfo.innerHTML = `
        <h2>${temp}° ${emoji}</h2>
        <h3>${tempDescription}</h3>
        <p>${translation} . ${data.main.humidity}%</p>
      `;
    } catch (error) {
      console.error("Error fetching weather data:", error);
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

    let hours = now.getHours();
    const minutes = now.getMinutes();

    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeString = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    dateTimeInfo.querySelector(".date").textContent = `${dateString}`;
    dateTimeInfo.querySelector(".jdate").textContent = `${jalaliDateString}`;
    dateTimeInfo.querySelector(".time").textContent = `${timeString}`;
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
    tile.innerHTML = `<span>${emoji}</span><p>${name}</p>`;
    tile.addEventListener("click", () => window.open(url, "_blank"));
    bookmarksContainer.appendChild(tile);
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

  const alarmTimeInput = document.getElementById("alarmTime");
  const setAlarmButton = document.getElementById("setAlarmButton");
  const stopAlarmButton = document.getElementById("stopAlarmButton");
  const alarmSound = document.getElementById("alarmSound");
  const toastContainer = document.getElementById("toastContainer");

  let alarmTime = null;

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hide");

      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 500);
    }, 3000);
  }

  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    if (alarmTime && currentTime === alarmTime) {
      alarmSound.play();
      alarmTime = null;
    }
  }

  function setAlarm() {
    if (alarmTimeInput.value) {
      alarmTime = alarmTimeInput.value;
      showToast(`آلارم برای ${alarmTime} ست شد !`);
    }
  }

  function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmTime = null;
    showToast("آلارم قطع شد !");
  }

  setAlarmButton.addEventListener("click", setAlarm);
  stopAlarmButton.addEventListener("click", stopAlarm);

  setInterval(updateTime, 1000);
});