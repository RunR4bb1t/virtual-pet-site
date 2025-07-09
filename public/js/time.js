function updateEverwynTime() {
  const el = document.getElementById('everwyn-clock');
  if (!el) return;
  const now = new Date();
  const options = {
    timeZone: 'America/Chicago',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true
  };
  el.textContent = now.toLocaleTimeString('en-US', options);
}

updateEverwynTime();
setInterval(updateEverwynTime, 60000);
