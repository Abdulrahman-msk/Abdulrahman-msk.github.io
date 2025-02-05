document.addEventListener("DOMContentLoaded", function () {
    fetch('prayer_times.json')
        .then(response => response.json())
        .then(data => {
            // Get today's date in "Month Day, Year" format
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Find today's Maghrib Adhan time from JSON
            const todayData = data.find(entry => entry.Date === today);
            if (!todayData) {
                console.error("No prayer time data found for today.");
                return;
            }

            // Extract Maghrib Adhan and calculate Iqama (Adhan + 5 mins)
            let maghribAdhanTime = todayData["Maghrib Adhan"];
            let [hours, minutes, period] = maghribAdhanTime.match(/(\d+):(\d+) (\wM)/).slice(1);
            hours = parseInt(hours);
            minutes = parseInt(minutes) + 5; // Add 5 minutes for Iqama

            if (minutes >= 60) {
                minutes -= 60;
                hours += 1;
            }

            // Convert 12-hour to 24-hour format
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            // Format Maghrib Iqama time
            const maghribIqamaTime = new Date();
            maghribIqamaTime.setHours(hours, minutes, 0);

            // Update Maghrib time on website
            document.getElementById("maghrib-time").innerText = maghribAdhanTime + " + 5 min";

            // Get static prayer times (replace these with actual fetched times if needed)
            const iqamaTimes = {
                "Fajr": "6:30 AM",
                "Dhuhr": "12:45 PM",
                "Asr": "3:30 PM",
                "Maghrib": maghribIqamaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                "Isha": "7:00 PM"
            };

            // Convert iqama times to Date objects
            let now = new Date();
            let nextPrayer = null;
            let nextIqamaTime = null;

            Object.keys(iqamaTimes).forEach(prayer => {
                let [h, m, p] = iqamaTimes[prayer].match(/(\d+):(\d+) (\wM)/).slice(1);
                h = parseInt(h);
                m = parseInt(m);
                if (p === "PM" && h !== 12) h += 12;
                if (p === "AM" && h === 12) h = 0;

                let iqamaTime = new Date();
                iqamaTime.setHours(h, m, 0);

                if (iqamaTime > now && (!nextIqamaTime || iqamaTime < nextIqamaTime)) {
                    nextPrayer = prayer;
                    nextIqamaTime = iqamaTime;
                }
            });

            if (nextPrayer) {
                document.getElementById("next-iqama").innerText = `${nextPrayer} Iqama is in:`;
                updateCountdown(nextIqamaTime);
                setInterval(() => updateCountdown(nextIqamaTime), 1000);
            } else {
                document.getElementById("countdown").innerText = "No more prayers today.";
            }
        })
        .catch(error => console.error("Error loading prayer times:", error));
});

function updateCountdown(targetTime) {
    let now = new Date();
    let diff = Math.floor((targetTime - now) / 1000);

    if (diff <= 0) {
        document.getElementById("countdown").innerText = "Get up for Salat!";
        return;
    }

    let hours = Math.floor(diff / 3600);
    let minutes = Math.floor((diff % 3600) / 60);
    let seconds = diff % 60;

    document.getElementById("countdown").innerText = 
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

}
