/**
 * dashboard.js – clock, pet stats, actions, and logout
 */

const PET_API = '/api/user/pet';

function updateEverwynTime() {
  const el = document.getElementById('everwyn-clock');
  if (!el) return;
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true
  });
  el.textContent = timeString;
}

async function loadPet() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';

  try {
    const res = await fetch(PET_API, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const pet = await res.json();
    document.getElementById('hunger-stat').textContent    = pet.hunger;
    document.getElementById('happiness-stat').textContent = pet.happiness;
    document.getElementById('energy-stat').textContent    = pet.energy;
  } catch {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
}

async function petAction(action) {
  const token = localStorage.getItem('token');
  try {
    await fetch(PET_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({ action })
    });
    loadPet();
  } catch (err) {
    console.error('Pet action error:', err);
  }
}

function initListeners() {
  document.getElementById('feed-button')?.addEventListener('click', () => petAction('feed'));
  document.getElementById('play-button')?.addEventListener('click', () => petAction('play'));
  document.getElementById('logout-button')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateEverwynTime();
  setInterval(updateEverwynTime, 60_000);
  loadPet();
  initListeners();
});
