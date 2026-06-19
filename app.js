(function() {
  console.log('✅ Remote app.js loaded');

  // -------------------- CONFIG --------------------
  // Use your Cloudflare Worker URL (or a CORS proxy)
  const PROXY_URL = 'https://shopee-proxy.malinaojerome151.workers.dev/'; // <-- CHANGE THIS

  // The Shopee API endpoint (we send to proxy)
  const API_URL = 'https://spx.shopee.ph/api/in-station/dock_management/queue/list';

  // Static headers from your request (keep them up to date!)
  const HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'app': 'FMS Portal',
    'content-type': 'application/json;charset=UTF-8',
    'device-id': 'c0cc0ad5daf08fc1d7990996895385a3',
    'pg-i': 'ee9LpDgfFdyz/FsCUie5NDujmKdlsabFFCXBTCPHc86+jWKkdAbXYUnMEOAjQnv7teTF/7VYbQHHnQqocU9eBHLmkg==',
    'referer': 'https://spx.shopee.ph/',
    'sec-ch-ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'version': 'fms-admin:20260610,@spx-instation/vue:20260617,@driver/driver-vue:20260610,@spx-workforceops/vue:20260616',
    'x-csrftoken': '2d4695777ac14a6eb49712fff6f37e26',
    'x-sap-ri': '71e5346afe1289b1078af13701017b75e3316fbb6cb738ed2828',
    'x-sap-sec': 'IvLPUyjllAjyzAjyy5jazAXyy5jyzAXyzAjizAjy4AzyzVXzzAiYzzjyyAjyz9WssKHazAjyxAzyzFXzzAfWJb9/B1AAcH89jbK9VRpFPJ9+EcYlROV6qG9YvuNwUIOE/vS0Kbu/7aM3AvTSF7DHGbWo/epCiJWJnuHs0m/z8hHfze3CjH57C9HW8WLq4B1DGM8fEMdzjhQVGd9gJm3OZypxayxGMpSgCttQi5gI3viclpUBLtsUsoxm+C+I9j9xhJBU11mmRSis5to/Ky2b3JKyxxgHkl2+yZJg6rVJtosrIlJts9tYUiGNJLyxEesyKR0gHsvRW2u5vEes2zjGe8Bv8kNONtoH1ZUn2WApt5zZQhm1841GiSfiHGCv6QHWmetEGnXlOSmt8/Q9NhDV9CyHN67jqPkUv3hk+jOQFUMm2u/Y90FhiwlSo9tFz4OTY2V8om4hJNdYobrLCv9Z3M1MmAjyzDN5Y8AkwIzIzAjyz1BhsKHazAjyfAjyzTXyzAf7Q9Mm+5qp8u5sPDzqQGoLItpCa5NyzAjkwluIGlaR15jyzAfYsKEhmAjyzTryzAj9zAjyPoMU+/BoWpY3MMnlob95+FAAHV2azAjyYIu4VQVPYIRyzAjymAjYzANyyAjazAjymAjyzTryzAj9zAjywCjYTvLEomZi1tGqjBy3MP371mwazAjywI+RVgbIw8uyzAjy'
  };

  // Request body (you can adjust pageno, count)
  const REQUEST_BODY = {
    pageno: 1,
    count: 500
  };

  // -------------------- DOM references --------------------
  const refreshBtn = document.getElementById('refresh-btn');
  const perimeterList = document.getElementById('perimeter-list');
  const ongoingList = document.getElementById('ongoing-list');
  const endedList = document.getElementById('ended-list');
  const timestampEl = document.getElementById('timestamp');

  // -------------------- Helper: render items --------------------
  function renderItems(list, status, container) {
    if (!list || list.length === 0) {
      container.innerHTML = `<p class="placeholder">No ${status} items</p>`;
      return;
    }
    let html = '';
    list.forEach(item => {
      if (status === 'perimeter') {
        // status 1 or 2
        html += `
          <div class="list-item">
            <div class="plate">${item.queue_number || '—'}</div>
            <div class="driver">${item.driver_name || 'No driver'} · ${item.vehicle_number || ''}</div>
            <div>⏱ ${item.waiting_time || 0}s</div>
          </div>
        `;
      } else if (status === 'ongoing') {
        // status 3
        const dock = item.occupied_dock_name || '—';
        const plate = item.vehicle_number || '—';
        html += `
          <div class="list-item">
            <div class="plate">${plate}</div>
            <div class="dock">🚪 ${dock}</div>
            <div class="driver">${item.driver_name || 'No driver'}</div>
          </div>
        `;
      } else if (status === 'ended') {
        // status 4
        html += `
          <div class="list-item">
            <div class="plate">${item.queue_number || '—'}</div>
            <div class="driver">${item.driver_name || 'No driver'} · ${item.vehicle_number || ''}</div>
            <div>${item.allocated_dock_name ? 'Dock: ' + item.allocated_dock_name : ''}</div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }

  // -------------------- Main fetch function --------------------
  function fetchData() {
    // Show loading
    perimeterList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';
    ongoingList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';
    endedList.innerHTML = '<p class="placeholder">⏳ Loading…</p>';

    // Make the POST request via the proxy
    fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: API_URL,
        headers: HEADERS,
        body: REQUEST_BODY
      })
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.retcode !== 0) {
        throw new Error(`API Error: ${data.message || 'Unknown'}`);
      }
      const list = data.data.list || [];
      // Filter by queue_status
      const perimeter = list.filter(item => item.queue_status === 1 || item.queue_status === 2);
      const ongoing = list.filter(item => item.queue_status === 3);
      const ended = list.filter(item => item.queue_status === 4);

      renderItems(perimeter, 'perimeter', perimeterList);
      renderItems(ongoing, 'ongoing', ongoingList);
      renderItems(ended, 'ended', endedList);

      timestampEl.textContent = new Date().toLocaleString();
    })
    .catch(err => {
      const msg = `❌ Error: ${err.message}`;
      perimeterList.innerHTML = `<p class="placeholder" style="color:red;">${msg}</p>`;
      ongoingList.innerHTML = `<p class="placeholder" style="color:red;">${msg}</p>`;
      endedList.innerHTML = `<p class="placeholder" style="color:red;">${msg}</p>`;
      console.error(err);
    });
  }

  // -------------------- Attach event & auto‑load --------------------
  document.addEventListener('DOMContentLoaded', function() {
    refreshBtn.addEventListener('click', fetchData);
    fetchData(); // initial load
  });

})();
