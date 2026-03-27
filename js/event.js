const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');

const popup = document.getElementById('tnc-modal');
const box = document.getElementById('popup-box');

let startY = 0;
window.matchDataMap = {}; // Global variable
let globalFooterLogo = ''; // For dynamic logo

// ==========================================
// 🚀 FULL NAME TRANSLATOR
// ==========================================
const teamFullName = {
    "CSK": "Chennai Super Kings", "MI": "Mumbai Indians",
    "RCB": "Royal Challengers Bengaluru", "KKR": "Kolkata Knight Riders",
    "SRH": "Sunrisers Hyderabad", "DC": "Delhi Capitals",
    "PBKS": "Punjab Kings", "RR": "Rajasthan Royals",
    "LSG": "Lucknow Super Giants", "GT": "Gujarat Titans"
};

function getFullName(shortName) {
    if (!shortName) return "";
    let cleanName = shortName.trim().toUpperCase();
    return teamFullName[cleanName] || shortName.trim(); 
}

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

    // 🚀 TRANSLATE TITLE & OVERWRITE LOCALSTORAGE FOR NEXT PAGES
    let rawTitle = match.title || "Match";
    let tArr = rawTitle.split(/\s+vs\s+|\s+v\s+|\s*-\s*/i);
    let fullT1 = tArr[0] ? getFullName(tArr[0]) : "Team A";
    let fullT2 = tArr[1] ? getFullName(tArr[1]) : "Team B";
    
    // Translated Title
    match.title = `${fullT1} vs ${fullT2}`;
    localStorage.setItem('selectedMatch', JSON.stringify(match)); // 🔥 Saved for all future pages!

    // 🔥 DYNAMIC HEADER UPDATE 🔥
    const headerTitle = document.getElementById('header-match-title');
    if (headerTitle && match.title) {
        headerTitle.innerText = match.title;
    }

    // 🔥 FETCH GLOBAL LOGO BEFORE RENDER 🔥
    import('./firebase.js').then((firebaseModule) => {
        const { db, ref, onValue } = firebaseModule;
        
        onValue(ref(db, 'settings/payment'), (snap) => {
            if (snap.exists()) {
                const settings = snap.val();
                globalFooterLogo = settings.globalFooterLogo || '';
                
                // Update logo if it's already rendered
                const footerLogoImg = document.getElementById('dynamic-footer-logo');
                if (footerLogoImg && globalFooterLogo.trim() !== "") {
                    footerLogoImg.src = globalFooterLogo;
                    footerLogoImg.style.display = 'block';
                }
            }
        });
    }).catch(err => console.warn("Firebase config load error for footer logo", err));

    // 🔥 MAIN UI RENDER
    container.innerHTML = `
    <div style="padding: 12px 16px; background: white; font-family: 'Inter', sans-serif; padding-bottom: 0px; overflow-x: hidden;">
        
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
                Book tickets for <b>${match.title}</b> IPL 2026 on ${match.date || 'match day'} at ${match.venue || 'the stadium'} only on BookMyShow.
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

        <div style="margin-top: 10px; padding-bottom: 30px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 4px;">You May Also Like</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 16px;">Events around you, book now</p>
            
            <div id="dynamic-matches-container" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;">
                <div style="font-size: 13px; color: #999; padding: 10px 0;">Loading more matches...</div>
            </div>
        </div>

    </div>

    <div style="font-family: 'Inter', sans-serif; width: 100%; margin: 0 -16px; padding-bottom: 90px;">
        
        <div style="background-color: #f2f2f2; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; color: #888888; font-size: 13px; font-weight: 500;">
            <span>Know more about BookMyShow</span>
            <span style="font-size: 20px; line-height: 1;">+</span>
        </div>

        <div style="background-color: #333333; padding: 40px 20px; text-align: center;">
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 35px;">
                <div style="flex: 1; height: 1px; background-color: #555555; max-width: 100px;"></div>
                <img id="dynamic-footer-logo" src="${globalFooterLogo}" style="height: 100px; display: ${globalFooterLogo ? 'block' : 'none'}; object-fit: contain; border-radius: 2px;">
                <div style="flex: 1; height: 1px; background-color: #555555; max-width: 100px;"></div>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 30px;">
                <a href="#" style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #555555; color: #aaaaaa; border-radius: 50%; text-decoration: none; font-size: 18px; transition: opacity 0.2s;"><i class="fab fa-facebook-f"></i></a>
                <a href="#" style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #555555; color: #aaaaaa; border-radius: 50%; text-decoration: none; font-size: 18px; transition: opacity 0.2s;"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="#" style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #555555; color: #aaaaaa; border-radius: 50%; text-decoration: none; font-size: 18px; transition: opacity 0.2s;"><i class="fab fa-instagram"></i></a>
                <a href="#" style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #555555; color: #aaaaaa; border-radius: 50%; text-decoration: none; font-size: 18px; transition: opacity 0.2s;"><i class="fab fa-youtube"></i></a>
                <a href="#" style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #555555; color: #aaaaaa; border-radius: 50%; text-decoration: none; font-size: 18px; transition: opacity 0.2s;"><i class="fab fa-pinterest-p"></i></a>
                <a href="#" style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #555555; color: #aaaaaa; border-radius: 50%; text-decoration: none; font-size: 18px; transition: opacity 0.2s;"><i class="fab fa-linkedin-in"></i></a>
            </div>
            
            <p style="color: #888888; font-size: 11px; line-height: 1.6; margin: 0 auto 15px auto; max-width: 95%;">
                Copyright 2026 ©Bigtree Entertainment Pvt. Ltd. All Rights Reserved.
            </p>
            
            <p style="color: #888888; font-size: 11px; line-height: 1.6; margin: 0 auto; max-width: 95%;">
                The content and images used on this site are copyright protected and copyrights vests with the respective owners. The usage of the content and images on this website is intended to promote the works and no endorsement of the artist shall be implied. Unauthorized use is prohibited and punishable by law.
            </p>
            
        </div>
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

                        // 🚀 TRANSLATE DYNAMIC MATCHES TOO
                        let dRawTitle = m.title || "Match";
                        let dArr = dRawTitle.split(/\s+vs\s+|\s+v\s+|\s*-\s*/i);
                        let dT1 = dArr[0] ? getFullName(dArr[0]) : "Team A";
                        let dT2 = dArr[1] ? getFullName(dArr[1]) : "Team B";
                        const dynTranslatedTitle = `${dT1} vs ${dT2}`;

                        const matchId = m.id || key;
                        const banner = m.banner || "https://via.placeholder.com/400x600";
                        const date = m.date || "TBA";
                        const price = m.price || 0;

                        // Save it with translated title in map
                        m.title = dynTranslatedTitle;
                        window.matchDataMap[matchId] = m;

                        const cardHtml = `
                        <div style="min-width: 130px; width: 130px; cursor: pointer;" onclick="selectRecommendedMatch('${matchId}')">
                            <img src="${banner}" style="width: 100%; border-radius: 8px; object-fit: cover; height: 195px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                            <div style="font-size: 13px; font-weight: 600; color: #333; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${dynTranslatedTitle}</div>
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
           
