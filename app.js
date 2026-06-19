function fetchData() {
  perimeterList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';
  ongoingList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';
  endedList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbxfcqSqQtEf-8jcFXhW02Y9fIMg-fPmfReDBYCXKSVUI5ZXxuuUGubXtX7HtZIzOwQL/exec'; // your URL

  const payload = {
    url: API_URL,
    headers: HEADERS,
    body: REQUEST_BODY
  };

  const formData = new URLSearchParams();
  formData.append('payload', JSON.stringify(payload));

  fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData
  })
  .then(res => res.json())
  .then(wrapper => {
    console.log('📦 GAS response:', wrapper);
    if (!wrapper.success) {
      throw new Error(wrapper.error || 'GAS reported failure');
    }
    const data = wrapper.data;
    if (data.retcode !== 0) {
      throw new Error(`Shopee API Error ${data.retcode}: ${data.message || 'Unknown'}`);
    }
    const list = data.data.list || [];
    const perimeter = list.filter(item => item.queue_status === 1 || item.queue_status === 2);
    const ongoing = list.filter(item => item.queue_status === 3);
    const ended = list.filter(item => item.queue_status === 4);

    renderItems(perimeter, 'perimeter', perimeterList);
    renderItems(ongoing, 'ongoing', ongoingList);
    renderItems(ended, 'ended', endedList);

    timestampEl.textContent = new Date().toLocaleString();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    const msg = `❌ Error: ${err.message}`;
    perimeterList.innerHTML = `<p class="placeholder" style="color:red;">${msg}</p>`;
    ongoingList.innerHTML = `<p class="placeholder" style="color:red;">${msg}</p>`;
    endedList.innerHTML = `<p class="placeholder" style="color:red;">${msg}</p>`;
  });
}
