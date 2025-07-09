(async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';
  const headers = { 'Authorization': `Bearer ${token}` };

  const res = await fetch('http://localhost:3000/api/user/pet', { headers });
  if (res.status !== 200) {
    localStorage.removeItem('token');
    return window.location.href = 'login.html';
  }
  const pet = await res.json();
  document.getElementById('hunger-stat').textContent = pet.hunger;
  document.getElementById('happiness-stat').textContent = pet.happiness;
  document.getElementById('energy-stat').textContent = pet.energy;

  document.getElementById('feed-button').addEventListener('click', async () => {
    await fetch('http://localhost:3000/api/user/pet', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feed' })
    });
    location.reload();
  });

  document.getElementById('play-button').addEventListener('click', async () => {
    await fetch('http://localhost:3000/api/user/pet', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'play' })
    });
    location.reload();
  });

  document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
})();