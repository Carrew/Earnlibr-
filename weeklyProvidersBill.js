// weeklyProvidersBill.js
import { db } from './firebase.js';
import { ref, get, push, set } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js';

async function generateProviderBills() {
  try {
    const dealsSnap = await get(ref(db, 'completed-deals'));
    if (!dealsSnap.exists()) return console.log('No completed deals found.');

    const allDeals = dealsSnap.val();
    const unpaidDeals = Object.entries(allDeals)
      .filter(([id, deal]) => !deal.providerPaid)
      .map(([id, deal]) => ({ id, ...deal }));

    const providerMap = {};

    // Group by provider → offer → currency
    unpaidDeals.forEach(deal => {
      if (!providerMap[deal.providerId]) providerMap[deal.providerId] = {};
      const prov = providerMap[deal.providerId];

      const key = `${deal.offerId}_${deal.currency}`;
      if (!prov[key]) prov[key] = {
        offerTitle: deal.offerTitle,
        currency: deal.currency,
        deals: [],
        subtotal: 0,
        imageUrl: deal.offerImage || null
      };

      prov[key].deals.push(deal);
      prov[key].subtotal += parseFloat(deal.commissionEarned || 0);
    });

    // Save bills to provider-bills node
    for (const [providerId, offers] of Object.entries(providerMap)) {
      const billId = Date.now().toString();
      const billData = {
        createdAt: new Date().toISOString(),
        offers: Object.values(offers),
        totalPerCurrency: {}
      };

      // Calculate total per currency
      Object.values(offers).forEach(o => {
        if (!billData.totalPerCurrency[o.currency]) billData.totalPerCurrency[o.currency] = 0;
        billData.totalPerCurrency[o.currency] += o.subtotal;
      });

      await set(ref(db, `provider-bills/${providerId}/${billId}`), billData);
      console.log(`Provider bill generated: ${providerId} → ${billId}`);
    }

    console.log('All provider bills generated successfully.');
  } catch (err) {
    console.error('Error generating provider bills:', err);
  }
}

// Run the script
generateProviderBills();
