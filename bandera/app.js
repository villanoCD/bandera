const body = document.body;
const sky = document.getElementById('sky');
const sun = document.getElementById('sun');
const moon = document.getElementById('moon');
const stars = document.getElementById('stars');
const clockDisplay = document.getElementById('clock');
const dayButton = document.getElementById('dayButton');
const nightButton = document.getElementById('nightButton');
const flag = document.getElementById('flag');

let isDay = true;

function updateClock() {
    const now = new Date();
    const options = {
        timeZone: 'America/Santo_Domingo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const timeString = now.toLocaleTimeString('es-DO', options);
    clockDisplay.textContent = timeString;
}

function setDay() {
    if (!isDay) {
        body.style.backgroundColor = '#87CEEB';
        sky.classList.remove('night');
        sun.style.transform = 'translateY(0) scale(1)';
        moon.style.transform = 'translateY(-100vh) scale(0)';
        stars.classList.remove('show');
        isDay = true;
        // Animation for raising the flag
        flag.style.animation = 'none';
        setTimeout(() => {
            flag.style.bottom = '40vh';
            flag.style.animation = 'wind 5s ease-in-out infinite';
        }, 10);
    }
}

function setNight() {
    if (isDay) {
        body.style.backgroundColor = '#0d1a29';
        sky.classList.add('night');
        sun.style.transform = 'translateY(-100vh) scale(0)';
        moon.style.transform = 'translateY(0) scale(1)';
        stars.classList.add('show');
        isDay = false;
        // Animation for lowering the flag
        flag.style.animation = 'none';
        setTimeout(() => {
            flag.style.bottom = '20vh';
            flag.style.animation = 'wind 5s ease-in-out infinite';
        }, 10);
    }
}

dayButton.addEventListener('click', setDay);
nightButton.addEventListener('click', setNight);

setInterval(updateClock, 1000);
updateClock();
setDay(); // Set initial state to day