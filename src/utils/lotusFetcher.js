export async function fetchLiveHyperionInclusions(filters = {}, start = 0) {
  const queryParams = new URLSearchParams();
  queryParams.set('option', 'com_lotusgemologygallery');
  queryParams.set('filter[gemtype]', filters.gemtype || '');
  queryParams.set('filter[origin]', filters.origin || '');
  queryParams.set('filter[enhancement]', filters.enhancement || '');
  queryParams.set('filter[search]', filters.search || '');
  queryParams.set('start', String(start));

  const proxyUrl = `/api/hyperion?${queryParams.toString()}`;
  const directUrl = `https://corsproxy.io/?${encodeURIComponent('https://www.lotusgemology.com/index.php/resources/hyperion-inclusion-search?' + queryParams.toString())}`;

  let htmlText = '';
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Proxy HTTP error! status: ${res.status}`);
    htmlText = await res.text();
  } catch (err) {
    console.warn('Vite/Cloudflare proxy failed, trying fallback CORS proxy:', err);
    try {
      const res = await fetch(directUrl);
      if (!res.ok) throw new Error(`CORS proxy HTTP error! status: ${res.status}`);
      htmlText = await res.text();
    } catch (err2) {
      console.error('Both proxies failed:', err2);
      throw new Error('Could not fetch live search results from Lotus Gemology. Check your network connection.');
    }
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  // Parse Pagination Info
  let totalCount = 0;
  let resultsText = '';
  const paginationDiv = doc.querySelector('.pagination.d-flex, .pagination');
  if (paginationDiv) {
    resultsText = paginationDiv.textContent || '';
    const match = resultsText.match(/of\s+(\d+)/i);
    if (match && match[1]) {
      totalCount = parseInt(match[1], 10);
    }
  }

  // Parse Inclusion Cards
  const items = [];
  const imageContainers = doc.querySelectorAll('.images > div');

  imageContainers.forEach((container, idx) => {
    const anchor = container.querySelector('.preload-img-result a');
    if (!anchor) return;

    let fullImgUrl = anchor.getAttribute('href') || '';
    if (fullImgUrl.startsWith('/')) {
      fullImgUrl = 'https://www.lotusgemology.com' + fullImgUrl;
    }

    const imgTag = anchor.querySelector('img');
    let thumbUrl = imgTag ? (imgTag.getAttribute('src') || '') : fullImgUrl;
    if (thumbUrl.startsWith('/')) {
      thumbUrl = 'https://www.lotusgemology.com' + thumbUrl;
    }
    const altText = imgTag ? (imgTag.getAttribute('alt') || '') : '';

    const captionSelector = anchor.getAttribute('data-sub-html') || '';
    let captionDiv = null;
    if (captionSelector && captionSelector.startsWith('#')) {
      captionDiv = doc.querySelector(captionSelector);
    } else {
      captionDiv = container.querySelector('div[id^="caption"]');
    }

    let description = altText;
    let gemType = filters.gemtype || 'Gemstone';
    let taxonomy = '';
    let origin = 'Not Specified';
    let enhancement = 'None Detected';
    let lighting = 'Fiber Optic / Dark Field';
    let photographer = 'E. Billie Hughes';
    let imageNumber = `LOTUS-${idx + 1}`;
    let fieldOfView = '';
    let datePosted = '';
    const references = [];

    if (captionDiv) {
      const descP = captionDiv.querySelector('p.description');
      if (descP && descP.textContent) {
        description = descP.textContent.trim();
      }

      const pTags = Array.from(captionDiv.querySelectorAll('p'));
      pTags.forEach(p => {
        const text = p.textContent || '';

        if (text.includes('•') || text.includes('Enhancements:') || text.includes('Lighting Conditions:')) {
          const parts = text.split('•').map(s => s.trim());
          if (parts.length > 0) {
            taxonomy = parts.slice(0, 4).join(' • ');
            const foundGem = parts.find(pt => pt.includes('Emerald') || pt.includes('Ruby') || pt.includes('Sapphire') || pt.includes('Spinel') || pt.includes('Quartz') || pt.includes('Beryl'));
            if (foundGem) gemType = foundGem;
          }

          const originMatch = text.match(/•\s*([A-Za-z\s;]+)\s*•\s*Enhancements:/i);
          if (originMatch && originMatch[1]) {
            origin = originMatch[1].trim();
          }

          const enhMatch = text.match(/Enhancements:\s*([^\bullet\n\r]+)/i);
          if (enhMatch && enhMatch[1]) {
            enhancement = enhMatch[1].replace(/Lighting Conditions:.*/i, '').trim();
          }

          const lightMatch = text.match(/Lighting Conditions:\s*([^\bullet\n\r<]+)/i);
          if (lightMatch && lightMatch[1]) {
            lighting = lightMatch[1].replace(/Photographer:.*/i, '').trim();
          }

          const photoMatch = text.match(/Photographer:\s*([^\bullet\n\r]+)/i);
          if (photoMatch && photoMatch[1]) {
            photographer = photoMatch[1].replace(/Image Number:.*/i, '').trim();
          }

          const imgNumMatch = text.match(/Image Number:\s*([A-Z0-9-]+)/i);
          if (imgNumMatch && imgNumMatch[1]) {
            imageNumber = imgNumMatch[1].trim();
          }

          const fovMatch = text.match(/Field\s*of\s*View\s*=\s*([0-9\.a-zA-Z]+)/i);
          if (fovMatch && fovMatch[1]) {
            fieldOfView = fovMatch[1].trim();
          }

          const dateMatch = text.match(/Date Posted:\s*([0-9\sA-Za-z]+)/i);
          if (dateMatch && dateMatch[1]) {
            datePosted = dateMatch[1].trim();
          }
        }

        const aRef = p.querySelector('a[target="_blank"]');
        if (aRef) {
          references.push({
            title: aRef.textContent.trim(),
            authors: '',
            details: p.textContent.trim(),
            url: aRef.getAttribute('href') || ''
          });
        }
      });
    }

    items.push({
      id: `lotus-live-${imageNumber}-${idx}`,
      imageNumber,
      title: description.substring(0, 90) + (description.length > 90 ? '...' : ''),
      description,
      gemType,
      taxonomy: taxonomy || `Natural • ${gemType}`,
      origin,
      enhancement,
      lighting,
      photographer,
      fieldOfView,
      magnification: fieldOfView ? 'Optical' : 'N/A',
      datePosted,
      imageUrl: fullImgUrl,
      thumbUrl: thumbUrl,
      references,
      isLiveLotus: true
    });
  });

  return {
    items,
    totalCount: totalCount || items.length,
    resultsText
  };
}
