// weeklyAdminProvidersBill.js
import { db } from './firebase.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js';

async function generateAdminBills() {
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
        subtotal: 0
      };

      prov[key].deals.push(deal);
      prov[key].subtotal += parseFloat(deal.commissionEarned || 0);
    });

    console.log('Admin bills preview:');
    for (const [providerId, offers] of Object.entries(providerMap)) {
      const totalPerCurrency = {};
      Object.values(offers).forEach(o => {
        if (!totalPerCurrency[o.currency]) totalPerCurrency[o.currency] = 0;
        totalPerCurrency[o.currency] += o.subtotal;
      });

      console.log(`Provider: ${providerId}`);
      console.table(totalPerCurrency);

      // Optionally, save to admin-bills node
      await update(ref(db, `admin-bills/${providerId}`), {
        lastGenerated: new Date().toISOString(),
        offers,
        totalPerCurrency
      });
    }

    console.log('All admin bills generated successfully.');
  } catch (err) {
    console.error('Error generating admin bills:', err);
  }
}

// Run the script
generateAdminBills();
