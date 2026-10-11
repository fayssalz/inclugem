/**
 * Standalone Cloudflare Worker API Handler
 * Handles D1 Database queries, R2 Image Uploads & Serving, and CORS.
 */

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

async function ensureTableExists(db) {
  const schema = `
    CREATE TABLE IF NOT EXISTS inclusions (
      id TEXT PRIMARY KEY,
      imageNumber TEXT,
      title TEXT NOT NULL,
      gemType TEXT,
      taxonomy TEXT,
      origin TEXT,
      enhancement TEXT,
      lighting TEXT,
      photographer TEXT,
      fieldOfView TEXT,
      magnification TEXT,
      datePosted TEXT,
      description TEXT,
      imageUrl TEXT NOT NULL,
      thumbUrl TEXT,
      tags TEXT,
      "references" TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.prepare(schema).run();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/?/, '').replace(/^\/+/, '');

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    try {
      // ROUTE: GET /api/images/*
      if (path.startsWith('images/')) {
        const key = path;
        if (!env.IMAGES_BUCKET) {
          return jsonResponse({ success: false, error: 'R2 bucket (IMAGES_BUCKET) is not bound.' }, 500);
        }
        const object = await env.IMAGES_BUCKET.get(key);
        if (!object) {
          return new Response('Image Not Found', { status: 404 });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(object.body, { headers });
      }

      // ROUTE: GET /api/inclusions
      if ((path === 'inclusions' || path === '') && request.method === 'GET') {
        if (!env.DB) {
          return jsonResponse({ success: false, error: 'D1 Database (DB) is not bound.' }, 500);
        }
        await ensureTableExists(env.DB);

        const { results } = await env.DB.prepare(
          'SELECT * FROM inclusions ORDER BY created_at DESC'
        ).all();

        const parsedRecords = (results || []).map(row => {
          let tags = [];
          let references = [];
          try {
            tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
          } catch (e) {
            tags = [];
          }
          try {
            references = typeof row.references === 'string' ? JSON.parse(row.references) : (row.references || []);
          } catch (e) {
            references = [];
          }

          return {
            ...row,
            tags,
            references
          };
        });

        return jsonResponse({ success: true, data: parsedRecords });
      }

      // ROUTE: POST /api/inclusions
      if (path === 'inclusions' && request.method === 'POST') {
        if (!env.DB) {
          return jsonResponse({ success: false, error: 'D1 Database (DB) is not bound.' }, 500);
        }
        await ensureTableExists(env.DB);

        const body = await request.json();
        const action = body.action || 'save';
        const record = body.record || body;

        if (action === 'delete') {
          const idToDelete = record.id || body.id;
          if (!idToDelete) {
            return jsonResponse({ success: false, error: 'Record ID is required for deletion.' }, 400);
          }
          await env.DB.prepare('DELETE FROM inclusions WHERE id = ?').bind(idToDelete).run();
          return jsonResponse({ success: true, message: 'Record deleted successfully.' });
        }

        if (!record.id || !record.title) {
          return jsonResponse({ success: false, error: 'Record ID and Title are required.' }, 400);
        }

        const tagsStr = JSON.stringify(record.tags || []);
        const refStr = JSON.stringify(record.references || []);

        const query = `
          INSERT INTO inclusions (
            id, imageNumber, title, gemType, taxonomy, origin,
            enhancement, lighting, photographer, fieldOfView,
            magnification, datePosted, description, imageUrl, thumbUrl,
            tags, "references", updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            imageNumber = excluded.imageNumber,
            title = excluded.title,
            gemType = excluded.gemType,
            taxonomy = excluded.taxonomy,
            origin = excluded.origin,
            enhancement = excluded.enhancement,
            lighting = excluded.lighting,
            photographer = excluded.photographer,
            fieldOfView = excluded.fieldOfView,
            magnification = excluded.magnification,
            datePosted = excluded.datePosted,
            description = excluded.description,
            imageUrl = excluded.imageUrl,
            thumbUrl = excluded.thumbUrl,
            tags = excluded.tags,
            "references" = excluded."references",
            updated_at = CURRENT_TIMESTAMP;
        `;

        await env.DB.prepare(query).bind(
          String(record.id),
          String(record.imageNumber || ''),
          String(record.title || ''),
          String(record.gemType || ''),
          String(record.taxonomy || ''),
          String(record.origin || ''),
          String(record.enhancement || ''),
          String(record.lighting || ''),
          String(record.photographer || ''),
          String(record.fieldOfView || ''),
          String(record.magnification || ''),
          String(record.datePosted || ''),
          String(record.description || ''),
          String(record.imageUrl || ''),
          String(record.thumbUrl || record.imageUrl || ''),
          tagsStr,
          refStr
        ).run();

        return jsonResponse({ success: true, record });
      }

      // ROUTE: POST /api/upload
      if (path === 'upload' && request.method === 'POST') {
        if (!env.IMAGES_BUCKET) {
          return jsonResponse({ success: false, error: 'R2 bucket (IMAGES_BUCKET) is not bound.' }, 500);
        }

        let imageBytes;
        let contentType = 'image/png';
        let extension = 'png';

        const contentTypeHeader = request.headers.get('content-type') || '';

        if (contentTypeHeader.includes('application/json')) {
          const body = await request.json();
          if (!body.image) {
            return jsonResponse({ success: false, error: 'No image data provided.' }, 400);
          }

          if (body.image.startsWith('data:image')) {
            const match = body.image.match(/^data:(image\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
            if (match) {
              contentType = match[1];
              extension = contentType.split('/')[1] || 'png';
              const binaryStr = atob(match[2]);
              const len = binaryStr.length;
              imageBytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                imageBytes[i] = binaryStr.charCodeAt(i);
              }
            }
          }
        } else if (contentTypeHeader.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('image');
          if (!file || !(file instanceof File)) {
            return jsonResponse({ success: false, error: 'No image file found in form data.' }, 400);
          }
          contentType = file.type || 'image/png';
          extension = contentType.split('/')[1] || 'png';
          imageBytes = new Uint8Array(await file.arrayBuffer());
        }

        if (!imageBytes) {
          return jsonResponse({ success: false, error: 'Failed to process image payload.' }, 400);
        }

        const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const key = `images/${fileId}.${extension}`;

        await env.IMAGES_BUCKET.put(key, imageBytes, {
          httpMetadata: { contentType }
        });

        const imagePath = `/api/${key}`;

        return jsonResponse({
          success: true,
          imageUrl: imagePath,
          thumbUrl: imagePath,
          key
        });
      }

      return jsonResponse({ success: false, error: `Route /api/${path} not found.` }, 404);

    } catch (err) {
      return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
    }
  }
};
