// Carrega o pacote do Google Charts
google.charts.load('current', { packages: ['corechart'] });

const API_URL = "https://jsonplaceholder.typicode.com/users";

let usersGlobal = [];

fetch(API_URL)
  .then(res => res.json())
  .then(users => {
    usersGlobal = users;

    document.getElementById("user-count").textContent = users.length;

    google.charts.setOnLoadCallback(() => {
      renderCityChart(users);
      renderEmailDomainChart(users);
    });

    renderUserNameList(users);
    setupLetterSelect(users);
  })
  .catch(err => {
    console.error("Erro ao carregar usuários:", err);
  });

function renderCityChart(users) {
  const cityCounts = {};
  users.forEach(user => {
    const city = user.address.city;
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const chartData = [['Cidade', 'Usuários']];
  for (const city in cityCounts) {
    chartData.push([city, cityCounts[city]]);
  }

  const data = google.visualization.arrayToDataTable(chartData);
  const options = {
    title: 'Usuários por Cidade',
    pieHole: 0.4,
    chartArea: { width: '90%', height: '90%' },
    legend: { position: 'right', alignment: 'center' },
  };

  const chart = new google.visualization.PieChart(document.getElementById('city-chart'));
  chart.draw(data, options);

  adjustCardToContent('city-card', 'city-chart');
}

function renderEmailDomainChart(users) {
  const domainCounts = {};
  users.forEach(user => {
    const parts = user.email.split(".");
    const suffix = parts[parts.length - 1].toLowerCase();
    domainCounts[suffix] = (domainCounts[suffix] || 0) + 1;
  });

  const chartData = [['Domínio', 'Quantidade']];
  for (const domain in domainCounts) {
    chartData.push([domain, domainCounts[domain]]);
  }

  const data = google.visualization.arrayToDataTable(chartData);
  const options = {
    title: 'Domínios Finais de E-mail',
    pieHole: 0.3,
    chartArea: { width: '90%', height: '90%' },
    legend: { position: 'right', alignment: 'center' },
  };

  const chart = new google.visualization.PieChart(document.getElementById('email-domain-chart'));
  chart.draw(data, options);

  adjustCardToContent('email-domain-card', 'email-domain-chart');
}

/**
 * Ajusta o tamanho do card para caber o conteúdo do gráfico.
 * @param {string} cardId Id do card container
 * @param {string} chartId Id do div do gráfico
 */
function adjustCardToContent(cardId, chartId) {
  setTimeout(() => {
    const card = document.getElementById(cardId);
    const chartDiv = document.getElementById(chartId);
    if (!card || !chartDiv) return;

    const svg = chartDiv.querySelector('svg');
    if (!svg) return;

    const svgHeight = svg.getBoundingClientRect().height;
    const cardBody = card.querySelector('.card-body');
    const title = card.querySelector('.card-title');

    // Paddings e margens para o cálculo aproximado
    const paddingVertical = parseFloat(getComputedStyle(cardBody).paddingTop) + parseFloat(getComputedStyle(cardBody).paddingBottom);
    const titleHeight = title.getBoundingClientRect().height;
    const marginBelowTitle = 16; // margem padrão do bootstrap

    // Altura total do card para acomodar título + margem + svg + padding interno
    const totalHeight = titleHeight + marginBelowTitle + svgHeight + paddingVertical;

    card.style.height = totalHeight + "px";
  }, 100);
}

function renderUserNameList(users) {
  const nameList = document.getElementById("user-name-list");
  nameList.innerHTML = "";

  const sortedUsers = users.sort((a, b) =>
    a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' })
  );

  sortedUsers.forEach(user => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = user.name;
    nameList.appendChild(item);
  });

  adjustListCardHeight('user-name-list');
}

/**
 * Ajusta a altura do card que contém a lista para se ajustar dinamicamente.
 * @param {string} ulId Id da UL (lista)
 */
function adjustListCardHeight(ulId) {
  setTimeout(() => {
    const ul = document.getElementById(ulId);
    if (!ul) return;

    const card = ul.closest('.card');
    if (!card) return;

    const cardBody = card.querySelector('.card-body');
    const title = card.querySelector('.card-title');

    // Altura da lista (conteúdo)
    const listHeight = ul.scrollHeight;

    // Paddings e margens para cálculo
    const paddingVertical = parseFloat(getComputedStyle(cardBody).paddingTop) + parseFloat(getComputedStyle(cardBody).paddingBottom);
    const titleHeight = title.getBoundingClientRect().height;
    const marginBelowTitle = 16; // margem padrão bootstrap

    // Total = título + margem + lista + padding
    const totalHeight = titleHeight + marginBelowTitle + listHeight + paddingVertical;

    card.style.height = totalHeight + "px";

    // Ajusta overflow da lista para scroll se necessário
    const maxListHeight = 400;
    if (listHeight > maxListHeight) {
      ul.style.maxHeight = maxListHeight + "px";
      ul.style.overflowY = "auto";
    } else {
      ul.style.maxHeight = "none";
      ul.style.overflowY = "visible";
    }
  }, 100);
}

/**
 * Configura o select de letras e atualiza a contagem dinâmica.
 * @param {Array} users Array de usuários
 */
function setupLetterSelect(users) {
  const letterSelect = document.getElementById("letter-select");

  // Pega todas as primeiras letras distintas, ordenadas
  const lettersSet = new Set();
  users.forEach(user => {
    if(user.name && user.name.length > 0) {
      lettersSet.add(user.name[0].toUpperCase());
    }
  });

  const letters = Array.from(lettersSet).sort();

  // Cria option para cada letra
  letters.forEach(letter => {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter;
    letterSelect.appendChild(option);
  });

  // Atualiza contagem ao mudar letra
  letterSelect.addEventListener('change', () => {
    updateFilteredCount(users, letterSelect.value);
  });

  // Inicializa com a primeira letra selecionada
  if (letters.length > 0) {
    letterSelect.value = letters[0];
    updateFilteredCount(users, letters[0]);
  }
}

/**
 * Atualiza o card com a contagem de usuários cujo nome começa com a letra dada.
 * @param {Array} users Array de usuários
 * @param {string} letter Letra selecionada
 */
function updateFilteredCount(users, letter) {
  const count = users.filter(user => user.name.toUpperCase().startsWith(letter)).length;
  document.getElementById("filtered-user-count").textContent = count;
}
