google.charts.load('current', { packages: ['corechart'] });

const API_URL = "https://jsonplaceholder.typicode.com/users";

let usersGlobal = [];
let cityChart, emailDomainChart, cityData, emailDomainData, cityOptions, emailDomainOptions;

fetch(API_URL)
  .then(res => res.json())
  .then(users => {
    usersGlobal = users;

    document.getElementById("user-count").textContent = users.length;

    google.charts.setOnLoadCallback(() => {
      prepareCharts(users);
      drawCharts();
      setupResizeListener();
    });

    renderUserNameList(users);
    setupLetterSelect(users);
  })
  .catch(err => {
    console.error("Erro ao carregar usuários:", err);
  });

function prepareCharts(users) {
  // Cidades
  const cityCounts = {};
  users.forEach(user => {
    const city = user.address.city;
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const cityChartDataArray = [['Cidade', 'Usuários']];
  for (const city in cityCounts) {
    cityChartDataArray.push([city, cityCounts[city]]);
  }
  cityData = google.visualization.arrayToDataTable(cityChartDataArray);

  cityOptions = {
    title: 'Usuários por Cidade',
    pieHole: 0.4,
    chartArea: { left: 30, top: 50, width: '65%', height: '75%' },
    legend: { position: 'right', alignment: 'center', textStyle: { fontSize: 14 } },
  };

  cityChart = new google.visualization.PieChart(document.getElementById('city-chart'));

  // Domínios
  const domainCounts = {};
  users.forEach(user => {
    const parts = user.email.split(".");
    const suffix = parts[parts.length - 1].toLowerCase();
    domainCounts[suffix] = (domainCounts[suffix] || 0) + 1;
  });

  const emailDomainDataArray = [['Domínio', 'Quantidade']];
  for (const domain in domainCounts) {
    emailDomainDataArray.push([domain, domainCounts[domain]]);
  }
  emailDomainData = google.visualization.arrayToDataTable(emailDomainDataArray);

  emailDomainOptions = {
    title: 'Domínios Finais de E-mail',
    pieHole: 0.3,
    chartArea: { left: 30, top: 50, width: '65%', height: '75%' },
    legend: { position: 'right', alignment: 'center', textStyle: { fontSize: 14 } },
  };

  emailDomainChart = new google.visualization.PieChart(document.getElementById('email-domain-chart'));
}

function drawCharts() {
  cityChart.draw(cityData, cityOptions);
  emailDomainChart.draw(emailDomainData, emailDomainOptions);
}

function setupResizeListener() {
  window.addEventListener('resize', () => {
    drawCharts();
  });
}

function renderUserNameList(users) {
  const nameList = document.getElementById("user-name-list");
  nameList.innerHTML = "";

  const sortedUsers = users.slice().sort((a, b) =>
    a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' })
  );

  sortedUsers.forEach(user => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = user.name;
    nameList.appendChild(item);
  });
}

function setupLetterSelect(users) {
  const letterSelect = document.getElementById("letter-select");

  const lettersSet = new Set();
  users.forEach(user => {
    if (user.name && user.name.length > 0) {
      lettersSet.add(user.name[0].toUpperCase());
    }
  });

  const letters = Array.from(lettersSet).sort();

  letters.forEach(letter => {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter;
    letterSelect.appendChild(option);
  });

  letterSelect.addEventListener('change', () => {
    updateFilteredCount(users, letterSelect.value);
  });

  if (letters.length > 0) {
    letterSelect.value = letters[0];
    updateFilteredCount(users, letters[0]);
  }
}

function updateFilteredCount(users, letter) {
  const count = users.filter(user => user.name.toUpperCase().startsWith(letter)).length;
  document.getElementById("filtered-user-count").textContent = count;
}
