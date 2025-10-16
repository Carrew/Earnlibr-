// provider-dashboard.js
// Requires firebase.js in same folder exporting: app, auth, db
import { app, auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { ref, get, child, push, set, update, remove } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

/* -------------------------
   UI nodes
------------------------- */
const welcome = document.getElementById('welcome');
const providerMeta = document.getElementById('providerMeta');
const avatar = document.getElementById('avatar');
const trustText = document.getElementById('trustText');

const totalOffersEl = document.getElementById('totalOffers');
const totalPendingEl = document.getElementById('totalPending');
const totalConfirmedEl = document.getElementById('totalConfirmed');
const totalPaidEl = document.getElementById('totalPaid');

const offersTbody = document.getElementById('offersTbody');
const dealsTbody = document.getElementById('dealsTbody');
const invoicesTbody = document.getElementById('invoicesTbody');
const disputesTbody = document.getElementById('disputesTbody');

const modal = document.getElementById('modal');
const openCreate = document.getElementById('openCreate');
const openCreateBtn = document.getElementById('openCreateBtn');
const cancelOffer = document.getElementById('cancelOffer');
const saveOffer = document.getElementById('saveOffer');
const modalTitle = document.getElementById('modalTitle');
const modalMsg = document.getElementById('modalMsg');

const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');

/* -------------------------
   State
------------------------- */
let currentUser = null;
let providerId = null;
let editingOfferId = null;

/* -------------------------
   Auth & Role guard
------------------------- */
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  providerId = user.uid;

  // load user profile
  const userSnap = await get(child(ref(db), `users/${providerId}`));
  if (!userSnap.exists()) {
    alert('User not found.');
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }
  const profile = userSnap.val();
  if (profile.role !== 'provider') {
    alert('Access denied: you are not a provider.');
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  welcome.textContent = `Welcome, ${profile.name || 'Provider'} 👋`;
  providerMeta.textContent = `${profile.email} • Joined: ${profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}`;
  avatar.textContent = (profile.name ? profile.name.split(' ').map(s=>s[0]).slice(0,2).join('') : 'P');
  trustText.textContent = `Trust: ${profile.trustScore ?? 50}/100`;

  // initial loads
  loadOffers();
  loadDeals();
  loadInvoices();
  loadDisputes();
});

/* -------------------------
   Logout
------------------------- */
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "login.html";
});

/* -------------------------
   Modal handling
------------------------- */
function openModalForCreate(){
  editingOfferId = null;
  modalTitle.textContent = 'Create Offer';
  modalMsg.textContent = '';
  document.getElementById('offerTitle').value = '';
  document.getElementById('offerType').value = 'service';
  document.getElementById('offerAction').value = 'click';
  document.getElementById('offerCurrency').value = 'USD';
  document.getElementById('offerReward').value = '';
  document.getElementById('offerQuantity').value = '';
  document.getElementById('offerDesc').value = '';
  modal.style.display = 'flex';
}
openCreate.addEventListener('click', openModalForCreate);
openCreateBtn.addEventListener('click', openModalForCreate);
cancelOffer.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

/* -------------------------
   Offer CRUD
------------------------- */
saveOffer.addEventListener('click', async () => {
  saveOffer.disabled = true;
  saveOffer.textContent = editingOfferId ? 'Saving...' : 'Creating...';
  try {
    const title = document.getElementById('offerTitle').value.trim();
    const type = document.getElementById('offerType').value;
    const action = document.getElementById('offerAction').value;
    const currency = document.getElementById('offerCurrency').value;
    const reward = parseFloat(document.getElementById('offerReward').value) || 0;
    const quantityRaw = document.getElementById('offerQuantity').value;
    const quantity = quantityRaw ? parseInt(quantityRaw, 10) : null;
    const description = document.getElementById('offerDesc').value.trim();

    if (!title || !reward) {
      modalMsg.textContent = 'Please provide a title and reward amount.';
      modalMsg.style.color = 'var(--muted)';
      throw new Error('missing');
    }

    if (editingOfferId) {
      // update
      await update(ref(db, `offers/${editingOfferId}`), {
        title, type, action, currency, reward, quantity: quantity ?? null, description, updatedAt: new Date().toISOString()
      });
    } else {
      // create new offer
      const newRef = push(ref(db, 'offers'));
      const id = newRef.key;
      await set(newRef, {
        id,
        providerId,
        title,
        type,
        action,
        currency,
        reward,
        quantity: quantity ?? null,
        createdAt: new Date().toISOString(),
        status: 'active',
        clicks: 0,
        confirmed: 0,
        spent: 0
      });
    }

    modal.style.display = 'none';
    await loadOffers();
  } catch (err) {
    if (err.message !== 'missing') console.error(err);
  } finally {
    saveOffer.disabled = false;
    saveOffer.textContent = 'Create Offer';
  }
});

/* Edit offer helper (from table buttons) */
window.editOffer = async function(offerId){
  const snap = await get(ref(db, `offers/${offerId}`));
  if (!snap.exists()) { alert('Offer not found'); return; }
  const o = snap.val();
  editingOfferId = offerId;
  modalTitle.textContent = 'Edit Offer';
  document.getElementById('offerTitle').value = o.title || '';
  document.getElementById('offerType').value = o.type || 'service';
  document.getElementById('offerAction').value = o.action || 'click';
  document.getElementById('offerCurrency').value = o.currency || 'USD';
  document.getElementById('offerReward').value = o.reward || '';
  document.getElementById('offerQuantity').value = o.quantity || '';
  document.getElementById('offerDesc').value = o.description || '';
  modal.style.display = 'flex';
};

/* Pause/Resume */
window.togglePause = async function(offerId, currentStatus){
  const newStatus = currentStatus === 'active' ? 'paused' : 'active';
  await update(ref(db, `offers/${offerId}`), { status: newStatus });
  await loadOffers();
};

/* Delete */
window.deleteOffer = async function(offerId){
  if (!confirm('Delete this offer? This cannot be undone.')) return;
  await remove(ref(db, `offers/${offerId}`));
  await loadOffers();
};

/* -------------------------
   Loads
------------------------- */
async function loadOffers(){
  offersTbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:20px">Loading offers…</td></tr>`;
  const snap = await get(ref(db, 'offers'));
  if (!snap.exists()) {
    offersTbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:20px">No offers yet</td></tr>`;
    totalOffersEl.textContent = 0;
    totalPendingEl.textContent = 0;
    totalConfirmedEl.textContent = 0;
    totalPaidEl.textContent = 0;
    return;
  }
  const offersObj = snap.val();
  const myOffers = Object.values(offersObj).filter(o => o.providerId === providerId);

  // apply search / filter
  const q = (searchInput.value || '').toLowerCase();
  const statusFilter = filterStatus.value;

  const filtered = myOffers.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (!q) return true;
    return (o.title || '').toLowerCase().includes(q) || (o.type || '').toLowerCase().includes(q);
  });

  // totals
  let totalOffers = filtered.length;
  let pending = 0, confirmed = 0, paid = 0;

  let rows = '';
  for (const o of filtered) {
    pending += (parseFloat(o.pending || 0) || 0);
    confirmed += (parseFloat(o.confirmed || 0) || 0);
    paid += (parseFloat(o.paid || 0) || 0);
    rows += `<tr>
      <td>${escapeHtml(o.title)}</td>
      <td>${escapeHtml(o.type)}</td>
      <td>${o.currency || 'USD'}</td>
      <td>${formatMoney(o.reward, o.currency)}</td>
      <td>${o.quantity ?? '—'}</td>
      <td>${formatMoney(o.pending || 0, o.currency)}</td>
      <td>${formatMoney(o.spent || 0, o.currency)}</td>
      <td>${o.status || 'active'}</td>
      <td class="actions">
        <button class="btn-primary" onclick="editOffer('${o.id}')">Edit</button>
        <button class="btn-ghost" onclick="togglePause('${o.id}','${o.status}')">${o.status==='active'?'Pause':'Resume'}</button>
        <button class="btn-ghost" onclick="deleteOffer('${o.id}')">Delete</button>
      </td>
    </tr>`;
  }

  offersTbody.innerHTML = rows || `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:20px">No offers found</td></tr>`;
  totalOffersEl.textContent = totalOffers;
  totalPendingEl.textContent = formatMoney(pending, 'USD');
  totalConfirmedEl.textContent = formatMoney(confirmed, 'USD');
  totalPaidEl.textContent = formatMoney(paid, 'USD');
}

/* -------------------------
   Deals (pending verification)
------------------------- */
async function loadDeals(){
  dealsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">Loading deals…</td></tr>`;
  const snap = await get(ref(db, 'deals'));
  if (!snap.exists()) { dealsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">No pending deals</td></tr>`; return; }
  const deals = Object.values(snap.val());
  const myPending = deals.filter(d => d.providerId === providerId && d.status === 'pending');
  let rows = '';
  for (const d of myPending) {
    rows += `<tr>
      <td>${d.id}</td>
      <td>${escapeHtml(d.offerTitle || '')}</td>
      <td>${escapeHtml(d.promoterName || d.promoterId?.slice(0,8) || '—')}</td>
      <td>${formatMoney(d.amount || 0, d.currency || 'USD')}</td>
      <td>${d.status}</td>
      <td>
        <button class="btn-primary" onclick="approveDeal('${d.id}')">Approve</button>
        <button class="btn-ghost" onclick="rejectDeal('${d.id}')">Reject</button>
      </td>
    </tr>`;
  }
  dealsTbody.innerHTML = rows || `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">No pending deals</td></tr>`;
}

/* Approve / Reject */
window.approveDeal = async function(dealId){
  const snap = await get(ref(db, `deals/${dealId}`));
  if (!snap.exists()) { alert('Deal not found'); return; }
  const deal = snap.val();
  await update(ref(db, `deals/${dealId}`), { status: 'verified', verifiedAt: new Date().toISOString() });

  // increment offer.spent & confirmed
  const offerSnap = await get(ref(db, `offers/${deal.offerId}`));
  if (offerSnap.exists()) {
    const o = offerSnap.val();
    const newSpent = (parseFloat(o.spent || 0) + parseFloat(deal.amount || 0));
    const newConfirmed = (parseFloat(o.confirmed || 0) + 1);
    await update(ref(db, `offers/${deal.offerId}`), { spent: newSpent, confirmed: newConfirmed });
  }

  // create invoice entry under invoices/{providerId}
  const invRef = push(ref(db, `invoices/${providerId}`));
  await set(invRef, {
    id: invRef.key,
    dealId,
    total: deal.amount,
    currency: deal.currency || 'USD',
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  await loadDeals();
  await loadOffers();
  await loadInvoices();
};

window.rejectDeal = async function(dealId){
  await update(ref(db, `deals/${dealId}`), { status: 'rejected', resolvedAt: new Date().toISOString() });
  // create a dispute
  const dRef = push(ref(db, 'disputes'));
  await set(dRef, {
    id: dRef.key,
    dealId,
    providerId,
    status: 'open',
    createdAt: new Date().toISOString()
  });
  await loadDeals();
  await loadDisputes();
};

/* -------------------------
   Invoices & Disputes
------------------------- */
async function loadInvoices(){
  const snap = await get(ref(db, `invoices/${providerId}`));
  if (!snap.exists()) { invoicesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">No invoices yet</td></tr>`; return; }
  const invs = Object.values(snap.val()).reverse();
  let rows = '';
  for (const inv of invs) {
    rows += `<tr><td>${inv.id}</td><td>${formatMoney(inv.total, inv.currency||'USD')}</td><td>${inv.status}</td><td>${new Date(inv.createdAt).toLocaleString()}</td></tr>`;
  }
  invoicesTbody.innerHTML = rows;
}

async function loadDisputes(){
  const snap = await get(ref(db, 'disputes'));
  if (!snap.exists()){ disputesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px">No disputes</td></tr>`; return; }
  const disputes = Object.values(snap.val()).filter(d => d.providerId === providerId);
  let rows='';
  for (const d of disputes){
    rows += `<tr><td>${d.id}</td><td>${d.dealId}</td><td>${d.from||d.promoterId||'—'}</td><td>${d.status}</td><td><button class="btn-ghost" onclick="resolveDispute('${d.id}','accepted')">Accept</button> <button class="btn-ghost" onclick="resolveDispute('${d.id}','rejected')">Reject</button></td></tr>`;
  }
  disputesTbody.innerHTML = rows || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px">No disputes</td></tr>`;
}

window.resolveDispute = async function(disputeId, action){
  await update(ref(db, `disputes/${disputeId}`), { status: action, resolvedAt: new Date().toISOString() });
  await loadDisputes();
}

/* -------------------------
   Helpers
------------------------- */
function formatMoney(value = 0, currency='USD'){
  const v = Number(value || 0);
  return `${currency} ${v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* -------------------------
   Initial listeners (search/filter)
------------------------- */
searchInput.addEventListener('input', () => loadOffers());
filterStatus.addEventListener('change', () => loadOffers());

/* -------------------------
   End of file
------------------------- */
