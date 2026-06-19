function fetchData() {
  perimeterList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';
  ongoingList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';
  endedList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyuyjPtABnGeB2r7h_Y_15yPwiz_FvByxuzmuZ90nMojF17T-4jMUo2XcEpymsRaO2Irg/exec';

  // Just send an empty request – GAS has everything built in
  fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ dummy: '1' }) // dummy body to avoid empty request
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
