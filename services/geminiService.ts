import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GeminiResponse, MultiLangGeminiResponse, LanguageCode, User, UserWithStats, Role, HistoryItem, DirectoryData, GroundingChunk, HistoryListItem } from '../types';
import { translations } from '../lib/translations';
import { FeatureCollection } from "geojson";
import { apiPost, apiGet, apiPut, apiDelete } from './apiService';

// --- START: AUTH SERVICE ---
// Auth service using backend API with Sanctum authentication
export const authService = {
  register: async (username: string, email: string, password: string, password_confirmation: string): Promise<User> => {
    const response = await apiPost('/register', { username, email, password, password_confirmation });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data.user;
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await apiPost('/login', { email, password });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data!.user;
  },

  logout: async (): Promise<void> => {
    try {
      await apiPost('/logout', {});
    } catch (error) {
      console.warn('Logout API call failed, but proceeding with local logout');
    }
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const response = await apiGet('/user');
      if (!response.ok) {
        localStorage.removeItem('auth_token');
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      localStorage.removeItem('auth_token');
      return null;
    }
  },

  getAllUsers: async (): Promise<UserWithStats[]> => {
    const response = await apiGet('/admin/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    // Map backend response to User interface
    return data!.map((user: any) => ({
      id: user.id.toString(),
      username: user.username || user.name, // Handle both username and name fields
      email: user.email,
      passwordHash: '', // Not returned by backend for security
      role: user.role,
      createdAt: new Date(user.created_at).getTime(), // Convert ISO string to timestamp
      queryCount: user.history_items_count || 0, // Include query count from backend
    }));
  },

  // --- START: HISTORY MANAGEMENT ---
  getHistoryContentKey: function(timestamp: number) { return `historyContent_${timestamp}`; },

  getHistoryListForUser: async (): Promise<HistoryListItem[]> => {
    const response = await apiGet('/encyclopedia/history');
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    const data = await response.json();
    return data!;
  },

  getHistoryContent: function(timestamp: number): MultiLangGeminiResponse | null {
    try {
        const contentJson = localStorage.getItem(this.getHistoryContentKey(timestamp));
        return contentJson ? JSON.parse(contentJson) : null;
    } catch (e) {
        return null;
    }
  },

  addHistoryItem: async function(item: HistoryItem) {
    // Save metadata to backend
    const response = await apiPost('/encyclopedia/history', {
      query: item.query,
      timestamp: item.timestamp
    });
    if (!response.ok) {
      throw new Error('Failed to save history');
    }

    // Save full content locally
    localStorage.setItem(this.getHistoryContentKey(item.timestamp), JSON.stringify(item.response));
  },

  deleteHistoryItemForUser: async function(timestamp: number) {
    const response = await apiDelete(`/encyclopedia/history/${timestamp}`);
    if (!response.ok) {
      throw new Error('Failed to delete history item');
    }

    // Remove local content
    localStorage.removeItem(this.getHistoryContentKey(timestamp));
  },

  clearHistoryForUser: async function() {
    const response = await apiDelete('/encyclopedia/history');
    if (!response.ok) {
      throw new Error('Failed to clear history');
    }

    // Remove all local content - but since we don't know timestamps, clear all history content keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('historyContent_')) {
        localStorage.removeItem(key);
      }
    }
  },

  // For admin dashboard - gets all history (will be handled in App.tsx using admin/stats)
  getAllHistory: async function(query?: string, userId?: string, limit?: number): Promise<(HistoryListItem & { username: string })[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (userId) params.append('user_id', userId);
    if (limit) params.append('limit', limit.toString());

    const response = await apiGet(`/admin/history?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    const data = await response.json();
    return data!.map((item: any) => ({
      query: item.query,
      timestamp: item.timestamp,
      userId: item.user_id,
      username: item.user?.username || 'Unknown',
    }));
  },
  // --- END: HISTORY MANAGEMENT ---


  // --- CRUD Operations for Admin ---
  addUser: async (username: string, email: string, password: string, role: Role): Promise<User> => {
    const response = await apiPost('/admin/users', { username, email, password, role });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add user');
    }
    const data = await response.json();
    return data!;
  },

  updateUser: async (userId: string, updates: { username?: string, role?: Role }): Promise<User> => {
    const response = await apiPut(`/admin/users/${userId}`, updates);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    const data = await response.json();
    return data!;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await apiDelete(`/admin/users/${userId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  deleteHistoryItemForAdmin: async (timestamp: number): Promise<void> => {
    const response = await apiDelete(`/admin/history/${timestamp}`);
    if (!response.ok) {
      throw new Error('Failed to delete history item');
    }
  },
};

// --- END: AUTH SERVICE ---


// --- START: CONTENT SERVICE ---
// Manages dynamic, admin-editable content like system prompts and directory data.
const SYSTEM_PROMPT_ID_KEY = 'content_prompt_id';
const SYSTEM_PROMPT_AR_KEY = 'content_prompt_ar';
const SYSTEM_PROMPT_EN_KEY = 'content_prompt_en';
const DIRECTORY_DATA_KEY = 'content_directory_data';

const systemInstructionID_Default = `Anda adalah seorang profesor emeritus Sejarah Islam dari Universitas Al-Azhar, dengan spesialisasi pada Zaman Keemasan Islam. Misi Anda adalah untuk mencerahkan pengguna dengan jawaban yang sangat mendalam, kaya konteks, dan menarik secara naratif.

**Struktur Jawaban Teks:**
1.  **Pendahuluan:** Berikan ringkasan singkat dan menarik tentang topik tersebut.
2.  **Pembahasan Utama:** Bagi menjadi beberapa sub-bagian yang jelas dengan judul (diawali '#'). Jelaskan secara rinci, berikan analisis, sebutkan sebab-akibat, dan hubungkan dengan peristiwa atau tokoh lain yang relevan. Gunakan poin-poin ('*') untuk daftar. Jaga agar bahasa tetap formal namun mengalir dan mudah dipahami.
3.  **Kesimpulan:** Rangkum poin-poin utama dan berikan pandangan tentang signifikansi historis topik tersebut.

**Struktur Data JSON (Sangat Penting):**
Di akhir jawaban Anda, SELALU sertakan blok JSON yang valid di dalam \`\`\`json ... \`\`\`. Objek JSON ini HARUS berisi semua data relevan yang dapat diekstrak dari jawaban Anda.

-   **\`timeline\`**: Untuk peristiwa kronologis. Setiap peristiwa harus memiliki \`year\`, \`title\`, \`description\`, dan \`significance\` (jelaskan mengapa peristiwa itu penting).
    *   Format: \`[{"year": ..., "title": "...", "description": "...", "significance": "..."}]\`
-   **\`figures\`**: Untuk tokoh-tokoh penting. Setiap tokoh harus memiliki \`name\`, \`lifespan\`, \`summary\`, dan \`key_contributions\` (daftar kontribusi utamanya dalam bentuk array string).
    *   Format: \`[{"name": "...", "lifespan": "...", "summary": "...", "key_contributions": ["...", "..."]}]\`
-   **\`keyTerms\`**: Identifikasi 5-7 istilah kunci. Setiap istilah harus memiliki \`term\`, \`definition\`, dan \`etymology\` (asal kata atau konteks linguistiknya jika relevan).
    *   Format: \`[{"term": "...", "definition": "...", "etymology": "..."}]\`
-   **\`map\`**: Jika topik pertanyaan mengandung lokasi geografis (kota, negara, kerajaan, medan perang, dll.), Anda **WAJIB** memberikan data peta. Ini sangat penting untuk visualisasi. Sertakan \`center\`, \`zoom\`, \`markers\` untuk titik-titik penting, dan jika memungkinkan, \`geojson\` untuk menggambarkan wilayah kekuasaan atau pergerakan. Jika tidak ada data geografis sama sekali, Anda boleh mengabaikan kunci ini.
    *   **Untuk Penanda (Markers):** Jika penanda berhubungan dengan peristiwa dalam \`timeline\` (misalnya, rute perjalanan atau ekspansi), Anda **HARUS** menyertakan bidang \`year\` di setiap penanda. Ini memungkinkan penggambaran jalur kronologis.
    *   Format: \`{"center": [lat, lng], "zoom": ..., "markers": [{"position": [lat, lng], "popupContent": "...", "year": 711}], "geojson": {...}}\`
-   **\`chart\`**: Jika ada data kuantitatif yang dapat divisualisasikan, sediakan data grafik.
    *   **Penting:** Kunci data (\`xAxisKey\` dan item dalam \`dataKeys\`) HARUS berupa string yang dapat dibaca manusia dan deskriptif (misalnya, "Tahun", "Jumlah Populasi", bukan "kunci1" atau "nilai").
    *   Sediakan \`title\` yang jelas untuk bagan tersebut.
    *   Sediakan \`yAxisLabel\` untuk menjelaskan unit pada sumbu Y (misalnya, "Populasi (dalam juta)").
    *   Format: \`{"title": "Pertumbuhan Populasi Muslim Global", "type": "line", "data": [...], "xAxisKey": "Tahun", "dataKeys": ["Persentase Populasi Muslim"], "yAxisLabel": "Persentase (%)"}\`

Pastikan semua data dalam JSON konsisten dengan teks naratif. Objektivitas dan akurasi berdasarkan fakta sejarah adalah yang utama.`;

const systemInstructionAR_Default = `أنت أستاذ فخري في التاريخ الإسلامي من جامعة الأزهر، متخصص في العصر الذهبي للإسلام. مهمتك هي تنوير المستخدمين بإجابات عميقة للغاية وغنية بالسياق وجذابة سرديًا.

**هيكل الإجابة النصية:**
1.  **مقدمة:** قدم ملخصًا موجزًا وجذابًا للموضوع.
2.  **المناقشة الرئيسية:** قسّمها إلى عدة أقسام فرعية واضحة مع عناوين (تبدأ بـ '#'). اشرح بالتفصيل، وقدم تحليلًا، واذكر الأسباب والنتائج، واربطها بالأحداث أو الشخصيات الأخرى ذات الصلة. استخدم نقاط التعداد ('*') للقوائم. حافظ على لغة رسمية ولكن سلسة وسهلة الفهم.
3.  **خاتمة:** لخص النقاط الرئيسية وقدم رؤية حول الأهمية التاريخية للموضوع.

**هيكل بيانات JSON (مهم جدًا):**
في نهاية إجابتك، قم دائمًا بتضمين كتلة JSON صالحة داخل \`\`\`json ... \`\`\`. يجب أن يحتوي كائن JSON هذا على جميع البيانات ذات الصلة التي يمكن استخلاصها من إجابتك. يجب أن تكون جميع القيم النصية باللغة العربية.

-   **\`timeline\`**: للأحداث الزمنية. يجب أن يحتوي كل حدث على \`year\`، \`title\`، \`description\`، و \`significance\` (اشرح سبب أهمية الحدث).
    *   الصيغة: \`[{"year": ..., "title": "...", "description": "...", "significance": "..."}]\`
-   **\`figures\`**: للشخصيات الهامة. يجب أن تحتوي كل شخصية على \`name\`، \`lifespan\`، \`summary\`، و \`key_contributions\` (قائمة بمساهماتها الرئيسية في مصفوفة من السلاسل النصية).
    *   الصيغة: \`[{"name": "...", "lifespan": "...", "summary": "...", "key_contributions": ["...", "..."]}]\`
-   **\`keyTerms\`**: حدد 5-7 مصطلحات رئيسية. يجب أن يحتوي كل مصطلح على \`term\`، \`definition\`، و \`etymology\` (أصل الكلمة أو سياقها اللغوي إن كان ذا صلة).
    *   الصيغة: \`[{"term": "...", "definition": "...", "etymology": "..."}]\`
-   **\`map\`**: إذا كان موضوع السؤال يحتوي على مواقع جغرافية (مدن، دول، إمبراطوريات، ساحات معارك، إلخ)، فيجب عليك **إلزامًا** توفير بيانات الخريطة. هذا أمر حاسم للتصور. قم بتضمين \`center\` و \`zoom\` و \`markers\` للنقاط الرئيسية، وإذا أمكن، \`geojson\` لتصوير الأراضي أو الحركات. إذا لم تكن هناك بيانات جغرافية على الإطلاق، يمكنك حذف هذا المفتاح.
    *   **للعلامات (Markers):** إذا كانت العلامات تتوافق مع أحداث في \`timeline\` (مثل مسار رحلة أو توسع)، فيجب عليك **إلزامًا** تضمين حقل \`year\` في كل علامة. هذا يسمح برسم مسار زمني.
    *   الصيغة: \`{"center": [lat, lng], "zoom": ..., "markers": [{"position": [lat, lng], "popupContent": "...", "year": 711}], "geojson": {...}}\`
-   **\`chart\`**: إذا كانت هناك بيانات كمية قابلة للتصور، فقم بتوفير بيانات الرسم البياني.
    *   **مهم:** يجب أن تكون مفاتيح البيانات (\`xAxisKey\` والعناصر الموجودة في \`dataKeys\`) سلاسل نصية وصفية يمكن قراءتها من قبل الإنسان (على سبيل المثال، "السنة"، "عدد السكان"، وليس "key1" أو "value").
    *   قم بتوفير \`title\` واضح للرسم البياني.
    *   قم بتوفير \`yAxisLabel\` لشرح الوحدات على المحور الصادي (على سبيل المثال، "السكان (بالملايين)").
    *   الصيغة: \`{"title": "نمو السكان المسلمين في العالم", "type": "line", "data": [...], "xAxisKey": "السنة", "dataKeys": ["نسبة السكان المسلمين"], "yAxisLabel": "النسبة المئوية (%)"}\`

تأكد من أن جميع البيانات في JSON متوافقة مع النص السردي. الموضوعية والدقة القائمة على الحقائق التاريخية هي الأهم.`;

const systemInstructionEN_Default = `You are an emeritus professor of Islamic History from Al-Azhar University, specializing in the Islamic Golden Age. Your mission is to enlighten users with profoundly deep, context-rich, and narratively engaging answers.

**Text Answer Structure:**
1.  **Introduction:** Provide a brief and engaging summary of the topic.
2.  **Main Discussion:** Divide into several clear sub-sections with headings (prefixed with '#'). Explain in detail, provide analysis, mention cause-and-effect, and connect to other relevant events or figures. Use bullet points ('*') for lists. Maintain a formal yet flowing and easy-to-understand language.
3.  **Conclusion:** Summarize the main points and provide insight into the topic's historical significance.

**JSON Data Structure (Very Important):**
At the end of your response, ALWAYS include a valid JSON block inside \`\`\`json ... \`\`\`. This JSON object MUST contain all relevant data that can be extracted from your answer. All text values must be in English.

-   **\`timeline\`**: For chronological events. Each event must have a \`year\`, \`title\`, \`description\`, and \`significance\` (explain why the event is important).
    *   Format: \`[{"year": ..., "title": "...", "description": "...", "significance": "..."}]\`
-   **\`figures\`**: For important figures. Each figure must have a \`name\`, \`lifespan\`, \`summary\`, and \`key_contributions\` (a list of their main contributions as an array of strings).
    *   Format: \`[{"name": "...", "lifespan": "...", "summary": "...", "key_contributions": ["...", "..."]}]\`
-   **\`keyTerms\`**: Identify 5-7 key terms. Each term must have a \`term\`, \`definition\`, and \`etymology\` (its word origin or linguistic context if relevant).
    *   Format: \`[{"term": "...", "definition": "...", "etymology": "..."}]\`
-   **\`map\`**: If the query topic contains geographical locations (cities, countries, empires, battlefields, etc.), you **MUST** provide map data. This is crucial for visualization. Include \`center\`, \`zoom\`, \`markers\` for key points, and if possible, \`geojson\` to depict territories or movements. If there is no geographical data at all, you may omit this key.
    *   **For Markers:** If the markers correspond to events in the \`timeline\` (e.g., a travel route or expansion), you **MUST** include a \`year\` field in each marker. This allows for drawing a chronological path.
    *   Format: \`{"center": [lat, lng], "zoom": ..., "markers": [{"position": [lat, lng], "popupContent": "...", "year": 711}], "geojson": {...}}\`
-   **\`chart\`**: If there is quantitative data that can be visualized, provide chart data.
    *   **Important:** Data keys (\`xAxisKey\` and items in \`dataKeys\`) MUST be human-readable, descriptive strings (e.g., "Year", "Population Count", not "key1" or "value").
    *   Provide a clear \`title\` for the chart.
    *   Provide a \`yAxisLabel\` to explain the units on the Y-axis (e.g., "Population (in millions)").
    *   Format: \`{"title": "Global Muslim Population Growth", "type": "line", "data": [...], "xAxisKey": "Year", "dataKeys": ["Muslim Population Share"], "yAxisLabel": "Percentage (%)"}\`

Ensure all data in the JSON is consistent with the narrative text. Objectivity and accuracy based on historical facts are paramount.`;

export const contentService = {
    getSystemPrompts: () => ({
        id: localStorage.getItem(SYSTEM_PROMPT_ID_KEY) || systemInstructionID_Default,
        ar: localStorage.getItem(SYSTEM_PROMPT_AR_KEY) || systemInstructionAR_Default,
        en: localStorage.getItem(SYSTEM_PROMPT_EN_KEY) || systemInstructionEN_Default,
    }),
    saveSystemPrompts: (prompts: { id: string, ar: string, en: string }) => {
        localStorage.setItem(SYSTEM_PROMPT_ID_KEY, prompts.id);
        localStorage.setItem(SYSTEM_PROMPT_AR_KEY, prompts.ar);
        localStorage.setItem(SYSTEM_PROMPT_EN_KEY, prompts.en);
    },
    resetSystemPrompts: () => {
        localStorage.removeItem(SYSTEM_PROMPT_ID_KEY);
        localStorage.removeItem(SYSTEM_PROMPT_AR_KEY);
        localStorage.removeItem(SYSTEM_PROMPT_EN_KEY);
    },
    getDefaultSystemPrompts: () => ({
        id: systemInstructionID_Default,
        ar: systemInstructionAR_Default,
        en: systemInstructionEN_Default,
    }),

    getDirectoryData: async (): Promise<DirectoryData | null> => {
        const response = await apiGet('/encyclopedia/directory');
        if (!response.ok) {
            console.error("Failed to fetch directory data from API");
            return null;
        }
        const data = await response.json();
        return data!;
    },
    saveDirectoryData: async (data: DirectoryData): Promise<void> => {
        const response = await apiPut('/admin/settings/directory', { directory_data: data });
        if (!response.ok) {
            throw new Error('Failed to save directory data');
        }
    },
};
// --- END: CONTENT SERVICE ---

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const isValidGeoJSON = (geojson: any): geojson is FeatureCollection => {
  if (!geojson || typeof geojson !== 'object') return false;

  const type = geojson.type;
  if (typeof type !== 'string') return false;

  const validTypes = [
    "Point", "MultiPoint", "LineString", "MultiLineString",
    "Polygon", "MultiPolygon", "GeometryCollection",
    "Feature", "FeatureCollection"
  ];

  if (!validTypes.includes(type)) return false;

  if (type === 'FeatureCollection') {
    return Array.isArray(geojson.features);
  }
  if (type === 'Feature') {
    return 'geometry' in geojson;
  }
  if (type === 'GeometryCollection') {
    return Array.isArray(geojson.geometries);
  }
  
  if (["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(type)) {
      return Array.isArray(geojson.coordinates);
  }

  return false;
};


const parseResponse = (responseText: string) => {
  console.log('Parsing response text:', responseText.substring(0, 200) + '...');
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = responseText.match(jsonBlockRegex);

  if (match && match[1]) {
    console.log('Found JSON block in response');
    try {
      const cleanedText = responseText.replace(jsonBlockRegex, '').trim();
      const jsonData = JSON.parse(match[1]);
      console.log('Parsed JSON data:', jsonData);

      const mapData = jsonData.map;
      if (mapData && mapData.geojson && !isValidGeoJSON(mapData.geojson)) {
        console.warn("Invalid GeoJSON received from API, discarding it:", mapData.geojson);
        mapData.geojson = undefined;
      }

      const parsed = {
        text: cleanedText,
        chart: jsonData.chart,
        map: mapData,
        keyTerms: jsonData.keyTerms,
        timeline: jsonData.timeline,
        figures: jsonData.figures,
      };
      console.log('Parsed response:', parsed);
      return parsed;
    } catch (e) {
      console.error("Error parsing JSON from response:", e);
      // If JSON is invalid, return only the text part
      const cleanedText = responseText.replace(jsonBlockRegex, '').trim();
      return { text: cleanedText, chart: undefined, map: undefined, keyTerms: undefined, timeline: undefined, figures: undefined };
    }
  }

  console.log('No JSON block found, returning text only');
  // No JSON block found, return the whole text
  return { text: responseText.trim(), chart: undefined, map: undefined, keyTerms: undefined, timeline: undefined, figures: undefined };
};


export const fetchAnswer = async (query: string): Promise<MultiLangGeminiResponse> => {
  try {
    const languages: LanguageCode[] = ['id', 'ar', 'en'];
    const systemInstructions = contentService.getSystemPrompts();

    const textPromises = languages.map(lang => 
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          systemInstruction: systemInstructions[lang],
          tools: [{ googleSearch: {} }],
        },
      })
    );
    
    const imagePrompt = `An artistic, high-quality photograph suitable for an encyclopedia, depicting: ${query}. Style: realistic, detailed, historical context.`;
    // const imagePromise = ai.models.generateImages({
    //     model: 'imagen-4.0-generate-001',
    //     prompt: imagePrompt,
    //     config: {
    //       numberOfImages: 1,
    //       outputMimeType: 'image/jpeg',
    //       aspectRatio: '16:9',
    //     },
    // }).catch(err => {
    //     console.error("Image generation failed:", err);
    //     return null;
    // });

    const imagePromise = fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=576&model=turbo&nologo=true`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch image from pollinations.ai');
            }
            return response.blob();
        })
        .then(blob => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    // Remove the data URL prefix to get just the base64
                    const base64Data = base64.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        })
        .catch(err => {
            console.error("Image generation failed:", err);
            return null;
        });

    const [idResponse, arResponse, enResponse, imageResponse]: [GenerateContentResponse, GenerateContentResponse, GenerateContentResponse, string | null] = await Promise.all([textPromises[0], textPromises[1], textPromises[2], imagePromise]);

    const responses = [idResponse, arResponse, enResponse];

    const generatedImage = imageResponse;

    const multiLangResponse: Partial<MultiLangGeminiResponse> = {};

    for (let i = 0; i < languages.length; i++) {
      const lang = languages[i];
      const rawResponse = responses[i];

      if (!rawResponse.text) {
        throw new Error(`AI response for language '${lang}' was empty.`);
      }

      const parsedData = parseResponse(rawResponse.text);

      // FIX: The `groundingChunks` from the API has optional `uri` and `title` properties,
      // which conflicts with our stricter local `GroundingChunk` type.
      // We filter out any chunks that are missing a URI and ensure the title has a fallback value (the URI itself).
      const groundingChunks = rawResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources: GroundingChunk[] = groundingChunks
        .filter(chunk => chunk.web?.uri)
        .map(chunk => ({
          web: {
            uri: chunk.web.uri!,
            title: chunk.web.title || chunk.web.uri!,
          },
        }));

      multiLangResponse[lang] = {
        text: parsedData.text,
        sources: sources,
        chart: parsedData.chart || undefined,
        map: parsedData.map || undefined,
        keyTerms: parsedData.keyTerms || undefined,
        generatedImage: generatedImage,
        accessDate: new Date().toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' }),
        timeline: parsedData.timeline || undefined,
        figures: parsedData.figures || undefined,
      };
    }
    
    if (!multiLangResponse.id || !multiLangResponse.ar || !multiLangResponse.en) {
      throw new Error('Failed to generate responses for all languages.');
    }

    return multiLangResponse as MultiLangGeminiResponse;

  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
        throw new Error('API Key is invalid or not set correctly.');
    }
    throw new Error("An error occurred while fetching the answer. Please try again.");
  }
};