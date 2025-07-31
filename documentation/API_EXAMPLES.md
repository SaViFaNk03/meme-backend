# � API REFERENCE - MEME MUSEUM

> **Documentazione completa degli endpoint per il colloquio tecnico**

## � AUTENTICAZIONE

### **POST /signup** - Registrazione
```http
POST http://localhost:3000/signup
Content-Type: application/json

{
  "name": "Mario",
  "surname": "Rossi",
  "username": "mario123",
  "email": "mario@email.com",
  "password": "password123"
}
```

**Response 201**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "mario123",
    "email": "mario@email.com",
    "name": "Mario",
    "surname": "Rossi"
  }
}
```

### **POST /login** - Autenticazione
```http
POST http://localhost:3000/login
Content-Type: application/json

{
  "username": "mario123",
  "password": "password123"
}
```

**Response 200**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "mario123"
  },
  "message": "Login successful"
}
```

---

## 🖼️ GESTIONE MEME

### **GET /memes** - Lista meme (Pubblica)
```http
GET http://localhost:3000/memes?page=1&limit=10&sortBy=votes&tags=funny,cats
```

**Parametri Query**:
- `page`: Numero pagina (default: 1)
- `limit`: Elementi per pagina (default: 10)
- `sortBy`: Campo ordinamento (`uploadDate`, `votes`, `views`)
- `order`: Direzione (`ASC`, `DESC`)
- `tags`: Filtro tag (comma-separated)

**Response 200**:
```json
{
  "memes": [
    {
      "id": 1,
      "title": "Meme Divertente",
      "description": "Un meme molto divertente",
      "imageUrl": "http://localhost:3000/uploads/meme-123.jpg",
      "upvotes": 15,
      "downvotes": 2,
      "views": 234,
      "uploadDate": "2025-01-15T10:30:00.000Z",
      "User": {
        "username": "mario123"
      },
      "Tags": [
        { "name": "funny", "color": "#ff6b6b" },
        { "name": "cats", "color": "#4ecdc4" }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

### **GET /meme/:id** - Dettaglio meme (Pubblica)
```http
GET http://localhost:3000/meme/1
```

**Response 200**:
```json
{
  "id": 1,
  "title": "Meme Divertente",
  "description": "Un meme molto divertente",
  "imageUrl": "http://localhost:3000/uploads/meme-123.jpg",
  "upvotes": 15,
  "downvotes": 2,
  "views": 235,
  "uploadDate": "2025-01-15T10:30:00.000Z",
  "author": {
    "id": 1,
    "username": "mario123",
    "name": "Mario",
    "surname": "Rossi"
  },
  "tags": [
    { "id": 1, "name": "funny", "color": "#ff6b6b" },
    { "id": 2, "name": "cats", "color": "#4ecdc4" }
  ],
  "votes": {
    "upvotes": 15,
    "downvotes": 2,
    "score": 13,
    "total": 17
  }
}
```

### **POST /memes** - Carica meme (Protetta)
```http
POST http://localhost:3000/memes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Nuovo Meme",
  "description": "Descrizione del meme",
  "imageUrl": "https://example.com/image.jpg",
  "tags": ["funny", "new"]
}
```

**Response 201**:
```json
{
  "message": "Meme created successfully",
  "meme": {
    "id": 2,
    "title": "Nuovo Meme",
    "description": "Descrizione del meme",
    "imageUrl": "https://example.com/image.jpg",
    "userId": 1,
    "upvotes": 0,
    "downvotes": 0,
    "views": 0,
    "uploadDate": "2025-01-15T11:00:00.000Z"
  }
}
```

### **POST /memes/upload** - Upload con file (Protetta)
```http
POST http://localhost:3000/memes/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

title=Meme con Upload
description=Caricato dal form
image=[FILE_BINARY]
tags=["uploaded", "demo"]
```

### **POST /memes/:id/vote** - Vota meme (Protetta)
```http
POST http://localhost:3000/memes/1/vote
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "isUpvote": true
}
```

**Response 200**:
```json
{
  "message": "Voto registrato con successo",
  "upvotes": 16,
  "downvotes": 2
}
```

---

## 🏷️ GESTIONE TAG

### **GET /tags** - Lista tag
```http
GET http://localhost:3000/tags
```

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "funny",
    "description": "Meme divertenti",
    "color": "#ff6b6b",
    "memeCount": 25
  },
  {
    "id": 2,
    "name": "cats",
    "description": "Meme con gatti",
    "color": "#4ecdc4",
    "memeCount": 18
  }
]
```

---

## 🎯 ENDPOINT SPECIALI

### **GET /memes/meme-of-the-day** - Meme del giorno
```http
GET http://localhost:3000/memes/meme-of-the-day
```

**Algoritmo**: Meme con più upvotes caricato oggi, fallback al più votato in assoluto.

---

## ❌ GESTIONE ERRORI

### **Errori Comuni**

**401 Unauthorized**:
```json
{
  "error": "Token not provided"
}
```

**400 Bad Request**:
```json
{
  "error": "Invalid meme ID"
}
```

**404 Not Found**:
```json
{
  "error": "Meme not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 ESEMPI TESTING

### **cURL Examples**
```bash
# Test completo flusso
# 1. Registrazione
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","name":"Test","surname":"User","email":"test@test.com"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' | jq -r '.token')

# 3. Lista meme
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/memes

# 4. Voto meme
curl -X POST http://localhost:3000/memes/1/vote \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isUpvote": true}'
```

### **JavaScript Fetch**
```javascript
// Setup base
const API_BASE = 'http://localhost:3000';
let authToken = localStorage.getItem('token');

// Helper function
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Esempi utilizzo
const login = async (username, password) => {
  const result = await apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  authToken = result.token;
  localStorage.setItem('token', authToken);
  return result;
};

const loadMemes = async (page = 1, tags = '') => {
  return apiCall(`/memes?page=${page}&tags=${tags}`);
};

const voteMeme = async (memeId, isUpvote) => {
  return apiCall(`/memes/${memeId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ isUpvote })
  });
};
```

---

## 🔒 MIDDLEWARE DI SICUREZZA

### **authVerification Middleware**
Applica verifica JWT a rotte protette:

```javascript
// Verifica header Authorization
const token = req.headers.authorization;
if (!token) return res.status(401).json({ message: 'Token not provided' });

// Valida e decodifica JWT
const decoded = jwt.verify(token, SECRET_KEY);
req.user = decoded; // Inietta dati utente
next(); // Procedi al controller
```

### **Rotte Protette**
- `POST /memes` - Creazione meme
- `POST /memes/upload` - Upload file
- `POST /memes/:id/vote` - Votazione
- `POST /memes/:id/comments` - Commenti (futuro)

### **Rotte Pubbliche**
- `GET /memes` - Lista meme
- `GET /meme/:id` - Dettaglio meme
- `GET /tags` - Lista tag
- `POST /signup` - Registrazione
- `POST /login` - Autenticazione

---

**API Reference completa per dimostrazioni tecniche**
}
```

### **3. Ottenere Lista Meme**

```bash
# cURL - Lista base
curl http://localhost:3000/memes

# cURL - Con filtri
curl "http://localhost:3000/memes?page=1&limit=5&sortBy=votes&tags=funny,cats"
```

```javascript
// JavaScript/Fetch
const getMemes = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.tags) queryParams.append('tags', filters.tags.join(','));
  
  const response = await fetch(`http://localhost:3000/memes?${queryParams}`);
  const data = await response.json();
  return data;
};

// Esempio utilizzo
const memes = await getMemes({
  page: 1,
  limit: 10,
  sortBy: 'votes',
  tags: ['funny', 'cats']
});
```

**Response:**
```json
{
  "memes": [
    {
      "id": 1,
      "title": "Gatto divertente",
      "description": "Un gatto molto buffo",
      "imageUrl": "https://example.com/cat.jpg",
      "upvotes": 15,
      "downvotes": 2,
      "views": 120,
      "uploadDate": "2025-07-18T10:00:00.000Z",
      "User": {
        "username": "mario123"
      },
      "Tags": [
        {
          "name": "funny",
          "color": "#FF6B6B"
        },
        {
          "name": "cats",
          "color": "#4ECDC4"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### **4. Ottenere Meme Specifico**

```bash
# cURL
curl http://localhost:3000/meme/1
```

```javascript
// JavaScript/Fetch
const getMeme = async (memeId) => {
  const response = await fetch(`http://localhost:3000/meme/${memeId}`);
  if (response.status === 404) {
    console.log('Meme non trovato');
    return null;
  }
  const data = await response.json();
  return data;
};

const meme = await getMeme(1);
```

**Response:**
```json
{
  "id": 1,
  "title": "Gatto divertente",
  "description": "Un gatto molto buffo",
  "imageUrl": "https://example.com/cat.jpg",
  "upvotes": 15,
  "downvotes": 2,
  "views": 121,
  "uploadDate": "2025-07-18T10:00:00.000Z",
  "User": {
    "username": "mario123",
    "name": "Mario",
    "surname": "Rossi"
  },
  "Tags": [
    {
      "name": "funny",
      "description": "Contenuto divertente",
      "color": "#FF6B6B"
    }
  ],
  "MemeVotes": [
    {
      "isUpvote": true,
      "userId": 1,
      "createdAt": "2025-07-18T10:30:00.000Z"
    }
  ]
}
```

### **5. Creare Nuovo Meme (Protetto)**

```bash
# cURL
curl -X POST http://localhost:3000/memes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Nuovo Meme",
    "description": "Descrizione del mio meme",
    "imageUrl": "https://example.com/newmeme.jpg",
    "tags": ["funny", "original"]
  }'
```

```javascript
// JavaScript/Fetch
const createMeme = async (memeData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/memes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(memeData)
  });
  
  if (response.status === 401) {
    console.log('Non autorizzato - effettua login');
    return null;
  }
  
  const data = await response.json();
  return data;
};

// Esempio utilizzo
const newMeme = await createMeme({
  title: 'Nuovo Meme',
  description: 'Descrizione del mio meme',
  imageUrl: 'https://example.com/newmeme.jpg',
  tags: ['funny', 'original']
});
```

**Response:**
```json
{
  "message": "Meme creato con successo",
  "meme": {
    "id": 2,
    "title": "Nuovo Meme",
    "description": "Descrizione del mio meme",
    "imageUrl": "https://example.com/newmeme.jpg",
    "userId": 1,
    "authorId": 1,
    "uploadDate": "2025-07-18T12:00:00.000Z",
    "upvotes": 0,
    "downvotes": 0,
    "views": 0
  }
}
```

### **6. Votare Meme (Protetto)**

```bash
# cURL - Upvote
curl -X POST http://localhost:3000/memes/1/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "isUpvote": true
  }'

# cURL - Downvote
curl -X POST http://localhost:3000/memes/1/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "isUpvote": false
  }'
```

```javascript
// JavaScript/Fetch
const voteMeme = async (memeId, isUpvote) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/memes/${memeId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isUpvote })
  });
  
  const data = await response.json();
  return data;
};

// Esempi utilizzo
await voteMeme(1, true);  // Upvote
await voteMeme(1, false); // Downvote
```

**Response:**
```json
{
  "message": "Voto registrato con successo"
}
```

### **7. Ottenere Tutti i Tag**

```bash
# cURL
curl http://localhost:3000/tags
```

```javascript
// JavaScript/Fetch
const getTags = async () => {
  const response = await fetch('http://localhost:3000/tags');
  const data = await response.json();
  return data;
};

const tags = await getTags();
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "funny",
    "color": "#FF6B6B"
  },
  {
    "id": 2,
    "name": "cats",
    "color": "#4ECDC4"
  },
  {
    "id": 3,
    "name": "original",
    "color": "#6B7280"
  }
]
```

### **8. Meme del Giorno**

```bash
# cURL
curl http://localhost:3000/memes/meme-of-the-day
```

```javascript
// JavaScript/Fetch
const getMemeOfTheDay = async () => {
  const response = await fetch('http://localhost:3000/memes/meme-of-the-day');
  const data = await response.json();
  return data;
};

const memeOfTheDay = await getMemeOfTheDay();
```

**Response:**
```json
{
  "id": 1,
  "title": "Meme del giorno",
  "description": "Il meme più votato di oggi",
  "imageUrl": "https://example.com/dailymeme.jpg",
  "upvotes": 25,
  "downvotes": 1,
  "views": 200,
  "User": {
    "username": "mario123"
  },
  "Tags": [
    {
      "name": "daily",
      "color": "#FFD93D"
    }
  ]
}
```

## 🔧 CLASSE HELPER JAVASCRIPT

```javascript
// MemeMuseumAPI.js
class MemeMuseumAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Autenticazione
  async signup(userData) {
    return await this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
    }
    
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Meme
  async getMemes(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, Array.isArray(value) ? value.join(',') : value);
      }
    });

    return await this.request(`/memes?${queryParams}`);
  }

  async getMeme(id) {
    return await this.request(`/meme/${id}`);
  }

  async createMeme(memeData) {
    return await this.request('/memes', {
      method: 'POST',
      body: JSON.stringify(memeData)
    });
  }

  async voteMeme(memeId, isUpvote) {
    return await this.request(`/memes/${memeId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ isUpvote })
    });
  }

  async getMemeOfTheDay() {
    return await this.request('/memes/meme-of-the-day');
  }

  // Tag
  async getTags() {
    return await this.request('/tags');
  }

  // Utility
  isAuthenticated() {
    return !!this.token;
  }
}

// Utilizzo
const api = new MemeMuseumAPI();

// Login
await api.login({ username: 'mario123', password: 'password123' });

// Ottieni meme
const memes = await api.getMemes({ page: 1, limit: 10, sortBy: 'votes' });

// Crea meme
const newMeme = await api.createMeme({
  title: 'Nuovo Meme',
  description: 'Descrizione',
  imageUrl: 'https://example.com/image.jpg',
  tags: ['funny']
});

// Vota meme
await api.voteMeme(1, true);
```

## 🚨 GESTIONE ERRORI

```javascript
// Gestione errori completa
const handleAPICall = async (apiCall) => {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message.includes('401')) {
      // Token scaduto o non valido
      localStorage.removeItem('token');
      window.location.href = '/login';
      return { success: false, error: 'Session expired' };
    }
    
    if (error.message.includes('404')) {
      return { success: false, error: 'Resource not found' };
    }
    
    if (error.message.includes('500')) {
      return { success: false, error: 'Server error' };
    }
    
    return { success: false, error: 'Unknown error' };
  }
};

// Utilizzo
const result = await handleAPICall(async () => {
  return await api.getMemes();
});

if (result.success) {
  console.log('Memes:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## 🔄 REAL-TIME UPDATES

```javascript
// Polling per aggiornamenti
class MemeUpdater {
  constructor(api, interval = 30000) {
    this.api = api;
    this.interval = interval;
    this.callbacks = [];
    this.isRunning = false;
  }

  subscribe(callback) {
    this.callbacks.push(callback);
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    const poll = async () => {
      if (!this.isRunning) return;
      
      try {
        const memes = await this.api.getMemes({ sortBy: 'date', limit: 10 });
        this.callbacks.forEach(callback => callback(memes));
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      setTimeout(poll, this.interval);
    };
    
    poll();
  }

  stop() {
    this.isRunning = false;
  }
}

// Utilizzo
const updater = new MemeUpdater(api);
updater.subscribe((memes) => {
  console.log('Nuovi memes:', memes);
  // Aggiorna UI
});
updater.start();
```

## 📱 ESEMPI REACT

```jsx
// Hook personalizzato per API
import { useState, useEffect } from 'react';

const useAPI = () => {
  const [api] = useState(() => new MemeMuseumAPI());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.login(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  useEffect(() => {
    if (api.isAuthenticated()) {
      // Verifica token valido
      api.getMemes({ limit: 1 })
        .then(() => setUser({ authenticated: true }))
        .catch(() => logout());
    }
  }, []);

  return { api, user, login, logout, loading };
};

// Componente Login
const Login = () => {
  const { login, loading } = useAPI();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Redirect dopo login
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Componente Lista Meme
const MemeList = () => {
  const { api } = useAPI();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemes = async () => {
      try {
        const data = await api.getMemes();
        setMemes(data.memes);
      } catch (error) {
        console.error('Error loading memes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMemes();
  }, [api]);

  const handleVote = async (memeId, isUpvote) => {
    try {
      await api.voteMeme(memeId, isUpvote);
      // Ricarica memes per aggiornare voti
      const data = await api.getMemes();
      setMemes(data.memes);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {memes.map(meme => (
        <div key={meme.id}>
          <h3>{meme.title}</h3>
          <img src={meme.imageUrl} alt={meme.title} />
          <p>{meme.description}</p>
          <div>
            <button onClick={() => handleVote(meme.id, true)}>
              👍 {meme.upvotes}
            </button>
            <button onClick={() => handleVote(meme.id, false)}>
              👎 {meme.downvotes}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

*Esempi Pratici - Meme Museum API v1.0.0*
