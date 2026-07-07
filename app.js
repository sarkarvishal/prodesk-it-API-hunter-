const API_URL = 'https://api.github.com/users/';

const elements = {
  searchInput: document.getElementById('search-input'),
  searchInput2: document.getElementById('search-input-2'),
  searchBtn: document.getElementById('search-btn'),
  toggleBattleBtn: document.getElementById('toggle-battle-btn'),
  loading: document.getElementById('loading'),
  errorMessage: document.getElementById('error-message'),
  profileContainer: document.getElementById('profile-container'),
  battleContainer: document.getElementById('battle-container'),
  userAvatar: document.getElementById('user-avatar'),
  userName: document.getElementById('user-name'),
  userLogin: document.getElementById('user-login'),
  userJoined: document.getElementById('user-joined'),
  userPortfolio: document.getElementById('user-portfolio'),
  userBio: document.getElementById('user-bio'),
  userFollowers: document.getElementById('user-followers'),
  userFollowing: document.getElementById('user-following'),
  userRepos: document.getElementById('user-repos'),
  reposGrid: document.getElementById('repos-grid')
};

let isBattleMode = false;

function formatDate(isoString) {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function setLoading(isLoading) {
  elements.loading.classList.toggle('hidden', !isLoading);
  elements.searchBtn.disabled = isLoading;
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.remove('hidden');
  elements.profileContainer.classList.add('hidden');
  elements.battleContainer.classList.add('hidden');
}

function clearError() {
  elements.errorMessage.classList.add('hidden');
  elements.errorMessage.textContent = '';
}

async function fetchUserWithRepos(username, perPage) {
  const userResponse = await fetch(`${API_URL}${username}`);
  if (!userResponse.ok) {
    throw new Error(userResponse.status === 404 ? 'User not found' : 'GitHub API error');
  }
  const user = await userResponse.json();

  const reposResponse = await fetch(`${user.repos_url}?sort=updated&per_page=${perPage}`);
  if (!reposResponse.ok) {
    throw new Error('Could not load repositories');
  }
  const repos = await reposResponse.json();

  return { user, repos };
}

function renderProfile(user, repos) {
  elements.userAvatar.src = user.avatar_url;
  elements.userAvatar.alt = `${user.login}'s avatar`;
  elements.userName.textContent = user.name || user.login;
  elements.userLogin.textContent = `@${user.login}`;
  elements.userLogin.href = user.html_url;
  elements.userJoined.textContent = `Joined ${formatDate(user.created_at)}`;
  elements.userBio.textContent = user.bio || '';
  elements.userFollowers.textContent = user.followers;
  elements.userFollowing.textContent = user.following;
  elements.userRepos.textContent = user.public_repos;

  if (user.blog) {
    const portfolioUrl = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
    elements.userPortfolio.href = portfolioUrl;
    elements.userPortfolio.textContent = portfolioUrl;
    elements.userPortfolio.classList.remove('hidden');
  } else {
    elements.userPortfolio.classList.add('hidden');
  }

  if (!repos.length) {
    elements.reposGrid.innerHTML = '<p class="empty-state">No public repositories yet.</p>';
  } else {
    elements.reposGrid.innerHTML = repos.map(repo => `
      <div class="repo-card glass-panel">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name">${repo.name}</a>
        <div class="repo-desc">${repo.description || 'No description provided.'}</div>
        <div class="repo-meta">
          ${repo.language ? `<div class="repo-lang"><span class="lang-dot"></span>${repo.language}</div>` : '<div></div>'}
        </div>
      </div>
    `).join('');
  }

  elements.battleContainer.classList.add('hidden');
  elements.profileContainer.classList.remove('hidden');
}

function totalStars(repos) {
  return repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
}

function renderBattleCard(user, stars, outcome) {
  const badgeLabel = outcome === 'winner' ? 'Winner' : outcome === 'loser' ? 'Loser' : '';
  const badgeHtml = badgeLabel ? `<span class="badge ${outcome}">${badgeLabel}</span>` : '';
  return `
    <div class="battle-card ${outcome}">
      ${badgeHtml}
      <img src="${user.avatar_url}" alt="${user.login}'s avatar" class="avatar">
      <h3>${user.name || user.login}</h3>
      <p class="join-date">@${user.login}</p>
      <div class="star-total">★ ${stars.toLocaleString()}</div>
      <p class="join-date">Total stars across repositories</p>
    </div>
  `;
}

function renderBattle(dataA, dataB) {
  const starsA = totalStars(dataA.repos);
  const starsB = totalStars(dataB.repos);

  let outcomeA = 'tie';
  let outcomeB = 'tie';
  if (starsA > starsB) {
    outcomeA = 'winner';
    outcomeB = 'loser';
  } else if (starsB > starsA) {
    outcomeB = 'winner';
    outcomeA = 'loser';
  }

  elements.battleContainer.innerHTML =
    renderBattleCard(dataA.user, starsA, outcomeA) +
    renderBattleCard(dataB.user, starsB, outcomeB);

  elements.profileContainer.classList.add('hidden');
  elements.battleContainer.classList.remove('hidden');
}

async function handleSingleSearch(username) {
  const { user, repos } = await fetchUserWithRepos(username, 5);
  renderProfile(user, repos);
}

async function handleBattleSearch(usernameA, usernameB) {
  const [dataA, dataB] = await Promise.all([
    fetchUserWithRepos(usernameA, 100),
    fetchUserWithRepos(usernameB, 100)
  ]);
  renderBattle(dataA, dataB);
}

async function handleSearch() {
  const username = elements.searchInput.value.trim();
  const username2 = elements.searchInput2.value.trim();

  if (!username || (isBattleMode && !username2)) {
    showError(isBattleMode ? 'Enter both usernames to start a battle.' : 'Enter a GitHub username to search.');
    return;
  }

  clearError();
  setLoading(true);

  try {
    if (isBattleMode) {
      await handleBattleSearch(username, username2);
    } else {
      await handleSingleSearch(username);
    }
  } catch (error) {
    showError(error.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

function toggleBattleMode() {
  isBattleMode = !isBattleMode;
  elements.searchInput2.classList.toggle('hidden', !isBattleMode);
  elements.toggleBattleBtn.textContent = isBattleMode
    ? 'Exit Battle Mode ✖️'
    : 'Enter Battle Mode ⚔️';

  clearError();
  elements.profileContainer.classList.add('hidden');
  elements.battleContainer.classList.add('hidden');
}

elements.searchBtn.addEventListener('click', handleSearch);
elements.toggleBattleBtn.addEventListener('click', toggleBattleMode);
elements.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});
elements.searchInput2.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

elements.searchInput.focus();
