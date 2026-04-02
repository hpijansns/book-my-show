// ============================================================
// admin.js — Fixed Version
// Fixes: (1) Login button dead, (2) Firebase data not loading
// ============================================================

import { db, ref, onValue, set, push, remove, update } from './firebase.js';

// ── TOP-LEVEL IMPORT CHECK ──────────────────────────────────
// Agar yahan tak code pahuncha, matlab firebase.js import SUCCESS hai.
// Agar browser console mein "SyntaxError" ya "does not provide export" 
// dikhe, toh firebase.js ke exports check karo.
console.log("✅ admin.js: Firebase import successful. db =", db ? "OK" : "NULL ⚠️");

// ============================================================
// CONSTANTS
// ============================================================
const ADMIN_ID   = "9680211974";
const ADMIN_PASS = "Pooja2005";

// ============================================================
// HELPER: Preview image
// ============================================================
function showPreview(url, element) {
    if (!element) return;
    if (url && url.trim().startsWith('http')) {
        element.src = url;
        element.style.display = 'block';
        element.style.width = '100px';
        element.style.marginTop = '10px';
    } else {
        element.style.display = 'none';
    }
}

// ============================================================
// TEAM DATA
// ============================================================
const teamDictionary = {
    "chennai super kings": "CSK", "mumbai indians": "MI",
    "royal challengers bangalore": "RCB", "royal challengers bengaluru": "RCB",
    "kolkata knight riders": "KKR", "sunrisers hyderabad": "SRH",
    "delhi capitals": "DC", "punjab kings": "PBKS",
    "rajasthan royals": "RR", "lucknow super giants": "LSG",
    "gujarat titans": "GT",
    "csk": "CSK", "mi": "MI", "rcb": "RCB", "kkr": "KKR", "srh": "SRH",
    "dc": "DC", "pbks": "PBKS", "rr": "RR", "lsg": "LSG", "gt": "GT"
};

const teamLogos = {
    "CSK":  "https://iili.io/qUcs9ov.png",
    "MI":   "https://iili.io/qSFtonj.png",
    "RCB":  "https://iili.io/qUBWD9n.webp",
    "KKR":  "https://iili.io/qSFtCZb.png",
    "SRH":  "https://iili.io/qSBf9J1.png",
    "DC":   "https://iili.io/qSf8yG9.jpg",
    "PBKS": "https://iili.io/qUqmEOX.jpg",
    "RR":   "https://iili.io/qUqO2HP.jpg",
    "LSG":  "https://iili.io/qUBx5lI.png",
    "GT":   "https://iili.io/qUqWsqB.png"
};

function getShortName(nameStr) {
    if (!nameStr) return "";
    return teamDictionary[nameStr.trim().toLowerCase()] || "";
}

// ============================================================
// FIREBASE: Global approve / decline (window pe taaki inline
// onclick HTML attributes se access ho sake)
// ============================================================
window.approvePayment = function(bookingId, btnElement) {
    if (!confirm("APPROVE this payment? User will be redirected to success page.")) return;
    btnElement.innerHTML = "Approving...";
    btnElement.disabled = true;
    update(ref(db, `bookings/${bookingId}`), {
        status:     'approved',
        approvedAt: new Date().toISOString()
    }).catch(err => {
        alert("Error approving: " + err.message);
        btnElement.innerHTML = "✓ Approve";
        btnElement.disabled = false;
    });
};

window.declinePayment = function(bookingId, btnElement) {
    if (!confirm("DECLINE this payment? User will be asked to re-enter UTR.")) return;
    btnElement.innerHTML = "Declining...";
    btnElement.disabled = true;
    update(ref(db, `bookings/${bookingId}`), {
        status:     'declined',
        declinedAt: new Date().toISOString()
    }).catch(err => {
        alert("Error declining: " + err.message);
        btnElement.innerHTML = "✕ Decline";
        btnElement.disabled = false;
    });
};

// ============================================================
// FIX 2: Firebase listeners ek alag function mein — sirf
//         login ke BAAD call hoga.
// ============================================================
let firebaseListenersAttached = false; // Baar baar attach na ho

function loadFirebaseData() {
    if (firebaseListenersAttached) return; // Already attached hai toh skip
    firebaseListenersAttached = true;
    console.log("🔥 loadFirebaseData() called — attaching Firebase listeners...");

    // ── DOM refs (safe, andar se liye) ──────────────────────
    const tableBody       = document.getElementById('admin-match-list');
    const form            = document.getElementById('match-form');
    const editIdInput     = document.getElementById('edit-id');
    const mTitle          = document.getElementById('m-title');
    const mDate           = document.getElementById('m-date');
    const mTime           = document.getElementById('m-time');
    const mVenue          = document.getElementById('m-venue');
    const mPrice          = document.getElementById('m-price');
    const mTeam1          = document.getElementById('m-team1');
    const mTeam2          = document.getElementById('m-team2');
    const mBanner         = document.getElementById('m-banner');
    const mVenueImg       = document.getElementById('m-venue-img');
    const mFooterLogo     = document.getElementById('m-footer-logo');
    const upiInp          = document.getElementById('admin-upi-id');
    const urlInp          = document.getElementById('admin-qr-url');
    const saveBtn         = document.getElementById('save-btn');
    const cancelBtn       = document.getElementById('cancel-btn');
    const formTitle       = document.getElementById('form-title');
    const bannerPreview   = document.getElementById('banner-preview');
    const venuePreview    = document.getElementById('venue-preview');
    const bookingsCont    = document.getElementById('bookings-container');
    const pendingCountEl  = document.getElementById('pending-count');
    const approvedCountEl = document.getElementById('approved-count');
    const loadingIndicator= document.getElementById('loading-indicator');

    let isEditing        = false;
    let globalBannerUrl  = '';
    let globalVenueUrl   = '';
    let globalFooterLogoUrl = '';

    // ── Image preview listeners ──────────────────────────────
    if (mBanner)   mBanner.addEventListener('input',   () => showPreview(mBanner.value, bannerPreview));
    if (mVenueImg) mVenueImg.addEventListener('input', () => showPreview(mVenueImg.value, venuePreview));

    // ── Team logo auto-fill ──────────────────────────────────
    function checkAndFillTeamLogos() {
        if (!mTitle) return;
        const teams = mTitle.value.trim().split(/\s+vs\s+|\s+v\s+|\s*-\s*/i);
        if (teams.length === 2) {
            const t1 = getShortName(teams[0]);
            const t2 = getShortName(teams[1]);
            if (t1 && mTeam1 && teamLogos[t1]) mTeam1.value = teamLogos[t1];
            if (t2 && mTeam2 && teamLogos[t2]) mTeam2.value = teamLogos[t2];
        }
    }
    if (mTitle) {
        mTitle.addEventListener('input',  checkAndFillTeamLogos);
        mTitle.addEventListener('change', checkAndFillTeamLogos);
    }

    // ── cancelEdit helper ────────────────────────────────────
    function cancelEdit() {
        isEditing = false;
        if (editIdInput) editIdInput.value = '';
        [mTitle, mDate, mTime, mVenue, mPrice, mTeam1, mTeam2].forEach(el => { if (el) el.value = ''; });
        if (mBanner)     { mBanner.value    = globalBannerUrl;     showPreview(globalBannerUrl, bannerPreview); }
        if (mVenueImg)   { mVenueImg.value  = globalVenueUrl;      showPreview(globalVenueUrl, venuePreview); }
        if (mFooterLogo) mFooterLogo.value  = globalFooterLogoUrl;
        if (cancelBtn)   cancelBtn.style.display = 'none';
        if (formTitle)   formTitle.innerText     = 'Add New Match';
        if (saveBtn)     saveBtn.innerText        = 'Save Match & QR';
    }
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

    // ── window.editMatch / deleteMatch ───────────────────────
    window.editMatch = (id) => {
        const m = window.allMatches?.[id];
        if (!m) return;
        if (editIdInput) editIdInput.value = id;
        if (mTitle)     mTitle.value    = m.title    || '';
        if (mDate)      mDate.value     = m.date     || '';
        if (mTime)      mTime.value     = m.time     || '';
        if (mVenue)     mVenue.value    = m.venue    || '';
        if (mPrice)     mPrice.value    = m.price    || '';
        if (mTeam1)     mTeam1.value    = m.team1    || '';
        if (mTeam2)     mTeam2.value    = m.team2    || '';
        if (mBanner)    mBanner.value   = m.banner   || '';
        if (mVenueImg)  mVenueImg.value = m.venue_img|| '';
        if (mFooterLogo) mFooterLogo.value = globalFooterLogoUrl;
        showPreview(m.banner,    bannerPreview);
        showPreview(m.venue_img, venuePreview);
        isEditing = true;
        if (formTitle) formTitle.innerText = 'Edit Match Details';
        if (saveBtn)   saveBtn.innerText   = 'Update Match & QR';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteMatch = async (id) => {
        if (!confirm('Are you sure you want to delete this match?')) return;
        try {
            await remove(ref(db, 'matches/' + id));
        } catch (err) {
            alert('Delete Error: ' + err.message);
        }
    };

    // ── Form submit ──────────────────────────────────────────
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const matchData = {
                title:     mTitle?.value.trim()    || '',
                date:      mDate?.value            || '',
                time:      mTime?.value            || '',
                venue:     mVenue?.value.trim()    || '',
                price:     Number(mPrice?.value    || 0),
                team1:     mTeam1?.value.trim()    || '',
                team2:     mTeam2?.value.trim()    || '',
                banner:    mBanner?.value.trim()   || '',
                venue_img: mVenueImg?.value.trim() || ''
            };

            const globalSettings = {
                upiId:          upiInp?.value.trim()     || '',
                qrUrl:          urlInp?.value.trim()      || '',
                globalBanner:   mBanner?.value.trim()    || '',
                globalVenue:    mVenueImg?.value.trim()  || '',
                globalFooterLogo: mFooterLogo?.value.trim() || ''
            };

            try {
                if (saveBtn) saveBtn.innerText = "Saving...";
                if (saveBtn) saveBtn.disabled = true;
                await set(ref(db, 'settings/payment'), globalSettings);

                if (isEditing && editIdInput?.value) {
                    await set(ref(db, 'matches/' + editIdInput.value), matchData);
                    alert('✅ Match & Global Settings Updated!');
                } else {
                    await push(ref(db, 'matches'), matchData);
                    alert('✅ New Match & Settings Saved!');
                }
                cancelEdit();
            } catch (err) {
                alert('❌ Save Error: ' + err.message);
            } finally {
                if (saveBtn) {
                    saveBtn.innerText = isEditing ? "Update Match & QR" : "Save Match & QR";
                    saveBtn.disabled = false;
                }
            }
        });
    }

    // ── FIREBASE LISTENER 1: Payment Settings ───────────────
    try {
        onValue(ref(db, 'settings/payment'), (snap) => {
            if (!snap.exists()) return;
            const data = snap.val();
            if (upiInp && document.activeElement !== upiInp) upiInp.value = data.upiId || '';
            if (urlInp && document.activeElement !== urlInp) urlInp.value = data.qrUrl  || '';

            globalBannerUrl      = data.globalBanner     || '';
            globalVenueUrl       = data.globalVenue      || '';
            globalFooterLogoUrl  = data.globalFooterLogo || '';

            if (!isEditing) {
                if (mBanner    && document.activeElement !== mBanner)    { mBanner.value    = globalBannerUrl;    showPreview(globalBannerUrl, bannerPreview); }
                if (mVenueImg  && document.activeElement !== mVenueImg)  { mVenueImg.value  = globalVenueUrl;    showPreview(globalVenueUrl, venuePreview); }
                if (mFooterLogo&& document.activeElement !== mFooterLogo){ mFooterLogo.value = globalFooterLogoUrl; }
            }
            console.log("📦 settings/payment loaded:", data);
        }, (err) => {
            console.error("❌ settings/payment listener error:", err.message);
        });
    } catch (e) {
        console.error("❌ Could not attach settings/payment listener:", e.message);
    }

    // ── FIREBASE LISTENER 2: Matches ────────────────────────
    try {
        onValue(ref(db, 'matches'), (snap) => {
            if (!tableBody) return;
            tableBody.innerHTML = '';
            const data = snap.val();
            if (!data) {
                tableBody.innerHTML = '<tr><td colspan="4" style="padding:12px; text-align:center; color:#999;">No matches found.</td></tr>';
                return;
            }
            window.allMatches = data;
            Object.keys(data).forEach(id => {
                const m = data[id];
                tableBody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td style="padding:12px; border:1px solid #eee;">${m.title || ''}</td>
                        <td style="padding:12px; border:1px solid #eee;">${m.date  || ''}</td>
                        <td style="padding:12px; border:1px solid #eee;">₹${m.price || 0}</td>
                        <td style="padding:12px; border:1px solid #eee;">
                            <button onclick="editMatch('${id}')"   style="background:#00cf7f;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;margin-right:5px;">Edit</button>
                            <button onclick="deleteMatch('${id}')" style="background:#ff4d4d;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">Delete</button>
                        </td>
                    </tr>`);
            });
            console.log("📦 matches loaded:", Object.keys(data).length, "matches");
        }, (err) => {
            console.error("❌ matches listener error:", err.message);
        });
    } catch (e) {
        console.error("❌ Could not attach matches listener:", e.message);
    }

    // ── FIREBASE LISTENER 3: Bookings ───────────────────────
    try {
        onValue(ref(db, 'bookings'), (snapshot) => {
            if (loadingIndicator) loadingIndicator.style.display = 'none';

            let pendingCount  = 0;
            let approvedCount = 0;
            let cardsHtml     = '';

            if (snapshot.exists()) {
                const bookings = snapshot.val();
                const bookingsArray = Object.keys(bookings)
                    .map(key => ({ id: key, ...bookings[key] }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                bookingsArray.forEach(booking => {
                    const isPending = ['pending', 'under_review', 'pending_retry'].includes(booking.status);
                    if (isPending) {
                        pendingCount++;
                        const dateObj    = new Date(booking.timestamp);
                        const timeString = isNaN(dateObj) ? 'N/A' :
                            dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                        cardsHtml += `
                        <div class="utr-card${booking.status === 'under_review' ? ' under-review' : ''}">
                            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                                <div>
                                    <h3 style="margin:0;font-size:16px;color:#1f2937;">${booking.name || 'Unknown User'}</h3>
                                    <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${booking.phone || 'N/A'} • ${booking.match || 'Match'}</p>
                                </div>
                                <div style="text-align:right;">
                                    <p style="margin:0;font-size:18px;font-weight:900;color:#059669;">₹${booking.amount || 0}</p>
                                    <p style="margin:0;font-size:10px;color:#9ca3af;">${timeString}</p>
                                </div>
                            </div>

                            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <p style="margin:0;font-size:10px;font-weight:bold;color:#3b82f6;text-transform:uppercase;">User UTR</p>
                                    <p style="margin:2px 0 0;font-size:16px;font-family:monospace;font-weight:bold;color:#1e3a8a;letter-spacing:2px;">${booking.utr || 'N/A'}</p>
                                </div>
                                ${booking.status === 'under_review'
                                    ? '<span style="background:#fef08a;color:#854d0e;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;">Timeout</span>'
                                    : ''}
                            </div>

                            <div style="display:flex;gap:10px;">
                                <button onclick="approvePayment('${booking.id}', this)" class="utr-btn btn-approve">✓ Approve</button>
                                <button onclick="declinePayment('${booking.id}', this)" class="utr-btn btn-decline">✕ Decline</button>
                            </div>
                        </div>`;
                    } else if (booking.status === 'approved') {
                        approvedCount++;
                    }
                });

                if (pendingCount === 0) {
                    cardsHtml = `
                    <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px dashed #ccc;">
                        <span style="font-size:30px;">☕</span>
                        <h3 style="margin:10px 0 5px;color:#333;font-size:16px;">All caught up!</h3>
                        <p style="margin:0;color:#666;font-size:13px;">No pending verifications right now.</p>
                    </div>`;
                }
            } else {
                cardsHtml = `
                <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px dashed #ccc;">
                    <h3 style="margin:0 0 5px;color:#333;font-size:16px;">No Data Found</h3>
                    <p style="margin:0;color:#666;font-size:13px;">Waiting for new transactions...</p>
                </div>`;
            }

            if (bookingsCont)    bookingsCont.innerHTML   = cardsHtml;
            if (pendingCountEl)  pendingCountEl.innerText  = pendingCount;
            if (approvedCountEl) approvedCountEl.innerText = approvedCount;

            console.log(`📦 bookings loaded — Pending: ${pendingCount}, Approved: ${approvedCount}`);
        }, (err) => {
            console.error("❌ bookings listener error:", err.message);
            if (bookingsCont) bookingsCont.innerHTML = `<p style="color:red;">Error loading bookings: ${err.message}</p>`;
        });
    } catch (e) {
        console.error("❌ Could not attach bookings listener:", e.message);
    }
} // end loadFirebaseData()

// ============================================================
// FIX 1: DOMContentLoaded — Login button guarantee ke saath
//         milega, module deferred hai phir bhi safe rakhein.
// ============================================================
document.addEventListener('DOMContedocument.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM ready — setting up login...");

    const loginScreen  = document.getElementById('login-screen');
    const adminWrapper = document.getElementById('admin-wrapper');
    const loginError   = document.getElementById('login-error');
    const loginBtn     = document.getElementById('login-btn');

    if (!loginBtn) {
        console.error("❌ #login-btn not found in HTML!");
        return;
    }

    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        console.log("🔑 Session found — auto-login.");
        if (loginScreen)  loginScreen.style.display  = 'none';
        if (adminWrapper) adminWrapper.style.display = 'block';
        loadFirebaseData();
        return;
    }

    loginBtn.addEventListener('click', () => {
        const idVal   = document.getElementById('admin-id')?.value.trim()   || '';
        const passVal = document.getElementById('admin-pass')?.value.trim() || '';

        console.log("🔐 Login attempt:", idVal);

        if (idVal === ADMIN_ID && passVal === ADMIN_PASS) {
            console.log("✅ Login SUCCESS!");
            sessionStorage.setItem('adminLoggedIn', 'true');
            if (loginScreen)  loginScreen.style.display  = 'none';
            if (adminWrapper) adminWrapper.style.display = 'block';
            loadFirebaseData();
        } else {
            console.warn("⚠️ Wrong credentials.");
            if (loginError) {
                loginError.style.display = 'block';
                setTimeout(() => { loginError.style.display = 'none'; }, 3000);
            }
