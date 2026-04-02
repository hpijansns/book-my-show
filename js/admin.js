// js/admin.js
// 🔥 FIX 1: Added 'update' to imports
import { db, ref, onValue, set, push, remove, update } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 🔐 SECURE LOGIN SYSTEM
    // ==========================================
    const loginScreen = document.getElementById('login-screen');
    const adminWrapper = document.getElementById('admin-wrapper');
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    const ADMIN_ID = "9680211974";
    const ADMIN_PASS = "Pooja2005";

    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        if(loginScreen) loginScreen.style.display = 'none';
        if(adminWrapper) adminWrapper.style.display = 'block';
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const idVal = document.getElementById('admin-id').value;
            const passVal = document.getElementById('admin-pass').value;

            if (idVal === ADMIN_ID && passVal === ADMIN_PASS) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                loginScreen.style.display = 'none';
                adminWrapper.style.display = 'block';
            } else {
                loginError.style.display = 'block';
                setTimeout(() => { loginError.style.display = 'none'; }, 3000);
            }
        });
    }

    // ==========================================
    // 📊 MATCH & PAYMENT LOGIC (Updated for Footer Logo)
    // ==========================================
    const form = document.getElementById('match-form');
    if (!form) return;

    const tableBody = document.getElementById('admin-match-list');
    const editIdInput = document.getElementById('edit-id');
    const mTitle = document.getElementById('m-title');
    const mDate = document.getElementById('m-date');
    const mTime = document.getElementById('m-time');
    const mVenue = document.getElementById('m-venue');
    const mPrice = document.getElementById('m-price');
    const mTeam1 = document.getElementById('m-team1');
    const mTeam2 = document.getElementById('m-team2');
    const mBanner = document.getElementById('m-banner');      
    const mVenueImg = document.getElementById('m-venue-img'); 
    
    // 🚀 NEW: Footer Logo Input
    const mFooterLogo = document.getElementById('m-footer-logo'); 

    const upiInp = document.getElementById('admin-upi-id');
    const urlInp = document.getElementById('admin-qr-url');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');

    const bannerPreview = document.getElementById('banner-preview');
    const venuePreview = document.getElementById('venue-preview');

    let isEditing = false;
    let globalBannerUrl = ''; 
    let globalVenueUrl = '';  
    let globalFooterLogoUrl = ''; // Master Footer Logo variable

    function showPreview(url, element) {
        if (element) {
            if (url && url.trim().startsWith('http')) {
                element.src = url;
                element.style.display = 'block';
                element.style.width = '100px';
                element.style.marginTop = '10px';
            } else {
                element.style.display = 'none';
            }
        }
    }

    if(mBanner) mBanner.addEventListener('input', () => showPreview(mBanner.value, bannerPreview));
    if(mVenueImg) mVenueImg.addEventListener('input', () => showPreview(mVenueImg.value, venuePreview));

    // --- Auto-Load Global Settings (UPI, QR, Banner, Venue, Footer Logo) ---
    onValue(ref(db, 'settings/payment'), (snap) => {
        if (snap.exists()) {
            const data = snap.val();
            if (upiInp && document.activeElement !== upiInp) upiInp.value = data.upiId || '';
            if (urlInp && document.activeElement !== urlInp) urlInp.value = data.qrUrl || '';
            
            // Storing global links
            globalBannerUrl = data.globalBanner || '';
            globalVenueUrl = data.globalVenue || '';
            globalFooterLogoUrl = data.globalFooterLogo || '';

            // Auto-fill form if NOT in edit mode
            if (!isEditing) {
                if (mBanner && document.activeElement !== mBanner) {
                    mBanner.value = globalBannerUrl;
                    showPreview(globalBannerUrl, bannerPreview);
                }
                if (mVenueImg && document.activeElement !== mVenueImg) {
                    mVenueImg.value = globalVenueUrl;
                    showPreview(globalVenueUrl, venuePreview);
                }
                if (mFooterLogo && document.activeElement !== mFooterLogo) {
                    mFooterLogo.value = globalFooterLogoUrl;
                }
            }
        }
    });

    onValue(ref(db, 'matches'), (snap) => {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const data = snap.val();
        if (!data) return;
        window.allMatches = data;
        Object.keys(data).forEach(id => {
            const m = data[id];
            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td style="padding:12px; border:1px solid #eee;">${m.title || ''}</td>
                    <td style="padding:12px; border:1px solid #eee;">${m.date || ''}</td>
                    <td style="padding:12px; border:1px solid #eee;">₹${m.price || 0}</td>
                    <td style="padding:12px; border:1px solid #eee;">
                        <button class="action-btn btn-edit" onclick="editMatch('${id}')" style="background:#00cf7f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteMatch('${id}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: mTitle.value.trim(), date: mDate.value, time: mTime.value,
            venue: mVenue.value.trim(), price: Number(mPrice.value || 0),
            team1: mTeam1.value.trim(), team2: mTeam2.value.trim(),
            banner: mBanner.value.trim(), venue_img: mVenueImg.value.trim() 
        };

        const globalSettings = {
            upiId: upiInp ? upiInp.value.trim() : '',
            qrUrl: urlInp ? urlInp.value.trim() : '',
            globalBanner: mBanner.value.trim(), 
            globalVenue: mVenueImg.value.trim(),
            globalFooterLogo: mFooterLogo ? mFooterLogo.value.trim() : '' // 🚀 Saving Footer Logo
        };

        try {
            saveBtn.innerText = "Saving...";
            await set(ref(db, 'settings/payment'), globalSettings);

            if (isEditing && editIdInput.value) {
                await set(ref(db, 'matches/' + editIdInput.value), data);
                alert('Match & Global Settings Updated ✅');
            } else {
                await push(ref(db, 'matches'), data);
                alert('New Match & Settings Saved ✅');
            }
            cancelEdit(); 
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            saveBtn.innerText = isEditing ? "Update Match & QR" : "Save Match & QR";
        }
    });

    window.editMatch = (id) => {
        const m = window.allMatches[id];
        if (!m) return;
        editIdInput.value = id;
        mTitle.value = m.title || ''; mDate.value = m.date || '';
        mTime.value = m.time || ''; mVenue.value = m.venue || '';
        mPrice.value = m.price || ''; mTeam1.value = m.team1 || '';
        mTeam2.value = m.team2 || ''; mBanner.value = m.banner || '';
        mVenueImg.value = m.venue_img || ''; 
        
        // Also load the footer logo if we are editing
        if(mFooterLogo) mFooterLogo.value = globalFooterLogoUrl;

        showPreview(m.banner, bannerPreview);
        showPreview(m.venue_img, venuePreview);
        isEditing = true;
        if(formTitle) formTitle.innerText = 'Edit Match Details';
        if(saveBtn) saveBtn.innerText = 'Update Match & QR';
        if(cancelBtn) cancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteMatch = async (id) => {
        if (!confirm('Are you sure you want to delete this match?')) return;
        try { await remove(ref(db, 'matches/' + id)); } catch (err) { alert(err.message); }
    };

    function cancelEdit() {
        isEditing = false;
        editIdInput.value = ''; mTitle.value = ''; mDate.value = ''; mTime.value = '';
        mVenue.value = ''; mPrice.value = ''; mTeam1.value = ''; mTeam2.value = '';
        
        mBanner.value = globalBannerUrl;
        mVenueImg.value = globalVenueUrl;
        if(mFooterLogo) mFooterLogo.value = globalFooterLogoUrl;

        showPreview(globalBannerUrl, bannerPreview);
        showPreview(globalVenueUrl, venuePreview);
        
        if(cancelBtn) cancelBtn.style.display = 'none';
        if(formTitle) formTitle.innerText = 'Add New Match';
        if(saveBtn) saveBtn.innerText = 'Save Match & QR';
    }
    if(cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

    // ==========================================
    // 🚀 AUTO-FILL TEAM LOGOS LOGIC
    // ==========================================
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
        "CSK": "https://iili.io/qUcs9ov.png", "MI": "https://iili.io/qSFtonj.png", 
        "RCB": "https://iili.io/qUBWD9n.webp", "KKR": "https://iili.io/qSFtCZb.png", 
        "SRH": "https://iili.io/qSBf9J1.png", "DC": "https://iili.io/qSf8yG9.jpg", 
        "PBKS": "https://iili.io/qUqmEOX.jpg", "RR": "https://iili.io/qUqO2HP.jpg", 
        "LSG": "https://iili.io/qUBx5lI.png", "GT": "https://iili.io/qUqWsqB.png"
    };

    function getShortName(nameStr) {
        if (!nameStr) return "";
        return teamDictionary[nameStr.trim().toLowerCase()] || "";
    }

    function checkAndFillTeamLogos() {
        if (!mTitle) return;
        const teams = mTitle.value.trim().split(/\s+vs\s+|\s+v\s+|\s*-\s*/i);
        if (teams.length === 2) {
            const t1 = getShortName(teams[0]);
            const t2 = getShortName(teams[1]);
            if (t1 && t2) {
                if (mTeam1 && teamLogos[t1]) mTeam1.value = teamLogos[t1];
                if (mTeam2 && teamLogos[t2]) mTeam2.value = teamLogos[t2];
            }
        }
    }
    if (mTitle) {
        mTitle.addEventListener('input', checkAndFillTeamLogos);
        mTitle.addEventListener('change', checkAndFillTeamLogos);
    }

    // ==========================================
    // 🔥 NEW: LIVE UTR APPROVALS LOGIC 🔥
    // ==========================================
    
    // FIX 2: Added global functions for Approve/Decline
    window.approvePayment = function(bookingId, btnElement) {
        if(confirm("APPROVE this payment? User will be redirected to success page.")) {
            btnElement.innerHTML = "Approving...";
            btnElement.classList.add('btn-loading');
            
            update(ref(db, `bookings/${bookingId}`), { 
                status: 'approved',
                approvedAt: new Date().toISOString()
            });
        }
    };

    window.declinePayment = function(bookingId, btnElement) {
        if(confirm("DECLINE this payment? User will be asked to re-enter UTR.")) {
            btnElement.innerHTML = "Declining...";
            btnElement.classList.add('btn-loading');
            
            update(ref(db, `bookings/${bookingId}`), { 
                status: 'declined',
                declinedAt: new Date().toISOString()
            });
        }
    };

    const bookingsContainer = document.getElementById('bookings-container');
    const pendingCountEl = document.getElementById('pending-count');
    const approvedCountEl = document.getElementById('approved-count');
    const loadingIndicator = document.getElementById('loading-indicator');

    // FIX 3: Real-time listener for bookings
    onValue(ref(db, 'bookings'), (snapshot) => {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        let pendingCount = 0;
        let approvedCount = 0;
        let cardsHtml = '';

        if (snapshot.exists()) {
            const bookings = snapshot.val();
            
            const bookingsArray = Object.keys(bookings).map(key => ({
                id: key,
                ...bookings[key]
            })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            bookingsArray.forEach(booking => {
                if (booking.status === 'pending' || booking.status === 'under_review' || booking.status === 'pending_retry') {
                    pendingCount++;
                    
                    const dateObj = new Date(booking.timestamp);
                    const timeString = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    
                    cardsHtml += `
                    <div class="utr-card ${booking.status === 'under_review' ? 'under-review' : ''}">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                            <div>
                                <h3 style="margin:0; font-size:16px; color:#1f2937;">${booking.name || 'Unknown User'}</h3>
                                <p style="margin:2px 0 0; font-size:12px; color:#6b7280;">${booking.phone || 'N/A'} • ${booking.match || 'Match'}</p>
                            </div>
                            <div style="text-align:right;">
                                <p style="margin:0; font-size:18px; font-weight:900; color:#059669;">₹${booking.amount || 0}</p>
                                <p style="margin:0; font-size:10px; color:#9ca3af;">${timeString}</p>
                            </div>
                        </div>
                        
                        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <p style="margin:0; font-size:10px; font-weight:bold; color:#3b82f6; text-transform:uppercase;">User UTR</p>
                                <p style="margin:2px 0 0; font-size:16px; font-family:monospace; font-weight:bold; color:#1e3a8a; letter-spacing:2px;">${booking.utr || 'N/A'}</p>
                            </div>
                            ${booking.status === 'under_review' ? '<span style="background:#fef08a; color:#854d0e; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">Timeout</span>' : ''}
                        </div>

                        <div style="display:flex; gap:10px;">
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
                <div style="text-align:center; padding:40px 20px; background:#fff; border-radius:8px; border:1px dashed #ccc;">
                    <span style="font-size:30px;">☕</span>
                    <h3 style="margin:10px 0 5px; color:#333; font-size:16px;">All caught up!</h3>
                    <p style="margin:0; color:#666; font-size:13px;">No pending UTR verifications right now.</p>
                </div>`;
            }
            if(bookingsContainer) bookingsContainer.innerHTML = cardsHtml;
        } else {
            if(bookingsContainer) bookingsContainer.innerHTML = `
                <div style="text-align:center; padding:40px 20px; background:#fff; border-radius:8px; border:1px dashed #ccc;">
                    <h3 style="margin:0 0 5px; color:#333; font-size:16px;">No Data Found</h3>
                    <p style="margin:0; color:#666; font-size:13px;">Waiting for new transactions...</p>
                </div>`;
        }

        // FIX 4: Counter Updates
        if(pendingCountEl) pendingCountEl.innerText = pendingCount;
        if(approvedCountEl) approvedCountEl.innerText = approvedCount;
    });

}); // End of DOMContentLoaded
